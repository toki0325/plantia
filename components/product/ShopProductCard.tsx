"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";
import type { ProductSummary } from "@/lib/types";

type ShopProductCardProps = {
  product: ProductSummary;
};

export function ShopProductCard({ product }: ShopProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white border border-[var(--color-border,#EAE6DD)] rounded-[2px] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-ivory,#F5F1E8)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {product.freeShipping && (
          <span className="absolute top-2 left-2 bg-[var(--color-accent,#C6A45C)] text-white text-[10px] px-2 py-0.5 rounded-[2px]">
            送料無料
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-2 right-2 bg-[var(--color-primary,#2F4B3C)] text-white text-[10px] px-2 py-0.5 rounded-[2px]">
            NEW
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-sm text-[var(--color-text,#333333)] line-clamp-2 leading-snug mb-2">
          {product.name}
        </p>
        <p className="text-base font-bold text-[var(--color-primary,#2F4B3C)]">
          {formatPrice(product.price)}
          <span className="text-xs font-normal ml-0.5">円（税込）</span>
        </p>
      </div>
    </Link>
  );
}

export function ShopProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted,#666666)] py-8 text-center">
        該当する商品がありません。
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ShopProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
