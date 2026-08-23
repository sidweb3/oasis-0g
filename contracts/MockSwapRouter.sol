// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockSwapRouter
 * @notice Test swap router for local Hardhat testing on 0G Chain.
 *         Simulates swapping native 0G tokens for USDC at a fixed 1:1 rate.
 *         NOT deployed to 0G Aristotle mainnet.
 *         NOT a Polygon/MATIC swap — all references updated for 0G Chain.
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockSwapRouter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Simulates swapping native 0G for USDC.
     *         Fixed rate: 1 0G = 1 USDC (simplified for local testing).
     * @param path [W0G, USDC] (ignored in mock, here for API compatibility)
     */
    function exactInput(
        bytes calldata path,
        address recipient,
        uint256 deadline,
        uint256 amountIn
    ) external payable returns (uint256 amountOut) {
        require(msg.value > 0, "Must send native 0G");
        require(deadline >= block.timestamp, "Deadline passed");

        // Native 0G has 18 decimals, USDC mock has 18 decimals here
        amountOut = msg.value; // 1:1 for test purposes

        require(usdc.balanceOf(address(this)) >= amountOut, "MockSwapRouter: insufficient USDC");
        usdc.safeTransfer(recipient, amountOut);

        return amountOut;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut)
    {
        require(msg.value > 0, "Must send native 0G");
        amountOut = msg.value;
        usdc.safeTransfer(params.recipient, amountOut);
        return amountOut;
    }

    /**
     * @notice Preview how much USDC you'd receive for a given amount of 0G.
     */
    function quoteExactInputSingle(address, address, uint24, uint256 amountIn, uint160)
        external pure returns (uint256)
    {
        return amountIn; // 1:1
    }

    receive() external payable {}
    fallback() external payable {}

    /**
     * @notice Fund this router with USDC for testing.
     */
    function fund(uint256 amount) external {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
    }
}
