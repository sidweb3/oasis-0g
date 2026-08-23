// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NativeVault
 * @author Oasis Protocol
 * @notice Vault that accepts native 0G token deposits on 0G Chain (Aristotle, chainId 16661).
 *         Mints share tokens (ov0G) representing ownership of deposited 0G.
 *
 *         This is the second vault in the Oasis dual-vault architecture:
 *           MasterVault  — accepts USDC (ERC-20)
 *           NativeVault  — accepts native 0G (the chain's gas token)
 *
 * @dev No MATIC, POL, or Polygon references anywhere.
 *      ReentrancyGuard on all state-changing payable functions.
 *      Pausable escape hatch controlled by PAUSER_ROLE.
 */
contract NativeVault is ERC20, AccessControl, ReentrancyGuard, Pausable {

    // ─── Roles ──────────────────────────────────────────────────────────────────
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant PAUSER_ROLE   = keccak256("PAUSER_ROLE");

    // ─── State ───────────────────────────────────────────────────────────────────
    /// @notice Total native 0G held by this vault (deposited - withdrawn).
    uint256 public totalValueLocked;

    /// @notice Performance fee in basis points on withdrawals (max 500).
    uint256 public performanceFeeBps = 50; // 0.5%
    address public feeRecipient;

    // ─── Events ──────────────────────────────────────────────────────────────────
    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares, uint256 feeCharged);
    event FeeBpsUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);

    // ─── Constructor ─────────────────────────────────────────────────────────────
    /**
     * @param _name        ERC-20 name for share token (e.g. "Oasis 0G Vault").
     * @param _symbol      ERC-20 symbol (e.g. "ov0G").
     * @param _feeRecipient Address that receives withdrawal fees.
     * @param _admin       Address granted DEFAULT_ADMIN_ROLE and PAUSER_ROLE.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _feeRecipient,
        address _admin
    ) ERC20(_name, _symbol) {
        require(_feeRecipient != address(0), "NativeVault: zero feeRecipient");
        require(_admin != address(0), "NativeVault: zero admin");

        feeRecipient = _feeRecipient;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
    }

    // ─── Core ────────────────────────────────────────────────────────────────────

    /**
     * @notice Deposit native 0G and receive vault shares (ov0G).
     * @return shares Number of share tokens minted.
     */
    function deposit() external payable nonReentrant whenNotPaused returns (uint256 shares) {
        require(msg.value > 0, "NativeVault: zero deposit");

        if (totalSupply() == 0 || totalValueLocked == 0) {
            shares = msg.value;
        } else {
            shares = (msg.value * totalSupply()) / totalValueLocked;
        }
        require(shares > 0, "NativeVault: zero shares");

        totalValueLocked += msg.value;
        _mint(msg.sender, shares);

        emit Deposited(msg.sender, msg.value, shares);
    }

    /**
     * @notice Burn share tokens to redeem native 0G.
     *         A performance fee is deducted and forwarded to feeRecipient.
     * @param shares Amount of share tokens to burn.
     * @return amount Net 0G sent to caller after fee.
     */
    function withdraw(uint256 shares) external nonReentrant whenNotPaused returns (uint256 amount) {
        require(shares > 0, "NativeVault: zero shares");
        require(balanceOf(msg.sender) >= shares, "NativeVault: insufficient shares");
        require(totalSupply() > 0, "NativeVault: no supply");

        uint256 gross = (shares * totalValueLocked) / totalSupply();
        require(gross > 0, "NativeVault: zero amount");

        uint256 fee = (gross * performanceFeeBps) / 10000;
        amount      = gross - fee;

        require(address(this).balance >= gross, "NativeVault: insufficient balance");

        totalValueLocked -= gross;
        _burn(msg.sender, shares);

        if (fee > 0) {
            (bool feeSent, ) = feeRecipient.call{value: fee}("");
            require(feeSent, "NativeVault: fee transfer failed");
        }
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "NativeVault: transfer failed");

        emit Withdrawn(msg.sender, amount, shares, fee);
    }

    // ─── View helpers ────────────────────────────────────────────────────────────

    function totalAssets() external view returns (uint256) { return totalValueLocked; }

    function previewDeposit(uint256 amount) external view returns (uint256) {
        if (totalSupply() == 0 || totalValueLocked == 0) return amount;
        return (amount * totalSupply()) / totalValueLocked;
    }

    function previewWithdraw(uint256 shares) external view returns (uint256 net, uint256 fee) {
        if (totalSupply() == 0) return (0, 0);
        uint256 gross = (shares * totalValueLocked) / totalSupply();
        fee = (gross * performanceFeeBps) / 10000;
        net = gross - fee;
    }

    function balanceOfAssets(address user) external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        return (balanceOf(user) * totalValueLocked) / totalSupply();
    }

    function getTVL() external view returns (uint256) { return totalValueLocked; }

    // ─── Admin ───────────────────────────────────────────────────────────────────

    function setPerformanceFeeBps(uint256 _bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_bps <= 500, "NativeVault: fee too high (max 5%)");
        performanceFeeBps = _bps;
        emit FeeBpsUpdated(_bps);
    }

    function setFeeRecipient(address _recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_recipient != address(0), "NativeVault: zero address");
        feeRecipient = _recipient;
        emit FeeRecipientUpdated(_recipient);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    /**
     * @notice Allow the contract to receive plain 0G transfers (from adapters returning funds, etc.)
     */
    receive() external payable { totalValueLocked += msg.value; }
    fallback() external payable { totalValueLocked += msg.value; }
}
