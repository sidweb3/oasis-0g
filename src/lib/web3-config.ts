import { http, createConfig, createConnector } from 'wagmi'
import { type Chain } from 'viem'

// ─── 0G Chain Networks ──────────────────────────────────────────────────────

/** 0G Chain Aristotle Mainnet (chainId 16661) */
export const ogAristotle: Chain = {
  id: 16661,
  name: '0G Chain',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: 'ChainScan', url: 'https://chainscan.0g.ai' },
  },
  testnet: false,
} as const satisfies Chain

// NOTE: No testnet chain is configured here.
// If mainnet addresses are not deployed yet, the UI shows an explicit
// "not deployed" state rather than silently falling back to a testnet.

// ─── Injected Wallet Connector ───────────────────────────────────────────────

function customInjected() {
  return createConnector((config) => ({
    id: 'injected',
    name: 'MetaMask / Injected',
    type: 'injected' as const,

    async setup() {},

    async getProvider() {
      if (typeof window === 'undefined') return undefined;
      return window.ethereum;
    },

    async connect({ chainId } = {}) {
      const provider = window.ethereum;
      if (!provider) throw new Error('No injected wallet found. Install MetaMask.');

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      let currentChainId = Number(await provider.request({ method: 'eth_chainId' }));

      if (chainId && currentChainId !== chainId) {
        await this.switchChain?.({ chainId });
        currentChainId = chainId;
      }

      return { accounts: [accounts[0]], chainId: currentChainId };
    },

    async disconnect() {},

    async getAccounts() {
      const provider = window.ethereum;
      if (!provider) return [];
      return provider.request({ method: 'eth_accounts' });
    },

    async getChainId() {
      const provider = window.ethereum;
      if (!provider) throw new Error('No injected provider found');
      return Number(await provider.request({ method: 'eth_chainId' }));
    },

    async isAuthorized() {
      try {
        return (await this.getAccounts()).length > 0;
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }) {
      const provider = window.ethereum;
      if (!provider) throw new Error('No injected provider found');

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          const chain = config.chains.find(c => c.id === chainId);
          if (!chain) throw new Error('Chain not configured');

          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: chain.rpcUrls.default.http as any,
              blockExplorerUrls: chain.blockExplorers?.default
                ? [chain.blockExplorers.default.url]
                : undefined,
            }],
          });
        } else {
          throw error;
        }
      }

      return config.chains.find(c => c.id === chainId) || config.chains[0];
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect?.();
      } else {
        config.emitter.emit('change', { accounts: accounts as readonly `0x${string}`[] });
      }
    },

    onChainChanged(chainId) {
      config.emitter.emit('change', { chainId: Number(chainId) });
    },

    onDisconnect() {
      config.emitter.emit('disconnect');
    },
  }))
}

// ─── Wagmi Config ────────────────────────────────────────────────────────────

/**
 * Single-network config: 0G Chain Aristotle mainnet only.
 * No silent testnet fallback — the app shows an explicit "not deployed" state
 * if mainnet contract addresses are not set.
 */
export const config = createConfig({
  chains: [ogAristotle],
  connectors: [customInjected()],
  transports: {
    [ogAristotle.id]: http('https://evmrpc.0g.ai'),
  },
})