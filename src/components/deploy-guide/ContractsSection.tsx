import { CodeBlock } from "./DeployShared";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MASTER_VAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MasterVault is ERC4626, AccessControl, Pausable {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");

    uint256 public constant MAX_REBALANCE_PERCENT = 2000;
    uint256 public constant MAX_DAILY_REBALANCES = 3;

    struct RebalanceConfig {
        uint256 lastRebalanceTime;
        uint256 dailyRebalanceCount;
    }

    RebalanceConfig public config;
    address public aggLayerBridge;

    event RebalanceExecuted(uint256 timestamp, uint256 amount, string targetChain);

    constructor(IERC20 asset, address _aggLayerBridge)
        ERC4626(asset) ERC20("AggLayer AI Vault", "aggAI")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        aggLayerBridge = _aggLayerBridge;
    }

    function deposit(uint256 assets, address receiver) public override whenNotPaused returns (uint256) {
        return super.deposit(assets, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner) public override whenNotPaused returns (uint256) {
        return super.withdraw(assets, receiver, owner);
    }

    function rebalance(address[] calldata strategies, uint256[] calldata allocations)
        external onlyRole(REBALANCER_ROLE)
    {
        require(strategies.length == allocations.length, "Length mismatch");
        require(_checkCircuitBreakers(), "Circuit breaker triggered");
        config.dailyRebalanceCount++;
        emit RebalanceExecuted(block.timestamp, 0, "Multiple");
    }

    function _checkCircuitBreakers() internal view returns (bool) {
        if (config.dailyRebalanceCount >= MAX_DAILY_REBALANCES) {
            if (block.timestamp > config.lastRebalanceTime + 1 days) return true;
            return false;
        }
        return true;
    }

    function emergencyPause() external onlyRole(MANAGER_ROLE) { _pause(); }
    function emergencyUnpause() external onlyRole(MANAGER_ROLE) { _unpause(); }
}`;

const REBALANCE_EXECUTOR_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RebalanceExecutor is Ownable {
    address public masterVault;

    event ExecutionReceived(bytes data);

    constructor(address _masterVault) Ownable(msg.sender) {
        masterVault = _masterVault;
    }

    function executeStrategy(bytes calldata data) external onlyOwner {
        emit ExecutionReceived(data);
    }
}`;

const MOCK_USDC_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals = 6;

    constructor() ERC20("Mock USDC", "USDC") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10**6);
    }

    function faucet() external {
        _mint(msg.sender, 1000 * 10**6);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}`;

const POL_VAULT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract POLVault is Ownable, ReentrancyGuard {
    string public name = "AggLayer POL Vault";
    string public symbol = "agPOL";

    mapping(address => uint256) public shares;
    uint256 public totalShares;
    uint256 public totalDeposited;

    event Deposited(address indexed user, uint256 amount, uint256 sharesIssued);
    event Withdrawn(address indexed user, uint256 shares, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable nonReentrant returns (uint256 sharesIssued) {
        require(msg.value > 0, "Must deposit > 0");
        if (totalShares == 0 || totalDeposited == 0) {
            sharesIssued = msg.value;
        } else {
            sharesIssued = (msg.value * totalShares) / totalDeposited;
        }
        shares[msg.sender] += sharesIssued;
        totalShares += sharesIssued;
        totalDeposited += msg.value;
        emit Deposited(msg.sender, msg.value, sharesIssued);
    }

    function withdraw(uint256 _shares) external nonReentrant returns (uint256 amount) {
        require(shares[msg.sender] >= _shares, "Insufficient shares");
        amount = (_shares * totalDeposited) / totalShares;
        shares[msg.sender] -= _shares;
        totalShares -= _shares;
        totalDeposited -= amount;
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Withdrawn(msg.sender, _shares, amount);
    }

    function balanceOf(address account) external view returns (uint256) { return shares[account]; }
    function totalAssets() external view returns (uint256) { return totalDeposited; }
    function totalValueLocked() external view returns (uint256) { return totalDeposited; }
    function balanceOfAssets(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (shares[user] * totalDeposited) / totalShares;
    }
    function previewDeposit(uint256 amount) external view returns (uint256) {
        if (totalShares == 0 || totalDeposited == 0) return amount;
        return (amount * totalShares) / totalDeposited;
    }
    function previewWithdraw(uint256 _shares) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (_shares * totalDeposited) / totalShares;
    }

    receive() external payable {}
}`;

export function ContractsSection() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-base">1. MockUSDC.sol</h3>
          <Badge variant="outline" className="text-xs">Testnet only — use real USDC on mainnet</Badge>
        </div>
        <p className="text-sm text-muted-foreground">On mainnet, use real USDC: <code className="bg-muted px-1 rounded text-xs">0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174</code></p>
        <CodeBlock language="solidity" code={MOCK_USDC_CODE} />
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-base">2. MasterVault.sol</h3>
          <Badge variant="outline" className="text-xs">Deploy second</Badge>
        </div>
        <p className="text-sm text-muted-foreground">ERC-4626 vault for USDC deposits. Requires USDC address and AggLayer bridge address.</p>
        <CodeBlock language="solidity" code={MASTER_VAULT_CODE} />
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-base">3. POLVault.sol</h3>
          <Badge variant="outline" className="text-xs">Deploy third</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Native POL deposit vault. No constructor arguments needed.</p>
        <CodeBlock language="solidity" code={POL_VAULT_CODE} />
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-base">4. RebalanceExecutor.sol</h3>
          <Badge variant="outline" className="text-xs">Deploy last</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Requires the MasterVault address as constructor argument.</p>
        <CodeBlock language="solidity" code={REBALANCE_EXECUTOR_CODE} />
      </div>
    </div>
  );
}
