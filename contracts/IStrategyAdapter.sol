// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IStrategyAdapter
 * @notice Interface for yield strategy adapters in the Oasis vault system on 0G Chain.
 *         All adapters must implement this interface so the RebalanceExecutor can
 *         move funds between strategies without knowing their internal details.
 */
interface IStrategyAdapter {
    /**
     * @notice Deposit tokens into this strategy.
     * @param amount The amount of tokens to deposit.
     */
    function deposit(uint256 amount) external;

    /**
     * @notice Withdraw tokens from this strategy back to the caller.
     * @param amount The amount of tokens to withdraw.
     */
    function withdraw(uint256 amount) external;

    /**
     * @notice Returns the total token value currently held in this strategy.
     */
    function totalDeposited() external view returns (uint256);

    /**
     * @notice Human-readable name of this adapter, used in decision logs and events.
     */
    function adapterName() external view returns (string memory);

    /**
     * @notice The ERC-20 token this adapter accepts.
     */
    function asset() external view returns (address);
}
