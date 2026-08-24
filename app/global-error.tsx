"use client";

import { useEffect } from "react";
import { Gamepad2, RotateCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[#05060f] px-6 text-center text-neutral-100 antialiased"
        style={{ fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', Tahoma, sans-serif" }}
      >
        <span className="grid size-16 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
          <Gamepad2 className="size-8 text-cyan-300" aria-hidden />
        </span>
        <p className="text-xl font-black">
          GameStore<span className="bg-linear-to-r from-cyan-300 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"> TN</span>
        </p>
        <p className="max-w-md text-sm leading-relaxed text-neutral-300" dir="rtl" lang="ar">
          صرت مشكلة غير متوقعة. عاود الجرب بعد شوية.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-neutral-300" dir="ltr" lang="fr">
          Une erreur inattendue s&apos;est produite. Veuillez réessayer dans un instant.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-cyan-400 to-cyan-300 px-5 py-2.5 text-sm font-semibold text-[#04121a] transition-transform hover:brightness-110 active:scale-[0.97]"
        >
          <RotateCcw className="size-4" aria-hidden />
          <span dir="rtl">عاود المحاولة</span>
          <span aria-hidden>/</span>
          <span dir="ltr">Réessayer</span>
        </button>
      </body>
    </html>
  );
}
