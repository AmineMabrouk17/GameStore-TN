"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Plus, Star, Trash2, Upload } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { productCreateSchema, productUpdateSchema } from "@/lib/validation";
import { PRODUCT_STATUSES } from "@/lib/validation";
import { api, ApiError } from "@/lib/client-api";
import type { CategoryWithCount, ProductWithCategory } from "@/types";
import { toast } from "sonner";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: ProductWithCategory | null;
  categories: CategoryWithCount[];
  onSaved: () => void;
  onCategoryCreated: (category: CategoryWithCount) => void;
}

type FieldErrors = Record<string, string>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductFormDialog({
  open,
  onClose,
  product,
  categories,
  onSaved,
  onCategoryCreated,
}: ProductFormDialogProps) {
  const t = useTranslations("admin");
  const tf = useTranslations("adminForm");
  const locale = (useLocale() as "ar" | "fr") ?? "ar";

  const [form, setForm] = useState({
    title_ar: "",
    title_fr: "",
    description_ar: "",
    description_fr: "",
    category_id: "",
    price: "",
    currency: "TND",
    status: "AVAILABLE",
    featured: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const uploadTargetIndex = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryNameAr, setNewCategoryNameAr] = useState("");
  const [newCategoryNameFr, setNewCategoryNameFr] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const newCategorySlug = useMemo(
    () => slugify(newCategoryNameFr || newCategoryNameAr),
    [newCategoryNameFr, newCategoryNameAr],
  );

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setShowNewCategory(false);
    setNewCategoryNameAr("");
    setNewCategoryNameFr("");
    if (product) {
      setForm({
        title_ar: product.title_ar,
        title_fr: product.title_fr,
        description_ar: product.description_ar ?? "",
        description_fr: product.description_fr ?? "",
        category_id: product.category_id,
        price: String(product.price),
        currency: product.currency,
        status: product.status,
        featured: product.featured,
      });
      setImages(product.images);
    } else {
      setForm({
        title_ar: "",
        title_fr: "",
        description_ar: "",
        description_fr: "",
        category_id: categories[0]?.id ?? "",
        price: "",
        currency: "TND",
        status: "AVAILABLE",
        featured: false,
      });
      setImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  // If the dialog opened before categories finished loading, adopt the first one.
  useEffect(() => {
    if (!open) return;
    setForm((prev) =>
      prev.category_id || categories.length === 0
        ? prev
        : { ...prev, category_id: categories[0].id },
    );
  }, [open, categories]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreateCategory() {
    if (!newCategoryNameAr.trim() || !newCategoryNameFr.trim() || !newCategorySlug) return;
    setCreatingCategory(true);
    try {
      const created = await api.post<CategoryWithCount>("/api/admin/categories", {
        name_ar: newCategoryNameAr.trim(),
        name_fr: newCategoryNameFr.trim(),
        slug: newCategorySlug,
      });
      onCategoryCreated(created);
      updateField("category_id", created.id);
      toast.success(tf("categoryCreated"));
      setShowNewCategory(false);
      setNewCategoryNameAr("");
      setNewCategoryNameFr("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : tf("operationFailed"));
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const payload = {
      title_ar: form.title_ar,
      title_fr: form.title_fr,
      ...(form.description_ar ? { description_ar: form.description_ar } : {}),
      ...(form.description_fr ? { description_fr: form.description_fr } : {}),
      category_id: form.category_id,
      price: Number(form.price),
      currency: form.currency as "TND" | "EUR",
      images,
      status: form.status as (typeof PRODUCT_STATUSES)[number],
      featured: form.featured,
    };

    const schema = product ? productUpdateSchema : productCreateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (product) {
        await api.patch(`/api/admin/products/${product.id}`, parsed.data);
      } else {
        await api.post("/api/admin/products", parsed.data);
      }
      toast.success(t("saved"));
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const fieldErrors: FieldErrors = {};
        for (const [field, messages] of Object.entries(err.details)) {
          if (messages.length > 0) fieldErrors[field] = messages[0];
        }
        setErrors(fieldErrors);
      }
      toast.error(err instanceof ApiError ? err.message : tf("operationFailed"));
    } finally {
      setSaving(false);
    }
  }

  function fieldError(key: string): string | undefined {
    return errors[key];
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const index = uploadTargetIndex.current;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (index === null || !file) return;

    setUploadingIndex(index);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        credentials: "same-origin",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;
      const url = typeof payload?.url === "string" ? payload.url : null;
      if (!response.ok || url === null) {
        throw new ApiError(
          response.status,
          payload?.error ?? `Upload failed (${response.status})`,
        );
      }
      setImages((prev) =>
        prev.map((item, itemIndex) => (itemIndex === index ? url : item)),
      );
      toast.success(tf("imageUploaded"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : tf("operationFailed"));
    } finally {
      setUploadingIndex(null);
    }
  }

  function openDevicePicker(index: number) {
    uploadTargetIndex.current = index;
    fileInputRef.current?.click();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? `${t("edit")} — ${locale === "ar" ? product.title_ar : product.title_fr}` : t("addProduct")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title_ar">{t("title")} (AR)</Label>
              <Input
                id="title_ar"
                dir="rtl"
                value={form.title_ar}
                onChange={(event) => updateField("title_ar", event.target.value)}
                required
              />
              {fieldError("title_ar") && <p className="text-xs text-rose-300">{fieldError("title_ar")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title_fr">{t("title")} (FR)</Label>
              <Input
                id="title_fr"
                dir="ltr"
                value={form.title_fr}
                onChange={(event) => updateField("title_fr", event.target.value)}
                required
              />
              {fieldError("title_fr") && <p className="text-xs text-rose-300">{fieldError("title_fr")}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description_ar">{tf("descriptionAr")}</Label>
              <Textarea
                id="description_ar"
                dir="rtl"
                rows={3}
                value={form.description_ar}
                onChange={(event) => updateField("description_ar", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description_fr">{tf("descriptionFr")}</Label>
              <Textarea
                id="description_fr"
                dir="ltr"
                rows={3}
                value={form.description_fr}
                onChange={(event) => updateField("description_fr", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="category">{t("category")}</Label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory((value) => !value)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="size-3.5" aria-hidden />
                  {t("newCategory")}
                </button>
              </div>
              <Select
                id="category"
                value={form.category_id}
                onChange={(event) => updateField("category_id", event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {locale === "ar" ? category.name_ar : category.name_fr}
                  </option>
                ))}
              </Select>
              {fieldError("category_id") && (
                <p className="text-xs text-rose-300">{fieldError("category_id")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currency">{tf("currency")}</Label>
              <Select
                id="currency"
                value={form.currency}
                onChange={(event) => updateField("currency", event.target.value)}
              >
                <option value="TND">TND</option>
                <option value="EUR">EUR</option>
              </Select>
            </div>
          </div>

          {showNewCategory && (
            <div className="glass space-y-3 rounded-xl p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  dir="rtl"
                  placeholder={`${t("categoryName")} (AR)`}
                  value={newCategoryNameAr}
                  onChange={(event) => setNewCategoryNameAr(event.target.value)}
                />
                <Input
                  dir="ltr"
                  placeholder={`${t("categoryName")} (FR)`}
                  value={newCategoryNameFr}
                  onChange={(event) => setNewCategoryNameFr(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">slug: /{newCategorySlug}</span>
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    creatingCategory ||
                    !newCategoryNameAr.trim() ||
                    !newCategoryNameFr.trim() ||
                    !newCategorySlug
                  }
                  onClick={handleCreateCategory}
                >
                  {creatingCategory ? <Loader2 className="size-4 animate-spin" aria-hidden /> : t("createCategory")}
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">{t("price")}</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.5"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                required
              />
              {fieldError("price") && <p className="text-xs text-rose-300">{fieldError("price")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">{t("status")}</Label>
              <Select
                id="status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {PRODUCT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "AVAILABLE"
                      ? t("available")
                      : status === "RESERVED"
                        ? t("reserved")
                        : t("sold")}
                  </option>
                ))}
              </Select>
            </div>
            <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
                className="size-4 accent-violet-500"
              />
              <Star className="size-4 fill-violet-400 text-violet-400" aria-hidden />
              {t("featured")}
            </label>
          </div>

          <div className="space-y-2">
            <Label>{t("images")}</Label>
            <p className="text-xs text-neutral-500">{tf("imageHint")}</p>
            {images.map((image, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={image}
                  onChange={(event) =>
                    setImages((prev) =>
                      prev.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder="/games/free-fire.svg or https://…"
                />
                {image && (
                  <img
                    src={image}
                    alt=""
                    className="hidden size-10 shrink-0 rounded-md border border-white/10 object-cover sm:block"
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={tf("uploadImage")}
                  title={tf("uploadImage")}
                  disabled={uploadingIndex !== null}
                  onClick={() => openDevicePicker(index)}
                >
                  {uploadingIndex === index ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="size-4 text-emerald-300" aria-hidden />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("delete")}
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4 text-rose-300" aria-hidden />
                </Button>
              </div>
            ))}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelected}
            />
            {images.length < 6 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setImages((prev) => [...prev, ""])}
              >
                <Plus className="size-4" aria-hidden />
                {t("addImage")}
              </Button>
            )}
            {fieldError("images") && <p className="text-xs text-rose-300">{fieldError("images")}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              {saving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
