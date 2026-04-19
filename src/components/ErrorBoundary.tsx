import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { HeartHandshake } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <>
          {this.props.children}
          <Dialog open onOpenChange={() => this.setState({ hasError: false, error: null })}>
            <DialogContent className="max-w-md">
              <DialogHeader className="text-center items-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-2">
                  <HeartHandshake className="h-7 w-7 text-accent" />
                </div>
                <DialogTitle className="text-xl">Hey, chilled. We got you.</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground pt-2">
                  It's just a bug, not a bad bug. Try refreshing the page.
                  If it's still not working, chat with us and we'll sort it out quickly.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-3 sm:justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="hero"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = "/contact";
                  }}
                >
                  Contact Support
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }
    return this.props.children;
  }
}
