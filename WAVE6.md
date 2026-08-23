# Wave 6 — Landing Page Overhaul & Bug Fixes

## Overview

Wave 6 focused on a complete visual redesign of the landing page, adopting a **brutalist terminal aesthetic** that distinguishes the platform from generic DeFi UIs. All sections were rebuilt from scratch with a consistent dark theme, monospace typography, grid backgrounds, and scanline overlays.
---

## Changes Made

## Contract Addresses

### Polygon Mainnet (Chain ID: 137)

| Contract | Address | Explorer |
|---|---|---|
| MasterVault | `0x3D1dCb13A9E2AE1a0B87b9aE3C898b3840C68d61` | [View](https://polygonscan.com/address/0x3D1dCb13A9E2AE1a0B87b9aE3C898b3840C68d61) |
| POLVault | `0xd8ab58A9E355456A7c977551a3BB1B2eD9e61068` | [View](https://polygonscan.com/address/0xd8ab58A9E355456A7c977551a3BB1B2eD9e61068) |
| RebalanceExecutor | `0x39A80059BB3a9ca1Af6703B069B5fA40Ab78DE04` | [View](https://polygonscan.com/address/0x39A80059BB3a9ca1Af6703B069B5fA40Ab78DE04) |
| USDC (PoS) | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | [View](https://polygonscan.com/address/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174) |
| MockSwapRouter | `0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff` | [View](https://polygonscan.com) |
| WPOL | `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270` | [View](https://polygonscan.com/address/0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270) |

### Polygon Amoy Testnet (Chain ID: 80002)

| Contract | Address | Explorer |
|---|---|---|
| MasterVault | `0x831F6F30cc0Aa68a9541B79c2289BF748DEC4a2a` | [View](https://amoy.polygonscan.com/address/0x831F6F30cc0Aa68a9541B79c2289BF748DEC4a2a) |
| POLVault | `0xd399F27f84A5928460b8f9f222EBcb4438F716b5` | [View](https://amoy.polygonscan.com/address/0xd399F27f84A5928460b8f9f222EBcb4438F716b5) |
| RebalanceExecutor | `0xFBbcC8BC3351Db781A3250De99099A03f73C8563` | [View](https://amoy.polygonscan.com/address/0xFBbcC8BC3351Db781A3250De99099A03f73C8563) |
| MockUSDC | `0x2E4D2a90965178C0208927510D62F8aC4fC79321` | [View](https://amoy.polygonscan.com/address/0x2E4D2a90965178C0208927510D62F8aC4fC79321) |
| AaveAdapter | `0x320A2dC1b4a56D13438578e3aC386ed90Ca21D27` | [View](https://amoy.polygonscan.com/address/0x320A2dC1b4a56D13438578e3aC386ed90Ca21D27) |
| WPOL | `0x0ae690aad8663aab12a671a6a0d74242332de85f` | [View](https://amoy.polygonscan.com/address/0x0ae690aad8663aab12a671a6a0d74242332de85f) |

---

## Deployment Info

- **Deployer:** `0xA41Dbf17f2610086e7679348b268B67EF06B7b89`
- **Timestamp:** 2026-01-13T20:30:00Z
- **Network:** Polygon Amoy Testnet (primary deployment)

### Key Transactions (Amoy Testnet)

| Action | Tx Hash |
|---|---|
| Deposit | `0xdc0777d1e85f162932f17cc3bb34f9924ac9a650a44bf50fb3df32146612e403` |
| Rebalance | `0x968cee2afe6c30bfe9a867c2c8e26f1e6c9fe8ac4fa9a94842ff9a2fcd4fedd4` |
| Withdraw | `0x4c0be3ae9314243be86638e2bd9a8a1867cddf0e0adf9e09f85cc901ac5f0b99` |
| LinkExecutor | `0x072c2770d5c62297695a3a36feeafb8c04b16f90f8875efd51c3d7af766fe51a` |

---

## Metrics at Wave 6

| Metric | Value |
|---|---|
| TVL | $11.00 USDC |
| APY | 5.00% |
| Active Vaults | 2 (USDC + POL) |
| Chains Supported | 2 (Polygon PoS + Amoy) |
| Vault Shares | 0.000000001 |
| Interest Earned | 0.000007 USDC |

---
### 1. Theme & Global Styles (`src/index.css`)
- Introduced `font-mono-data` utility class for monospace data displays
- Added `scanline-overlay` CSS class for CRT-style scanline texture
- Added `animate-ticker` keyframe for the scrolling ticker bar
- Added `animate-blink` keyframe for the terminal cursor
- Added `text-glow` utility for neon green glow effect on headings
- Updated CSS variables for a darker, higher-contrast dark mode palette

### 2. Hero Section (`src/components/landing/HeroSection.tsx`)
- Added a **scrolling ticker bar** at the top with live vault metrics (APY, TVL, chain status)
- Built an **animated terminal block** that types out contract initialization line by line
- Displayed deployed contract addresses dynamically from `MAINNET_CONTRACTS`
- Added mouse-parallax glow orbs for depth
- Added animated grid background with scanline overlay
- Fixed `TypeError: Cannot read properties of undefined (reading 'startsWith')` by adding optional chaining on all `.startsWith()` calls
- Replaced hardcoded addresses with dynamic imports from `src/lib/contracts.ts`

### 3. Navbar (`src/components/Navbar.tsx`)
- Refined monospace-accented network toggle button (Mainnet/Testnet)
- Improved mobile menu with network toggle included
- Cleaner wallet address display with animated pulse indicator

### 4. Features Section (`src/components/landing/FeaturesSection.tsx`)
- Rebuilt with `gap-px bg-border` grid technique for sharp visual separation
- Each feature card has a monospace tag, icon, and hover state

### 5. How It Works Section (`src/components/landing/HowItWorksSection.tsx`)
- 4-step process displayed in a bordered grid
- Large monospace step numbers as background accents
- Connecting line between steps on desktop

### 6. Stats Section (`src/components/landing/StatsSection.tsx`)
- Live TVL pulled from chain via `useVaultTVL` hook
- 4 metric cards with icons and live indicators
- Transaction links to Polygon Amoy explorer (deposit, rebalance, withdraw)

---

## Bug Fixes

- **TypeError on HeroSection**: Fixed `Cannot read properties of undefined (reading 'startsWith')` by adding optional chaining (`line?.startsWith(...)`) on all terminal line checks.
- **Hardcoded addresses**: Replaced all hardcoded contract addresses in HeroSection with dynamic imports from `src/lib/contracts.ts`.

---

## Remaining / Future Work

- Break down `src/pages/Whitepaper.tsx` into smaller sub-components
- Integrate real-time TVL/APY into Hero section stats via `useVaultTVL` hook
- Add AI yield forecast display to Dashboard
