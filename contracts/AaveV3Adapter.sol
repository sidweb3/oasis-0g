// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Aave V3 Interface
interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IAToken is IERC20 {
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
}

/**
 * @title AaveV3Adapter
 * @notice THIS CONTRACT IS NOT USED IN THE OASIS 0G DEPLOYMENT.
 *         It is retained in the repository as a reference implementation showing
 *         how a real Aave V3 adapter WOULD look if Aave V3 were available on 0G Chain.
 *         Aave V3 is not deployed on 0G Aristotle mainnet.
 *         Use DemoYieldAdapter.sol as the active adapter until a real protocol is available.
 *
 *         Aave V3 Pool address below is for Polygon PoS — NOT for 0G Chain.
 *         Do not deploy this contract to 0G Chain with this address.
 */
contract AaveV3Adapter is Ownable {
    using SafeERC20 for IERC20;

    // Real Aave V3 Pool on Polygon PoS: 0x794a61358D6845594F94dc1DB02A252b5b4814aD
    IPool public constant AAVE_POOL = IPool(0x794a61358D6845594F94dc1DB02A252b5b4814aD);

    // Real aUSDC token on Polygon
    IAToken public immutable aToken;
    IERC20 public immutable asset;

    address public vault;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _asset, address _aToken) Ownable(msg.sender) {
        asset = IERC20(_asset);
        aToken = IAToken(_aToken);
        vault = msg.sender;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
    }

    /**
     * @dev Deposit assets into REAL Aave V3
     */
    function deposit(uint256 amount) external onlyVault {
        require(amount > 0, "Amount must be > 0");

        // Transfer tokens from vault
        asset.safeTransferFrom(msg.sender, address(this), amount);

        // Approve Aave pool
        asset.approve(address(AAVE_POOL), amount);

        // Supply to REAL Aave V3
        AAVE_POOL.supply(address(asset), amount, address(this), 0);

        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw assets from REAL Aave V3
     */
    function withdraw(uint256 amount) external onlyVault {
        // Withdraw from REAL Aave V3
        uint256 withdrawn = AAVE_POOL.withdraw(address(asset), amount, msg.sender);

        emit Withdrawn(msg.sender, withdrawn);
    }

    /**
     * @dev Get balance with REAL accrued interest from Aave
     */
    function balanceOf(address user) external view returns (uint256) {
        // aTokens represent 1:1 with deposited amount + interest
        return aToken.balanceOf(address(this));
    }

    /**
     * @dev Get current REAL APY from Aave
     * Note: In production, you'd query Aave's data provider
     */
    function getCurrentAPY() external pure returns (uint256) {
        // This would query real Aave liquidity rates
        // For now, returns placeholder - real APY varies
        return 350; // Example: 3.50% (real Aave APY changes dynamically)
    }
}
