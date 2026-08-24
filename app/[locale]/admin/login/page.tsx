"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Gamepad2, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";
import { api, ApiError } from "@/lib/client-api";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/auth/me")
      .then(() => {
        if (!cancelled) router.replace("/admin/dashboard");
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(false);
    setSubmitting(true);
    try {
      await api.post("/api/auth/login", { username, password });
      toast.success(t("signIn"));
      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(true);
        toast.error(t("invalidCredentials"));
      } else {
        toast.error(tc("error"));
      }
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-label={tc("loading")} />
      </div>
    );
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="grid-background absolute inset-0" aria-hidden />
      <div className="absolute start-1/4 top-1/4 size-72 rounded-full bg-primary/15 blur-[110px]" aria-hidden />
      <div className="absolute bottom-1/4 end-1/4 size-72 rounded-full bg-magenta/10 blur-[110px]" aria-hidden />

      <motion.div
        animate={error ? { x: [0, -12, 12, -8, 8, -4, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-sm"
      >
        <Card className="glass glow-cyan border-white/10">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/15 glow-cyan">
                <Gamepad2 className="size-7 text-primary" aria-hidden />
              </span>
              <h1 className="mt-4 text-2xl font-black">{t("loginTitle")}</h1>
              <p className="mt-1 text-sm text-neutral-400">{t("loginSubtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  minLength={3}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm font-bold text-rose-300" role="alert">
                  <ShieldAlert className="size-4 shrink-0" aria-hidden />
                  {t("invalidCredentials")}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={submitting}>
                {!submitting && <LogIn className="size-5" aria-hidden />}
                {submitting ? t("signingIn") : t("signIn")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
