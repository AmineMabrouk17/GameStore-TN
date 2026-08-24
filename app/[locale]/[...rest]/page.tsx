import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string; rest: string[] }>;
};

export default async function CatchAllPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
