import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const locale = await getLocale();
  redirect({ href: "/admin/dashboard", locale });
}
