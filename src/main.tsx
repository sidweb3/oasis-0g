import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router";
import "./index.css";
import "./types/global.d.ts";
import { useAuth } from "@/hooks/use-auth";
import { NetworkProvider } from "@/lib/network-context";

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from "@/lib/web3-config";

const queryClient = new QueryClient()

// Import route components directly to avoid dynamic import fetching issues during development
import Landing from "./pages/Landing.tsx";
import AuthPage from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Vaults from "./pages/Vaults.tsx";
import Strategies from "./pages/Strategies.tsx";
import NotFound from "./pages/NotFound.tsx";
import DownloadPage from "./pages/Download.tsx";
import DeployGuide from "./pages/DeployGuide.tsx";
import Whitepaper from "./pages/Whitepaper.tsx";
import AgenticID from "./pages/AgenticID.tsx";
import NoiseDarkBlueGradientBackground from "@/components/ui/noise-dark-blue-gradient-with-squares";

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <div className="animate-pulse text-muted-foreground">Loading Oasis...</div>
      </div>
    </div>
  );
}

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://dummy-oasis.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstrumentationProvider>
      <NetworkProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConvexAuthProvider client={convex}>
              <BrowserRouter>
                <RouteSyncer />
                <Suspense fallback={<RouteLoading />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
                    <Route
                      path="/dashboard"
                      element={<Dashboard />}
                    />
                    <Route
                      path="/vaults"
                      element={<Vaults />}
                    />
                    <Route
                      path="/strategies"
                      element={<Strategies />}
                    />
                    <Route path="/whitepaper" element={<Whitepaper />} />
                    <Route path="/agentic-id" element={<AgenticID />} />
                    <Route path="/download" element={<DownloadPage />} />
                    <Route path="/deploy-guide" element={<DeployGuide />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <Toaster />
            </ConvexAuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </NetworkProvider>
    </InstrumentationProvider>
  </StrictMode>,
);