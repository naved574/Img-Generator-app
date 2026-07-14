"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en"><body className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
      <div><h1 className="text-2xl font-semibold">Zenivra could not load</h1><button onClick={reset} className="mt-5 rounded-lg bg-white px-4 py-2 text-sm text-black">Reload</button></div>
    </body></html>
  );
}
