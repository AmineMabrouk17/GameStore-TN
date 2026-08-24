import { useTranslations } from "next-intl";
import { Ghost } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

export default function EmptyState() {
  const t = useTranslations("catalog");
  const te = useTranslations("errors");

  return (
    <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
      <Ghost className="mx-auto size-12 text-primary/60" aria-hidden />
      <h2 className="mt-4 text-lg font-black">{t("emptyTitle")}</h2>
      <p className="mt-2 text-sm text-neutral-400">{t("emptySubtitle")}</p>
      <Link href="/catalog" className="mt-6 inline-block">
        <Button variant="secondary" size="sm">{te("backHome")}</Button>
      </Link>
    </div>
  );
}
