// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MasterVault
 * @author Oasis Protocol
 * @notice Reference Implementation — NOT deployed in current 0G Aristotle mainnet launch.
 *         The current mainnet launch uses NativeVault (native 0G token). MasterVault is preserved
 *         as a reference implementation for future deployment once a real, established stablecoin
 *         infrastructure exists on 0G Chain.
 *
 * @dev Security: AccessControl, ReentrancyGuard, Pausable, SafeERC20.
 */
contract MasterVault is ERC20, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ─── Roles ──────────────────────────────────────────────────────────────────
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    // ─── State ───────────────────────────────────────────────────────────────────
    /// @notice The underlying asset accepted by this vault (e.g. USDC on 0G Chain).
    IERC20 public immutable asset;

    /// @notice Tracks total assets managed by the vault (idle + deployed in adapters).
    uint256 public totalValueLocked;

    /// @notice Strategy adapter allocations in basis points (10000 = 100%).
    mapping(address => uint256) public strategyAllocations;

    /// @notice Performance fee in basis points, charged on withdrawal (max 500 = 5%).
    ///         Fee is taken as native 0G tokens (msg.value) from the withdrawer,
    ///         since 0G Pay (https://pc.0g.ai) is a fiat/compute-credit service
    ///         and does not expose a smart-contract integration path for vault fees.
    ///         This is honestly documented; we do not claim a "0G Pay contract" integration.
    uint256 public performanceFeeBps = 50; // 0.5% default
    address public feeRecipient;

    /// @notice Counter used to generate unique request IDs for rebalance events.
    uint256 private _nextRequestId;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares, uint256 feeCharged);
    event RebalanceRequested(uint256 indexed requestId, uint256 amount, uint256 timestamp);
    event StrategyAdded(address indexed adapter, uint256 allocationBps);
    event StrategyRemoved(address indexed adapter);
    event FeeBpsUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);

    // ─── Constructor ─────────────────────────────────────────────────────────────
    /**
     * @param _asset       The ERC-20 token this vault accepts (USDC on 0G Chain).
     * @param _name        ERC-20 name for the vault share token (e.g. "Oasis USDC Vault").
     * @param _symbol      ERC-20 symbol for the share token (e.g. "ovUSDC").
     * @param _feeRecipient Address that receives withdrawal fees.
     * @param _admin       Address that is granted DEFAULT_ADMIN_ROLE and PAUSER_ROLE.
     */
    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _feeRecipient,
        address _admin
    ) ERC20(_name, _symbol) {
        require(_asset != address(0), "MasterVault: zero asset");
        require(_feeRecipient != address(0), "MasterVault: zero feeRecipient");
        require(_admin != address(0), "MasterVault: zero admin");

        asset        = IERC20(_asset);
        feeRecipient = _feeRecipient;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
    }

    // ─── ERC-4626 Core ──────────────────────────────────────────────────────────

    /**
     * @notice Total assets under management: idle balance in vault + TVL deployed to adapters.
     */
    function totalAssets() public view returns (uint256) {
        return totalValueLocked;
    }

    /**
     * @notice Convert an asset amount to shares using the current exchange rate.
     */
    function convertToShares(uint256 assets_) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return assets_;
        return (assets_ * supply) / totalAssets();
    }

    /**
     * @notice Convert a share amount to assets using the current exchange rate.
     */
    function convertToAssets(uint256 shares_) public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return shares_;
        return (shares_ * totalAssets()) / supply;
    }

    /**
     * @notice Preview how many shares would be minted for `assets` USDC deposited.
     */
    function previewDeposit(uint256 assets_) external view returns (uint256) {
        return convertToShares(assets_);
    }

    /**
     * @notice Preview how much USDC would be returned for burning `shares`.
     *         Does not account for withdrawal fee (shown separately in previewWithdrawFee).
     */
    function previewWithdraw(uint256 shares_) external view returns (uint256 assets_, uint256 fee_) {
        assets_ = convertToAssets(shares_);
        fee_    = (assets_ * performanceFeeBps) / 10000;
        assets_ = assets_ - fee_;
    }

    // ─── Deposit / Withdraw ──────────────────────────────────────────────────────

    /**
     * @notice Deposit USDC into the vault and receive share tokens.
     * @param assets   Amount of USDC to deposit.
     * @param receiver Address that receives the share tokens.
     * @return shares  The number of share tokens minted.
     */
    function deposit(uint256 assets, address receiver)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        require(assets > 0, "MasterVault: zero deposit");
        require(receiver != address(0), "MasterVault: zero receiver");

        shares = convertToShares(assets);
        require(shares > 0, "MasterVault: zero shares");

        asset.safeTransferFrom(msg.sender, address(this), assets);
        totalValueLocked += assets;
        _mint(receiver, shares);

        emit Deposited(receiver, assets, shares);
    }

    /**
     * @notice Withdraw assets by burning vault shares.
     *         A performance fee (in asset tokens) is deducted and sent to feeRecipient.
     * @param shares   Number of share tokens to burn.
     * @param receiver Address that receives the net USDC.
     * @param owner    Address whose shares are burned.
     * @return assets  Net USDC transferred to receiver after fee.
     */
    function withdraw(
        uint256 shares,
        address receiver,
        address owner
    ) external nonReentrant whenNotPaused returns (uint256 assets) {
        require(shares > 0, "MasterVault: zero shares");
        require(receiver != address(0), "MasterVault: zero receiver");

        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            require(allowed >= shares, "MasterVault: insufficient allowance");
            _approve(owner, msg.sender, allowed - shares);
        }

        uint256 gross = convertToAssets(shares);
        uint256 fee   = (gross * performanceFeeBps) / 10000;
        assets        = gross - fee;

        require(asset.balanceOf(address(this)) >= gross, "MasterVault: insufficient idle balance");

        _burn(owner, shares);
        totalValueLocked -= gross;

        if (fee > 0) {
            asset.safeTransfer(feeRecipient, fee);
        }
        asset.safeTransfer(receiver, assets);

        emit Withdrawn(receiver, assets, shares, fee);
    }

    // ─── Rebalance ───────────────────────────────────────────────────────────────

    /**
     * @notice Emit a RebalanceRequested event that the off-chain relayer picks up.
     *         The relayer then submits an inference job to 0G Compute
     *         (https://router-api.0g.ai/v1, API key from pc.0g.ai),
     *         logs the decision to 0G Storage (indexer: https://indexer-storage-turbo.0g.ai),
     *         and calls back via executeRebalance on RebalanceExecutor.
     * @param amount  The amount to consider for reallocation.
     * @return requestId  Unique ID for this rebalance request.
     */
    function requestRebalance(uint256 amount)
        external
        onlyRole(EXECUTOR_ROLE)
        whenNotPaused
        returns (uint256 requestId)
    {
        require(amount > 0, "MasterVault: zero amount");
        requestId = _nextRequestId++;
        emit RebalanceRequested(requestId, amount, block.timestamp);
    }

    /**
     * @notice Authorize a strategy adapter to receive funds from the vault.
     *         Called by EXECUTOR_ROLE (the RebalanceExecutor contract).
     * @param adapter      Address of the IStrategyAdapter implementation.
     * @param allocationBps Allocation in basis points (informational only; actual movement
     *                     is done by the executor's transferToAdapter call).
     */
    function setStrategyAdapter(address adapter, uint256 allocationBps)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(adapter != address(0), "MasterVault: zero adapter");
        require(allocationBps <= 10000, "MasterVault: bps > 10000");
        strategyAllocations[adapter] = allocationBps;
        emit StrategyAdded(adapter, allocationBps);
    }

    /**
     * @notice Remove a strategy adapter (set its allocation to 0).
     */
    function removeStrategyAdapter(address adapter)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        delete strategyAllocations[adapter];
        emit StrategyRemoved(adapter);
    }

    /**
     * @notice Transfer tokens to a strategy adapter (called by executor after AI decision).
     *         Only EXECUTOR_ROLE can call this.
     */
    function transferToAdapter(address adapter, uint256 amount)
        external
        onlyRole(EXECUTOR_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(strategyAllocations[adapter] > 0, "MasterVault: adapter not authorized");
        require(amount > 0 && asset.balanceOf(address(this)) >= amount, "MasterVault: bad amount");
        asset.safeTransfer(adapter, amount);
    }

    /**
     * @notice Pull tokens back from a strategy adapter (called by executor on reallocation).
     */
    function recallFromAdapter(address adapter, uint256 amount)
        external
        onlyRole(EXECUTOR_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(amount > 0, "MasterVault: zero amount");
        asset.safeTransferFrom(adapter, address(this), amount);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────────

    function setPerformanceFeeBps(uint256 _bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_bps <= 500, "MasterVault: fee too high (max 5%)");
        performanceFeeBps = _bps;
        emit FeeBpsUpdated(_bps);
    }

    function setFeeRecipient(address _recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_recipient != address(0), "MasterVault: zero address");
        feeRecipient = _recipient;
        emit FeeRecipientUpdated(_recipient);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function getTVL() external view returns (uint256) { return totalValueLocked; }

    /**
     * @notice Emergency withdrawal of any token. Only DEFAULT_ADMIN_ROLE.
     */
    function emergencyWithdraw(address token, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
