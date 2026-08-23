// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IStrategyAdapter.sol";

/**
 * @title DemoYieldAdapter
 * @author Oasis Protocol
 *
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ⚠  DEMO PLACEHOLDER — NOT A REAL YIELD-GENERATING PROTOCOL INTEGRATION  ⚠  ║
 * ║                                                                              ║
 * ║  This adapter does not connect to any external lending, staking, or yield    ║
 * ║  protocol. It simply holds tokens on behalf of the MasterVault and reports   ║
 * ║  a totalDeposited() balance.                                                 ║
 * ║                                                                              ║
 * ║  It exists so the full rebalancing flow (MasterVault → RebalanceExecutor →   ║
 * ║  DemoYieldAdapter) can be demonstrated end-to-end on 0G Aristotle mainnet    ║
 * ║  while no suitable yield protocol integration is yet available on 0G Chain.  ║
 * ║                                                                              ║
 * ║  The UI, README, and all docs label this explicitly as illustrative.         ║
 * ║  Any APY shown in the dashboard while this adapter is active is not a real   ║
 * ║  return and is not guaranteed.                                               ║
 * ║                                                                              ║
 * ║  When a real yield integration is available on 0G Chain, replace this with   ║
 * ║  a protocol-specific adapter implementing IStrategyAdapter.                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * @notice Implements IStrategyAdapter for the Oasis rebalancing system on 0G Chain.
 */
contract DemoYieldAdapter is IStrategyAdapter, Ownable {
    using SafeERC20 for IERC20;

    IERC20 private immutable _asset;
    uint256 private _totalDeposited;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address assetToken, address admin) Ownable(admin) {
        require(assetToken != address(0), "DemoYieldAdapter: zero asset");
        _asset = IERC20(assetToken);
    }

    // ─── IStrategyAdapter ────────────────────────────────────────────────────────

    /**
     * @notice Receive tokens from the vault. MasterVault calls transferToAdapter()
     *         which does safeTransfer here first, then this deposit() records it.
     *         In a real adapter, this would supply tokens to a lending protocol.
     */
    function deposit(uint256 amount) external override onlyOwner {
        require(amount > 0, "DemoYieldAdapter: zero amount");
        _totalDeposited += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Return tokens to the vault.
     *         In a real adapter, this would redeem from the lending protocol.
     */
    function withdraw(uint256 amount) external override onlyOwner {
        require(amount > 0, "DemoYieldAdapter: zero amount");
        require(_totalDeposited >= amount, "DemoYieldAdapter: insufficient balance");
        _totalDeposited -= amount;
        _asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function totalDeposited() external view override returns (uint256) {
        return _totalDeposited;
    }

    function adapterName() external pure override returns (string memory) {
        // DEMO: this is a placeholder, not a real protocol name
        return unicode"DemoYieldAdapter (placeholder - no real yield)";
    }

    function asset() external view override returns (address) {
        return address(_asset);
    }
}
