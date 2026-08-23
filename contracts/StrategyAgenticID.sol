// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StrategyAgenticID
 * @author Oasis Protocol
 * @notice ERC-721 token that represents a tokenized yield strategy identity — an "Agentic ID"
 *         for the AI model governing the Oasis vault system on 0G Chain.
 *
 *         This implements the 0G Agentic ID concept (https://docs.0g.ai/developer-hub/building-on-0g/agentic-id/overview)
 *         as an ERC-721 where each token represents one AI strategy configuration.
 *
 *         Key design decisions:
 *         - Encrypted metadata (model config, strategy params) is stored on 0G Storage;
 *           the on-chain token holds only the content hash reference.
 *         - On transfer, the full performance history is carried forward. History is stored
 *           by tokenId in a mapping, so it survives ownership changes without reset.
 *         - Only one strategy token exists per vault deployment (the "active strategy").
 *           Future versions may support multiple competing strategies.
 *
 * @dev Storage of decision history:
 *      Each time a rebalance executes, the RebalanceExecutor emits a RebalanceExecuted event
 *      with a storageRef (0G Storage root hash). The relayer also calls recordDecision() here
 *      to push the storage reference into the on-chain history array for the token.
 *      This enables the frontend to enumerate all decisions tied to a strategy token
 *      without reading every event from block 0.
 */
contract StrategyAgenticID is ERC721, AccessControl {

    // ─── Roles ──────────────────────────────────────────────────────────────────
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");
    bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");

    // ─── Structs ─────────────────────────────────────────────────────────────────
    struct StrategyMetadata {
        /// @dev 0G Storage root hash of the (encrypted) strategy config JSON.
        string  storageRef;
        /// @dev Human-readable name of the strategy.
        string  name;
        /// @dev Timestamp of when this strategy was minted / activated.
        uint256 activatedAt;
        /// @dev Total number of rebalance decisions recorded for this strategy.
        uint256 decisionCount;
    }

    struct DecisionRecord {
        /// @dev 0G Storage root hash of the decision JSON (inputs, output, reasoning).
        string  storageRef;
        /// @dev keccak256 of the decision payload — also emitted on-chain by RebalanceExecutor.
        bytes32 decisionHash;
        /// @dev Block timestamp when this decision was recorded.
        uint256 timestamp;
    }

    // ─── State ───────────────────────────────────────────────────────────────────
    uint256 private _nextTokenId;

    mapping(uint256 => StrategyMetadata)  public metadata;
    mapping(uint256 => DecisionRecord[])  private _history;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event StrategyMinted(uint256 indexed tokenId, address indexed owner, string storageRef, string name);
    event DecisionRecorded(uint256 indexed tokenId, uint256 decisionIndex, bytes32 decisionHash, string storageRef);
    event StorageRefUpdated(uint256 indexed tokenId, string newStorageRef);

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor(address _admin) ERC721("Oasis Strategy Agentic ID", "OSAID") {
        require(_admin != address(0), "StrategyAgenticID: zero admin");
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
    }

    // ─── Core ────────────────────────────────────────────────────────────────────

    /**
     * @notice Mint a new strategy token representing the AI strategy governing the vault.
     *         Typically called once at deployment. Multiple tokens can exist, but only one
     *         is active at a time (enforced off-chain by the relayer configuration).
     *
     * @param to         Address that owns the strategy (e.g. vault deployer or DAO).
     * @param storageRef 0G Storage root hash of the encrypted strategy config.
     * @param name       Human-readable strategy name.
     * @return tokenId   The minted token ID.
     */
    function mintStrategy(address to, string calldata storageRef, string calldata name)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        require(to != address(0), "StrategyAgenticID: zero recipient");
        require(bytes(storageRef).length > 0, "StrategyAgenticID: empty storageRef");
        require(bytes(name).length > 0, "StrategyAgenticID: empty name");

        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        metadata[tokenId] = StrategyMetadata({
            storageRef:    storageRef,
            name:          name,
            activatedAt:   block.timestamp,
            decisionCount: 0
        });

        emit StrategyMinted(tokenId, to, storageRef, name);
    }

    /**
     * @notice Record a rebalance decision in the strategy's on-chain history.
     *         Called by the RECORDER_ROLE (the relayer or RebalanceExecutor).
     *         History is keyed by tokenId and survives ownership transfers — this is the
     *         core differentiator: transferring the Agentic ID token carries the full
     *         track record forward. There is no reset on transfer.
     *
     * @param tokenId      The strategy token this decision belongs to.
     * @param storageRef   0G Storage root hash of the decision JSON.
     * @param decisionHash keccak256 of the decision payload (matches RebalanceExecuted event).
     */
    function recordDecision(uint256 tokenId, string calldata storageRef, bytes32 decisionHash)
        external
        onlyRole(RECORDER_ROLE)
    {
        require(_ownerOf(tokenId) != address(0), "StrategyAgenticID: token does not exist");
        require(bytes(storageRef).length > 0, "StrategyAgenticID: empty storageRef");

        _history[tokenId].push(DecisionRecord({
            storageRef:   storageRef,
            decisionHash: decisionHash,
            timestamp:    block.timestamp
        }));

        metadata[tokenId].decisionCount++;

        emit DecisionRecorded(tokenId, _history[tokenId].length - 1, decisionHash, storageRef);
    }

    /**
     * @notice Update the 0G Storage reference for the strategy metadata
     *         (e.g. when model config is updated).
     */
    function updateStorageRef(uint256 tokenId, string calldata newRef)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_ownerOf(tokenId) != address(0), "StrategyAgenticID: token does not exist");
        metadata[tokenId].storageRef = newRef;
        emit StorageRefUpdated(tokenId, newRef);
    }

    // ─── View ────────────────────────────────────────────────────────────────────

    /**
     * @notice Get the full decision history for a strategy token.
     *         This history is preserved across ownership transfers.
     */
    function getHistory(uint256 tokenId) external view returns (DecisionRecord[] memory) {
        return _history[tokenId];
    }

    /**
     * @notice Get a specific decision record by index.
     */
    function getDecision(uint256 tokenId, uint256 index) external view returns (DecisionRecord memory) {
        require(index < _history[tokenId].length, "StrategyAgenticID: index out of bounds");
        return _history[tokenId][index];
    }

    /**
     * @notice Get the number of decisions recorded for a token.
     */
    function decisionCount(uint256 tokenId) external view returns (uint256) {
        return _history[tokenId].length;
    }

    function totalStrategies() external view returns (uint256) {
        return _nextTokenId;
    }

    // ─── ERC-165 override to support both ERC721 and AccessControl ───────────────
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
