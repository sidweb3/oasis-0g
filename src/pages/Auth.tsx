import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Wallet } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useNavigate } from "react-router";
import { Connector, useConnect } from "wagmi";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading, isAuthenticated } = useAuth();
  const { connect, connectors, isPending } = useConnect();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    }
  }, [isAuthenticated, navigate, redirectAfterAuth]);

  const handleConnect = (connector: Connector) => {
    connect({ connector });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Connect Wallet
              </CardTitle>
              <CardDescription>
                Connect your Web3 wallet to access the Oasis yield vault on 0G Chain.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full h-12 text-base justify-between px-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                onClick={() => handleConnect(connector)}
                disabled={isPending || isLoading}
              >
                <span className="flex items-center gap-2">
                  {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
                </span>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-green-500/50" />
                )}
              </Button>
            ))}
            
            {connectors.length === 0 && (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No wallets detected. Please install MetaMask or another Web3 wallet.
              </div>
            )}

            <div className="pt-4 text-center text-xs text-muted-foreground">
              By connecting, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}