// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice Test stablecoin for local Hardhat testing only.
 *         NOT deployed to 0G Aristotle mainnet — on mainnet, MasterVault
 *         uses a real USDC-equivalent ERC-20 whose address is set at deploy time.
 *         If no native USDC exists on 0G Chain at deployment time, MasterVault
 *         is launched with this mock address for demo purposes, and the README
 *         states this explicitly.
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
