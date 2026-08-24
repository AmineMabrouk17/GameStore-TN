"use client";

import { Toaster as SonnerToaster } from "sonner";
import type { Locale } from "@/types";

const POSITION: Record<Locale, "bottom-left" | "bottom-right"> = {
  ar: "bottom-left",
  fr: "bottom-right",
};

interface ToasterProps {
  locale: Locale;
}

export default function Toaster({ locale }: ToasterProps) {
  return (
    <SonnerToaster
      position={POSITION[locale]}
      dir={locale === "ar" ? "rtl" : "ltr"}
      theme="dark"
      closeButton
      toastOptions={{
        style: {
          background: "rgb(13 17 38 / 0.9)",
          border: "1px solid rgb(148 163 184 / 0.18)",
          color: "#e6e9f5",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow:
            "0 0 18px rgb(34 211 238 / 0.2), 0 8px 32px rgb(0 0 0 / 0.55)",
        },
        className: "rounded-xl font-sans text-sm",
      }}
    />
  );
}
