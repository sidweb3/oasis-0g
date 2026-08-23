import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { ChevronDown, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";

type SyncError = {
  error: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
};

type AsyncError = {
  error: string;
  stack: string;
};

type GenericError = SyncError | AsyncError;

function ErrorDialog({
  error,
  setError,
}: {
  error: GenericError;
  setError: (error: GenericError | null) => void;
}) {
  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={() => {
        setError(null);
      }}
    >
      <DialogContent className="bg-destructive text-destructive-foreground max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Application Runtime Error
          </DialogTitle>
        </DialogHeader>
        An unexpected runtime error occurred in the application.
        <div className="mt-4">
          <Collapsible>
            <CollapsibleTrigger>
              <div className="flex items-center font-bold cursor-pointer gap-1">
                See error details <ChevronDown className="h-4 w-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="max-w-[460px]">
              <div className="mt-2 p-3 bg-neutral-900 rounded text-white text-sm overflow-x-auto max-h-60 max-w-full font-mono">
                <pre className="whitespace-pre-wrap text-xs">{error.stack || error.error}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ErrorBoundaryState = {
  hasError: boolean;
  error: GenericError | null;
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uncaught application error:", error, info);
    this.setState({
      hasError: true,
      error: {
        error: error.message,
        stack: info.componentStack ?? error.stack ?? "",
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDialog
          error={{
            error: "An application error occurred",
            stack: this.state.error?.stack || "",
          }}
          setError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export function InstrumentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<GenericError | null>(null);

  useEffect(() => {
    const handleError = async (event: ErrorEvent) => {
      try {
        console.error("Window error event:", event);
        setError({
          error: event.message,
          stack: event.error?.stack || "",
          filename: event.filename || "",
          lineno: event.lineno,
          colno: event.colno,
        });
      } catch (err) {
        console.error("Error in handleError:", err);
      }
    };

    const handleRejection = async (event: PromiseRejectionEvent) => {
      try {
        console.error("Unhandled promise rejection:", event);
        setError({
          error: event.reason?.message || String(event.reason),
          stack: event.reason?.stack || "",
        });
      } catch (err) {
        console.error("Error in handleRejection:", err);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      {error && <ErrorDialog error={error} setError={setError} />}
    </>
  );
}
