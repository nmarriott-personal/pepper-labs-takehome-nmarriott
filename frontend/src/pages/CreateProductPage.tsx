import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createProduct, fetchCategories } from "@/lib/api";
import type { Category } from "@/types";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("active");
  const [variants, setVariants] = useState([
    { sku: "", name: "", price: "0.00", inventory: "0" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const updateVariant = (index: number, field: string, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await createProduct({
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId ? Number(categoryId) : null,
        status,
        variants: variants.map((v) => ({
          sku: v.sku.trim(),
          name: v.name.trim(),
          price_cents: Math.round(parseFloat(v.price || "0") * 100),
          inventory_count: parseInt(v.inventory || "0", 10),
        })),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }
      navigate(`/products/${data.id}`);
    } catch {
      setError("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Create New Product
      </h1>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-card">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Whole Milk"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "draft")}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Variants</h2>
            <button
              type="button"
              onClick={() =>
                setVariants([...variants, { sku: "", name: "", price: "0.00", inventory: "0" }])
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-9">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="SKU-001"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs font-medium">Variant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Default"
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">Inventory</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={v.inventory}
                      onChange={(e) => updateVariant(i, "inventory", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                      className="inline-flex h-10 items-center justify-center rounded-md border px-2.5 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/products"
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center rounded-md bg-[#2E3330] px-4 text-sm font-medium text-white hover:bg-[#3a3f3c] disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
