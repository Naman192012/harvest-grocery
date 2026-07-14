import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { formatPrice, itemPrice } from "@/lib/format";
import { auth } from "@/integrations/firebase/client";
import { addToCart } from "@/lib/cart.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price_cents: number;
  unit_label: string | null;
  image_url: string | null;
  vendor: { name: string; slug: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const add = useServerFn(addToCart);
  const qc = useQueryClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    try {
      if (!auth.currentUser) {
        router.navigate({ to: "/auth", search: { next: "/cart" } });
        return;
      }
      await add({ data: { productId: product.id, quantity: 1 } });
      toast.success(`${product.name} added to cart`);
      qc.invalidateQueries({ queryKey: ["cart-count"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not add to cart");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to="/p/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <button
          onClick={onAdd}
          disabled={busy}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.vendor && (
          <p className="text-xs font-medium uppercase tracking-wide text-vendor">
            {product.vendor.name}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <p className="font-display text-lg font-semibold">{formatPrice(itemPrice(product.price_cents))}</p>
          {product.unit_label && (
            <span className="text-xs text-muted-foreground">{product.unit_label}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
