import { useAccount, useConnect, useDisconnect } from "wagmi";

export function useAuth() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Map wagmi state to our app's auth interface
  const isLoading = isConnecting || isReconnecting;
  const isAuthenticated = isConnected;
  
  // Helper to connect with the first available connector (usually Injected/MetaMask)
  const signIn = async () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user: address ? { name: "Wallet User", email: address, image: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}` } : null,
    signIn,
    signOut: disconnect,
    address,
  };
}