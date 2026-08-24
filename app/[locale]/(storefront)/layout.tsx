import type { ReactNode } from "react";
import { getDb } from "@/lib/db";
import { list as listCategories } from "@/lib/repositories/categories";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    const db = await getDb();
    categories = await listCategories(db);
  } catch {
    categories = [];
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
