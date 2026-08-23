// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Reference Implementation — NOT deployed in current 0G Aristotle mainnet launch.
 *         Reserved for future stablecoin vault deployment once a real, established stablecoin
 *         infrastructure is deployed on 0G Chain.
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        // Mint 10 million USDC (6 decimal adjusted to 18 for simplicity)
        _mint(msg.sender, 10_000_000 * 1e18);
    }

    /// @notice Public faucet — anyone can mint 10,000 USDC for testing.
    function faucet() external {
        _mint(msg.sender, 10_000 * 1e18);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
