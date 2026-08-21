"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-streak-muted mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-display font-semibold text-text mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          {error.message || "An unexpected error occurred. We've been notified."}
        </p>
        <button
          onClick={reset}
          className="h-10 px-6 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
