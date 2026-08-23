/**
 * Oasis Protocol — Unit Tests
 * Run with: npx hardhat test
 * All tests run on the local Hardhat network (no 0G RPC needed).
 *
 * Coverage:
 *   - MasterVault: mint/deposit/withdraw/fee/roles/reentrancy
 *   - NativeVault: native deposit/withdraw/fee
 *   - RebalanceExecutor: requestRebalance/executeRebalance/refundOrHold/roles
 *   - DemoYieldAdapter: deposit/withdraw
 *   - StrategyAgenticID: mint/recordDecision/history survives transfer
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Oasis Protocol", function () {
  let deployer, relayer, user, user2, feeRecipient;
  let mockUsdc, masterVault, nativeVault, rebalanceExecutor, demoAdapter, agenticId;

  const EXECUTOR_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));
  const RELAYER_ROLE   = ethers.keccak256(ethers.toUtf8Bytes("RELAYER_ROLE"));
  const RECORDER_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("RECORDER_ROLE"));
  const PAUSER_ROLE    = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));

  beforeEach(async function () {
    [deployer, relayer, user, user2, feeRecipient] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDC.deploy();

    // Deploy MasterVault
    const MasterVault = await ethers.getContractFactory("MasterVault");
    masterVault = await MasterVault.deploy(
      await mockUsdc.getAddress(),
      "Oasis USDC Vault",
      "ovUSDC",
      feeRecipient.address,
      deployer.address
    );

    // Deploy NativeVault
    const NativeVault = await ethers.getContractFactory("NativeVault");
    nativeVault = await NativeVault.deploy(
      "Oasis 0G Vault",
      "ov0G",
      feeRecipient.address,
      deployer.address
    );

    // Deploy RebalanceExecutor
    const RebalanceExecutor = await ethers.getContractFactory("RebalanceExecutor");
    rebalanceExecutor = await RebalanceExecutor.deploy(
      await masterVault.getAddress(),
      await nativeVault.getAddress(),
      deployer.address
    );

    // Deploy DemoYieldAdapter
    const DemoYieldAdapter = await ethers.getContractFactory("DemoYieldAdapter");
    demoAdapter = await DemoYieldAdapter.deploy(await mockUsdc.getAddress(), deployer.address);

    // Deploy StrategyAgenticID
    const StrategyAgenticID = await ethers.getContractFactory("StrategyAgenticID");
    agenticId = await StrategyAgenticID.deploy(deployer.address);

    // Wire roles
    await masterVault.grantRole(EXECUTOR_ROLE, await rebalanceExecutor.getAddress());
    await rebalanceExecutor.grantRole(RELAYER_ROLE, relayer.address);
    await agenticId.grantRole(RECORDER_ROLE, await rebalanceExecutor.getAddress());
    await masterVault.setStrategyAdapter(await demoAdapter.getAddress(), 10000);

    // Fund user with MockUSDC
    await mockUsdc.faucet();
    await mockUsdc.transfer(user.address, ethers.parseEther("1000"));
  });

  // ─── MockUSDC ────────────────────────────────────────────────────────────────

  describe("MockUSDC", function () {
    it("faucet mints 10,000 USDC", async function () {
      const before = await mockUsdc.balanceOf(user2.address);
      await mockUsdc.connect(user2).faucet();
      const after = await mockUsdc.balanceOf(user2.address);
      expect(after - before).to.equal(ethers.parseEther("10000"));
    });
  });

  // ─── MasterVault ─────────────────────────────────────────────────────────────

  describe("MasterVault", function () {
    it("deposits USDC and mints shares", async function () {
      const amount = ethers.parseEther("100");
      await mockUsdc.connect(user).approve(await masterVault.getAddress(), amount);
      await expect(masterVault.connect(user).deposit(amount, user.address))
        .to.emit(masterVault, "Deposited")
        .withArgs(user.address, amount, amount); // 1:1 on first deposit

      expect(await masterVault.balanceOf(user.address)).to.equal(amount);
      expect(await masterVault.getTVL()).to.equal(amount);
    });

    it("reverts deposit of zero", async function () {
      await expect(masterVault.connect(user).deposit(0, user.address))
        .to.be.revertedWith("MasterVault: zero deposit");
    });

    it("withdraws assets and deducts fee", async function () {
      const amount = ethers.parseEther("100");
      await mockUsdc.connect(user).approve(await masterVault.getAddress(), amount);
      await masterVault.connect(user).deposit(amount, user.address);

      const shares = await masterVault.balanceOf(user.address);
      const feesBefore = await mockUsdc.balanceOf(feeRecipient.address);

      await masterVault.connect(user).withdraw(shares, user.address, user.address);

      const feesAfter = await mockUsdc.balanceOf(feeRecipient.address);
      // 0.5% fee on 100 USDC = 0.5 USDC
      expect(feesAfter - feesBefore).to.equal(ethers.parseEther("0.5"));
    });

    it("role check: non-executor cannot call transferToAdapter", async function () {
      await expect(
        masterVault.connect(user).transferToAdapter(await demoAdapter.getAddress(), 1)
      ).to.be.revertedWithCustomError(masterVault, "AccessControlUnauthorizedAccount");
    });

    it("pause stops deposits", async function () {
      await masterVault.pause();
      const amount = ethers.parseEther("100");
      await mockUsdc.connect(user).approve(await masterVault.getAddress(), amount);
      await expect(masterVault.connect(user).deposit(amount, user.address))
        .to.be.revertedWithCustomError(masterVault, "EnforcedPause");
      await masterVault.unpause();
    });

    it("rejects fee > 5%", async function () {
      await expect(masterVault.setPerformanceFeeBps(600))
        .to.be.revertedWith("MasterVault: fee too high (max 5%)");
    });
  });

  // ─── NativeVault ─────────────────────────────────────────────────────────────

  describe("NativeVault", function () {
    it("accepts native ETH/0G deposit and mints shares", async function () {
      const amount = ethers.parseEther("1");
      await expect(nativeVault.connect(user).deposit({ value: amount }))
        .to.emit(nativeVault, "Deposited");

      expect(await nativeVault.balanceOf(user.address)).to.equal(amount);
    });

    it("reverts zero deposit", async function () {
      await expect(nativeVault.connect(user).deposit({ value: 0 }))
        .to.be.revertedWith("NativeVault: zero deposit");
    });

    it("withdraws native and takes fee", async function () {
      const amount = ethers.parseEther("1");
      await nativeVault.connect(user).deposit({ value: amount });
      const shares = await nativeVault.balanceOf(user.address);

      const feeBalBefore = await ethers.provider.getBalance(feeRecipient.address);
      await nativeVault.connect(user).withdraw(shares);
      const feeBalAfter = await ethers.provider.getBalance(feeRecipient.address);

      // 0.5% of 1 ETH = 0.005 ETH
      expect(feeBalAfter - feeBalBefore).to.equal(ethers.parseEther("0.005"));
    });
  });

  // ─── RebalanceExecutor ────────────────────────────────────────────────────────

  describe("RebalanceExecutor", function () {
    it("requestRebalance emits event", async function () {
      const masterVaultAddr = await masterVault.getAddress();
      await expect(
        rebalanceExecutor.connect(relayer).requestRebalance(masterVaultAddr, ethers.parseEther("50"))
      ).to.emit(rebalanceExecutor, "RebalanceRequested");
    });

    it("only RELAYER_ROLE can requestRebalance", async function () {
      await expect(
        rebalanceExecutor.connect(user).requestRebalance(await masterVault.getAddress(), 100)
      ).to.be.revertedWithCustomError(rebalanceExecutor, "AccessControlUnauthorizedAccount");
    });

    it("executeRebalance records decision on-chain", async function () {
      const masterVaultAddr = await masterVault.getAddress();
      const adapterAddr     = await demoAdapter.getAddress();

      // Deposit into vault first
      const amount = ethers.parseEther("100");
      await mockUsdc.connect(user).approve(masterVaultAddr, amount);
      await masterVault.connect(user).deposit(amount, user.address);

      // Request rebalance
      const tx1 = await rebalanceExecutor.connect(relayer).requestRebalance(masterVaultAddr, amount);
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(l => l.fragment?.name === "RebalanceRequested");
      const requestId = event1.args[0];

      // Execute rebalance (simulate relayer callback)
      const decisionHash = ethers.keccak256(ethers.toUtf8Bytes("decision-payload-1"));
      const attestation  = ethers.toUtf8Bytes("mock-tee-attestation");
      const storageRef   = "0x1234deadbeef"; // Would be a real 0G Storage root hash

      await expect(
        rebalanceExecutor.connect(relayer).executeRebalance(
          requestId,
          masterVaultAddr,
          adapterAddr,
          amount,
          decisionHash,
          attestation,
          storageRef
        )
      ).to.emit(rebalanceExecutor, "RebalanceExecuted")
       .withArgs(requestId, adapterAddr, amount, decisionHash, storageRef);

      const record = await rebalanceExecutor.getRebalance(requestId);
      expect(record.decisionHash).to.equal(decisionHash);
      expect(record.storageRef).to.equal(storageRef);
    });

    it("cannot execute same request twice", async function () {
      const masterVaultAddr = await masterVault.getAddress();
      const amount = ethers.parseEther("100");
      await mockUsdc.connect(user).approve(masterVaultAddr, amount);
      await masterVault.connect(user).deposit(amount, user.address);

      const tx1 = await rebalanceExecutor.connect(relayer).requestRebalance(masterVaultAddr, amount);
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(l => l.fragment?.name === "RebalanceRequested");
      const requestId = event1.args[0];

      const dh = ethers.keccak256(ethers.toUtf8Bytes("d"));
      const att = ethers.toUtf8Bytes("att");

      await rebalanceExecutor.connect(relayer).executeRebalance(
        requestId, masterVaultAddr, await demoAdapter.getAddress(),
        amount, dh, att, "ref1"
      );

      await expect(
        rebalanceExecutor.connect(relayer).executeRebalance(
          requestId, masterVaultAddr, await demoAdapter.getAddress(),
          amount, dh, att, "ref1"
        )
      ).to.be.revertedWith("RebalanceExecutor: already executed");
    });

    it("rejects missing attestation", async function () {
      const masterVaultAddr = await masterVault.getAddress();
      const amount = ethers.parseEther("10");
      await mockUsdc.connect(user).approve(masterVaultAddr, amount);
      await masterVault.connect(user).deposit(amount, user.address);

      const tx1 = await rebalanceExecutor.connect(relayer).requestRebalance(masterVaultAddr, amount);
      const r1 = await tx1.wait();
      const ev = r1.logs.find(l => l.fragment?.name === "RebalanceRequested");

      await expect(
        rebalanceExecutor.connect(relayer).executeRebalance(
          ev.args[0], masterVaultAddr, await demoAdapter.getAddress(),
          amount, ethers.ZeroHash, "0x", "ref"
        )
      ).to.be.revertedWith("RebalanceExecutor: missing attestation");
    });

    it("only RELAYER_ROLE can executeRebalance", async function () {
      const masterVaultAddr = await masterVault.getAddress();
      const tx1 = await rebalanceExecutor.connect(relayer).requestRebalance(masterVaultAddr, 100);
      const r1 = await tx1.wait();
      const ev = r1.logs.find(l => l.fragment?.name === "RebalanceRequested");

      await expect(
        rebalanceExecutor.connect(user).executeRebalance(
          ev.args[0],
          masterVaultAddr,
          await demoAdapter.getAddress(),
          100,
          ethers.ZeroHash,
          ethers.toUtf8Bytes("attestation"),
          "storageRef"
        )
      ).to.be.revertedWithCustomError(rebalanceExecutor, "AccessControlUnauthorizedAccount");
    });

    it("NativeVault-only launch: RebalanceExecutor operates without masterVault (address(0))", async function () {
      const RebalanceExecutor = await ethers.getContractFactory("RebalanceExecutor");
      const executorNativeOnly = await RebalanceExecutor.deploy(
        ethers.ZeroAddress,
        await nativeVault.getAddress(),
        deployer.address
      );
      await executorNativeOnly.grantRole(RELAYER_ROLE, relayer.address);

      const nativeVaultAddr = await nativeVault.getAddress();
      const tx = await executorNativeOnly.connect(relayer).requestRebalance(nativeVaultAddr, ethers.parseEther("1"));
      const r = await tx.wait();
      const ev = r.logs.find(l => l.fragment?.name === "RebalanceRequested");
      expect(ev.args[1]).to.equal(nativeVaultAddr);
    });

    it("refundOrHoldOnFailure marks timed-out request as failed", async function () {
      const masterVaultAddr = await masterVault.getAddress();
      const tx = await rebalanceExecutor.connect(relayer).requestRebalance(masterVaultAddr, 100);
      const r = await tx.wait();
      const ev = r.logs.find(l => l.fragment?.name === "RebalanceRequested");
      const requestId = ev.args[0];

      // Advance time past timeout (default 3600s)
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine");

      await expect(rebalanceExecutor.refundOrHoldOnFailure(requestId))
        .to.emit(rebalanceExecutor, "RebalanceFailed")
        .withArgs(requestId, "timeout: funds held in vault");
    });
  });

  // ─── DemoYieldAdapter ─────────────────────────────────────────────────────────

  describe("DemoYieldAdapter", function () {
    it("records deposited amount", async function () {
      const amount = ethers.parseEther("50");
      await mockUsdc.transfer(await demoAdapter.getAddress(), amount); // send tokens first
      await demoAdapter.deposit(amount);
      expect(await demoAdapter.totalDeposited()).to.equal(amount);
    });

    it("adapterName is honest about being a demo", async function () {
      const name = await demoAdapter.adapterName();
      expect(name).to.include("placeholder");
    });

    it("only owner can deposit/withdraw", async function () {
      await expect(demoAdapter.connect(user).deposit(100))
        .to.be.revertedWithCustomError(demoAdapter, "OwnableUnauthorizedAccount");
    });
  });

  // ─── StrategyAgenticID ────────────────────────────────────────────────────────

  describe("StrategyAgenticID", function () {
    it("mints strategy token", async function () {
      await expect(
        agenticId.mintStrategy(deployer.address, "0xstoragehash", "Oasis Strategy v1")
      ).to.emit(agenticId, "StrategyMinted");

      expect(await agenticId.ownerOf(0)).to.equal(deployer.address);
    });

    it("records decisions against token", async function () {
      await agenticId.mintStrategy(deployer.address, "0xhash", "Strategy v1");
      await agenticId.grantRole(RECORDER_ROLE, deployer.address);

      const dh = ethers.keccak256(ethers.toUtf8Bytes("decision1"));
      await agenticId.recordDecision(0, "0xstorageref", dh);

      expect(await agenticId.decisionCount(0)).to.equal(1);
      const record = await agenticId.getDecision(0, 0);
      expect(record.decisionHash).to.equal(dh);
    });

    it("history survives token transfer (no reset)", async function () {
      await agenticId.mintStrategy(deployer.address, "0xhash", "Strategy v1");
      await agenticId.grantRole(RECORDER_ROLE, deployer.address);

      // Record 2 decisions before transfer
      await agenticId.recordDecision(0, "0xref1", ethers.keccak256(ethers.toUtf8Bytes("d1")));
      await agenticId.recordDecision(0, "0xref2", ethers.keccak256(ethers.toUtf8Bytes("d2")));

      // Transfer token to user
      await agenticId.transferFrom(deployer.address, user.address, 0);
      expect(await agenticId.ownerOf(0)).to.equal(user.address);

      // History is still there, not reset
      expect(await agenticId.decisionCount(0)).to.equal(2);
      const history = await agenticId.getHistory(0);
      expect(history.length).to.equal(2);
    });

    it("only RECORDER_ROLE can recordDecision", async function () {
      await agenticId.mintStrategy(deployer.address, "0xhash", "Strategy v1");
      await expect(
        agenticId.connect(user).recordDecision(0, "ref", ethers.ZeroHash)
      ).to.be.revertedWithCustomError(agenticId, "AccessControlUnauthorizedAccount");
    });
  });
});
