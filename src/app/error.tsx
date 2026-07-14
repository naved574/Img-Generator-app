"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Something went wrong</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">That page needs another try.</h1>
        <button onClick={reset} className="mt-6 rounded-lg bg-foreground px-4 py-2 text-sm text-background">Try again</button>
      </div>
    </main>
  );
}
