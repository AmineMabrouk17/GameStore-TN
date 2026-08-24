"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, RefreshCcw } from "lucide-react";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { api, ApiError } from "@/lib/client-api";
import DataTable, { type StatusTab } from "@/components/admin/DataTable";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import StatCards, { type ProductStats } from "@/components/admin/StatCards";
import type { CategoryWithCount, ProductStatus, ProductWithCategory } from "@/types";
import { toast } from "sonner";

const PAGE_SIZE = 12;

const EMPTY_STATS: ProductStats = {
  total: 0,
  available: 0,
  reserved: 0,
  sold: 0,
  featured: 0,
};

export default function DashboardClient() {
  const t = useTranslations("admin");
  const tf = useTranslations("adminForm");
  const tc = useTranslations("common");
  const locale = (useLocale() as "ar" | "fr") ?? "ar";

  const [stats, setStats] = useState<ProductStats>(EMPTY_STATS);
  const [items, setItems] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<StatusTab>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [deleting, setDeleting] = useState<ProductWithCategory | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const build = (status?: ProductStatus) =>
        api.get<{ total: number; items: ProductWithCategory[] }>(
          `/api/admin/products?pageSize=1${status ? `&status=${status}` : ""}`,
        );
      const featured = await api.get<{ total: number; items: ProductWithCategory[] }>(
        "/api/admin/products?pageSize=1&featured=true",
      );
      const [all, available, reserved, sold] = await Promise.all([
        build(),
        build("AVAILABLE"),
        build("RESERVED"),
        build("SOLD"),
      ]);
      setStats({
        total: all.total,
        available: available.total,
        reserved: reserved.total,
        sold: sold.total,
        featured: featured.total,
      });
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) {
        toast.error(tc("error"));
      }
    }
  }, [tc]);

  const loadItems = useCallback(
    async (
      nextTab: StatusTab,
      nextPage: number,
      nextQuery: string,
    ): Promise<{ items: ProductWithCategory[]; total: number }> => {
      const params = new URLSearchParams({
        page: String(nextPage),
        pageSize: String(PAGE_SIZE),
        sort: "newest",
      });
      if (nextTab !== "ALL") params.set("status", nextTab);
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      const result = await api.get<{ items: ProductWithCategory[]; total: number }>(
        `/api/admin/products?${params.toString()}`,
      );
      return result;
    },
    [],
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [result, categoriesResult] = await Promise.all([
        loadItems(tab, page, query),
        api.get<{ categories: CategoryWithCount[] }>("/api/categories"),
      ]);
      setItems(result.items);
      setTotal(result.total);
      setCategories(categoriesResult.categories ?? []);
      void loadStats();
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) {
        toast.error(tc("error"));
      }
    } finally {
      setLoading(false);
    }
  }, [loadItems, loadStats, page, query, tab, tc]);

  useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTabChange(next: StatusTab) {
    setTab(next);
    setPage(1);
    setLoading(true);
    loadItems(next, 1, query)
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
      })
      .catch(() => toast.error(tc("error")))
      .finally(() => setLoading(false));
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
    const handle = setTimeout(() => {
      setLoading(true);
      loadItems(tab, 1, value)
        .then((result) => {
          setItems(result.items);
          setTotal(result.total);
        })
        .catch(() => toast.error(tc("error")))
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: ProductWithCategory) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleMarkSold(product: ProductWithCategory) {
    setBusyId(product.id);
    try {
      await api.patch(`/api/admin/products/${product.id}`, { status: "SOLD" });
      toast.success(t("markedSold"));
      await refreshAll();
    } catch {
      toast.error(tf("operationFailed"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleFeatured(product: ProductWithCategory) {
    const nextValue = !product.featured;
    setItems((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, featured: nextValue } : item,
      ),
    );
    setBusyId(product.id);
    try {
      await api.patch(`/api/admin/products/${product.id}`, { featured: nextValue });
      toast.success(t("toggleFeatured"));
      void loadStats();
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, featured: !nextValue } : item,
        ),
      );
      toast.error(tf("operationFailed"));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await api.delete(`/api/admin/products/${deleting.id}`);
      toast.success(t("deleted"));
      setDeleting(null);
      await refreshAll();
    } catch {
      toast.error(tf("operationFailed"));
    } finally {
      setBusyId(null);
    }
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    setLoading(true);
    loadItems(tab, nextPage, query)
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
      })
      .catch(() => toast.error(tc("error")))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black sm:text-3xl">
          <span className="text-gradient">{t("dashboard")}</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => void refreshAll()} aria-label={tc("retry")}>
            <RefreshCcw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden />
          </Button>
          <Button size="sm" onClick={openCreate} className="glow-cyan">
            <Plus className="size-4" aria-hidden />
            {t("addProduct")}
          </Button>
        </div>
      </div>

      <StatCards stats={stats} />

      <DataTable
        items={items}
        query={query}
        onQueryChange={handleQueryChange}
        tab={tab}
        onTabChange={handleTabChange}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        busyId={busyId}
        onMarkSold={(product) => void handleMarkSold(product)}
        onToggleFeatured={(product) => void handleToggleFeatured(product)}
        onEdit={openEdit}
        onDelete={(product) => setDeleting(product)}
        onPageChange={handlePageChange}
      />

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
        categories={categories}
        onSaved={() => void refreshAll()}
        onCategoryCreated={(category) => setCategories((prev) => [...prev, category])}
      />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmDeleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-300">{t("confirmDeleteBody")}</p>
          <p className="glass rounded-xl p-3 text-sm font-bold">
            {deleting
              ? locale === "ar"
                ? deleting.title_ar
                : deleting.title_fr
              : ""}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
