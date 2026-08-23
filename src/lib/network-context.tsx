/**
 * Oasis Protocol — Network Context
 * Simplified: always mainnet (0G Aristotle).
 * No testnet/mainnet toggle — single network only.
 */
import { createContext, useContext } from "react";

interface NetworkContextValue {
  networkMode: "mainnet";
  isMainnet: true;
}

const NetworkContext = createContext<NetworkContextValue>({
  networkMode: "mainnet",
  isMainnet: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  return (
    <NetworkContext.Provider value={{ networkMode: "mainnet", isMainnet: true }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
