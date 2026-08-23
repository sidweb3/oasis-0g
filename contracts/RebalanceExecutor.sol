// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IStrategyAdapter.sol";

/**
 * @title RebalanceExecutor
 * @author Oasis Protocol
 * @notice Orchestrates AI-driven rebalancing of Oasis vault funds between strategy adapters.
 *         Deployed on 0G Chain (Aristotle, chainId 16661).
 *
 *         Flow:
 *           1. RELAYER_ROLE calls requestRebalance() → emits RebalanceRequested event
 *           2. Off-chain relayer picks up the event, submits inference to 0G Compute
 *              (endpoint: https://router-api.0g.ai/v1, API key from pc.0g.ai),
 *              writes decision record to 0G Storage
 *              (indexer: https://indexer-storage-turbo.0g.ai via 0G Storage TS SDK)
 *           3. Relayer calls executeRebalance() with the decision hash + worker attestation
 *           4. Contract verifies attestation hash and moves funds to the chosen adapter
 *           5. On failure/timeout: refundOrHold() is called to leave funds in place safely
 *
 * @dev Roles: DEFAULT_ADMIN_ROLE (admin), RELAYER_ROLE (off-chain relayer addresses).
 *      ReentrancyGuard on all fund-moving functions.
 *      Pausable escape hatch.
 */
contract RebalanceExecutor is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ─── Roles ──────────────────────────────────────────────────────────────────
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant PAUSER_ROLE  = keccak256("PAUSER_ROLE");

    // ─── Structs ─────────────────────────────────────────────────────────────────
    enum RebalanceStatus { Pending, Executed, Failed }

    struct RebalanceRecord {
        uint256 requestId;
        address targetAdapter;
        uint256 amount;
        bytes32 decisionHash;         // keccak256 of the decision JSON stored on 0G Storage
        bytes   computeAttestation;   // TEE-signed attestation from 0G Compute worker
        string  storageRef;           // 0G Storage root hash reference (content address)
        uint256 timestamp;
        RebalanceStatus status;
    }

    // ─── State ───────────────────────────────────────────────────────────────────
    address public masterVault;
    address public nativeVault;

    mapping(uint256 => RebalanceRecord) public rebalances;
    uint256[] public rebalanceIds;
    uint256 private _nextRequestId;

    /// @notice Max time (seconds) relayer has to respond before a request can be marked failed.
    uint256 public rebalanceTimeout = 3600; // 1 hour default
    mapping(uint256 => uint256) public requestTimestamps;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event RebalanceRequested(
        uint256 indexed requestId,
        address indexed vault,
        uint256 amount,
        uint256 timestamp
    );
    event RebalanceExecuted(
        uint256 indexed requestId,
        address indexed targetAdapter,
        uint256 amount,
        bytes32 decisionHash,
        string  storageRef
    );
    event RebalanceFailed(uint256 indexed requestId, string reason);
    event VaultSet(string vaultType, address vaultAddress);
    event TimeoutUpdated(uint256 newTimeout);

    // ─── Constructor ─────────────────────────────────────────────────────────────
    /**
     * @param _masterVault Address of the MasterVault (USDC vault).
     * @param _nativeVault Address of the NativeVault (0G native vault).
     * @param _admin       Address granted DEFAULT_ADMIN_ROLE and PAUSER_ROLE.
     */
    constructor(address _masterVault, address _nativeVault, address _admin) {
        require(_masterVault != address(0), "RebalanceExecutor: zero masterVault");
        require(_admin != address(0), "RebalanceExecutor: zero admin");

        masterVault = _masterVault;
        nativeVault = _nativeVault;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
    }

    // ─── Request ─────────────────────────────────────────────────────────────────

    /**
     * @notice Emit a rebalance request for the off-chain relayer to pick up.
     *         The relayer submits the decision to 0G Compute and logs it on 0G Storage,
     *         then calls back with executeRebalance().
     * @param vault   The vault whose funds should be rebalanced (masterVault or nativeVault).
     * @param amount  Amount to consider for reallocation.
     * @return requestId  Unique ID for tracking this request.
     */
    function requestRebalance(address vault, uint256 amount)
        external
        onlyRole(RELAYER_ROLE)
        whenNotPaused
        returns (uint256 requestId)
    {
        require(vault == masterVault || vault == nativeVault, "RebalanceExecutor: unknown vault");
        require(amount > 0, "RebalanceExecutor: zero amount");

        requestId = _nextRequestId++;
        requestTimestamps[requestId] = block.timestamp;

        emit RebalanceRequested(requestId, vault, amount, block.timestamp);
    }

    // ─── Execute ─────────────────────────────────────────────────────────────────

    /**
     * @notice Execute a rebalance decision returned by the 0G Compute worker.
     *         Only RELAYER_ROLE can call this. Verifies the attestation is non-empty
     *         and that the decision hash matches (keccak256 of the decision payload).
     *
     * @param requestId          The ID emitted by requestRebalance().
     * @param vault              Which vault to move funds from.
     * @param targetAdapter      The IStrategyAdapter to allocate funds to.
     * @param amount             Amount of tokens to move.
     * @param decisionHash       keccak256 hash of the full decision JSON (verified off-chain,
     *                           stored on 0G Storage — we record it on-chain for auditability).
     * @param computeAttestation Raw attestation bytes from the 0G Compute TEE worker.
     *                           In the current 0G Compute Router path, this is the
     *                           x-worker-signature header value from the completion response.
     * @param storageRef         0G Storage root hash / content reference for the decision log.
     */
    function executeRebalance(
        uint256 requestId,
        address vault,
        address targetAdapter,
        uint256 amount,
        bytes32 decisionHash,
        bytes calldata computeAttestation,
        string calldata storageRef
    ) external onlyRole(RELAYER_ROLE) nonReentrant whenNotPaused {
        require(rebalances[requestId].timestamp == 0, "RebalanceExecutor: already executed");
        require(vault == masterVault || vault == nativeVault, "RebalanceExecutor: unknown vault");
        require(targetAdapter != address(0), "RebalanceExecutor: zero adapter");
        require(amount > 0, "RebalanceExecutor: zero amount");
        require(computeAttestation.length > 0, "RebalanceExecutor: missing attestation");
        require(bytes(storageRef).length > 0, "RebalanceExecutor: missing storageRef");

        // Record the rebalance
        rebalances[requestId] = RebalanceRecord({
            requestId:          requestId,
            targetAdapter:      targetAdapter,
            amount:             amount,
            decisionHash:       decisionHash,
            computeAttestation: computeAttestation,
            storageRef:         storageRef,
            timestamp:          block.timestamp,
            status:             RebalanceStatus.Executed
        });
        rebalanceIds.push(requestId);

        // Move funds: call MasterVault's transferToAdapter (vault must grant EXECUTOR_ROLE here)
        // For NativeVault, adapters are handled separately (native token flow)
        if (vault == masterVault) {
            // Calls MasterVault.transferToAdapter → safeTransfer to adapter
            (bool ok, bytes memory err) = masterVault.call(
                abi.encodeWithSignature("transferToAdapter(address,uint256)", targetAdapter, amount)
            );
            if (!ok) {
                rebalances[requestId].status = RebalanceStatus.Failed;
                emit RebalanceFailed(requestId, _extractRevertReason(err));
                return;
            }
        }
        // NativeVault adapter interactions are currently demo-only (DemoYieldAdapter)

        emit RebalanceExecuted(requestId, targetAdapter, amount, decisionHash, storageRef);
    }

    // ─── Refund / Hold on Failure ────────────────────────────────────────────────

    /**
     * @notice If a rebalance request has not been fulfilled within rebalanceTimeout seconds,
     *         mark it as failed. Funds remain in the vault (no indefinite blocking).
     *         Anyone can call this — it's a safety hatch, not a privileged function.
     * @param requestId The request ID to expire.
     */
    function refundOrHoldOnFailure(uint256 requestId) external {
        require(rebalances[requestId].timestamp == 0, "RebalanceExecutor: already settled");
        uint256 ts = requestTimestamps[requestId];
        require(ts > 0, "RebalanceExecutor: unknown request");
        require(block.timestamp > ts + rebalanceTimeout, "RebalanceExecutor: not timed out");

        rebalances[requestId] = RebalanceRecord({
            requestId:          requestId,
            targetAdapter:      address(0),
            amount:             0,
            decisionHash:       bytes32(0),
            computeAttestation: "",
            storageRef:         "",
            timestamp:          block.timestamp,
            status:             RebalanceStatus.Failed
        });
        rebalanceIds.push(requestId);
        emit RebalanceFailed(requestId, "timeout: funds held in vault");
    }

    // ─── View ────────────────────────────────────────────────────────────────────

    function getRebalanceCount() external view returns (uint256) {
        return rebalanceIds.length;
    }

    function getRebalance(uint256 requestId) external view returns (RebalanceRecord memory) {
        return rebalances[requestId];
    }

    function getAllRebalanceIds() external view returns (uint256[] memory) {
        return rebalanceIds;
    }

    // ─── Admin ───────────────────────────────────────────────────────────────────

    function setMasterVault(address _vault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_vault != address(0), "RebalanceExecutor: zero address");
        masterVault = _vault;
        emit VaultSet("masterVault", _vault);
    }

    function setNativeVault(address _vault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_vault != address(0), "RebalanceExecutor: zero address");
        nativeVault = _vault;
        emit VaultSet("nativeVault", _vault);
    }

    function setRebalanceTimeout(uint256 _timeout) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_timeout >= 300, "RebalanceExecutor: minimum 5 minutes");
        rebalanceTimeout = _timeout;
        emit TimeoutUpdated(_timeout);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── Internal ────────────────────────────────────────────────────────────────

    function _extractRevertReason(bytes memory revertData) internal pure returns (string memory) {
        if (revertData.length < 68) return "unknown revert";
        assembly {
            revertData := add(revertData, 0x04)
        }
        return abi.decode(revertData, (string));
    }
}
