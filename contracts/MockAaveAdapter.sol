// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockAaveAdapter
 * @dev Simulates Aave lending pool for yield generation on testnet
 * In production, this would interact with real Aave contracts
 */
contract MockAaveAdapter {
    using SafeERC20 for IERC20;

    // Track deposits per user
    mapping(address => uint256) public deposits;

    // Mock APY: 5% annual (stored as basis points)
    uint256 public constant MOCK_APY = 500; // 5.00%

    // Track last update time for interest calculation
    mapping(address => uint256) public lastUpdateTime;

    IERC20 public immutable asset;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _asset) {
        asset = IERC20(_asset);
    }

    /**
     * @dev Deposit assets to earn yield
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        // Update accrued interest before new deposit
        _updateInterest(msg.sender);

        // Transfer tokens from user
        asset.safeTransferFrom(msg.sender, address(this), amount);

        deposits[msg.sender] += amount;
        lastUpdateTime[msg.sender] = block.timestamp;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw assets plus earned interest
     */
    function withdraw(uint256 amount) external {
        _updateInterest(msg.sender);

        require(deposits[msg.sender] >= amount, "Insufficient balance");

        deposits[msg.sender] -= amount;
        asset.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Get total balance including accrued interest
     */
    function balanceOf(address user) external view returns (uint256) {
        return deposits[user] + _calculateInterest(user);
    }

    /**
     * @dev Calculate accrued interest (simplified)
     * In production, this would use Aave's rate model
     */
    function _calculateInterest(address user) internal view returns (uint256) {
        if (deposits[user] == 0) return 0;

        uint256 timeElapsed = block.timestamp - lastUpdateTime[user];
        // Interest = principal * APY * time / (365 days * 10000 basis points)
        return (deposits[user] * MOCK_APY * timeElapsed) / (365 days * 10000);
    }

    /**
     * @dev Update user's balance with accrued interest
     */
    function _updateInterest(address user) internal {
        uint256 interest = _calculateInterest(user);
        if (interest > 0) {
            deposits[user] += interest;
        }
        lastUpdateTime[user] = block.timestamp;
    }

    /**
     * @dev Get current APY
     */
    function getCurrentAPY() external pure returns (uint256) {
        return MOCK_APY; // Returns 500 = 5.00%
    }
}
