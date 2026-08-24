import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

interface ProtectedLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children, params }: ProtectedLayoutProps) {
  const { locale } = await params;
  const session = await requireAdminPage(locale);

  return <AdminShell username={session.username}>{children}</AdminShell>;
}
