"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useEventLog } from "@/lib/useEventLog";

export default function Cancel() {
  const { logEvent } = useEventLog();

  useEffect(() => {
    logEvent("stripe_checkout_cancel");
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 4000);
    return () => clearTimeout(t);
  }, [logEvent]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Checkout abgebrochen</h1>
        <p className="mt-2 text-slate-600">Kein Problem — Demo only. Du wirst gleich zurückgeleitet.</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Zurück zur Demo
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">Auto-Redirect in ~4 Sekunden.</p>
      </div>
    </main>
  );
}