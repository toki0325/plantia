"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormFields";
import type { ProductDetail } from "@/lib/types";
import { formatPrice } from "@/lib/pricing";
import { TAX_INCLUDED_LABEL } from "@/lib/constants";

type ProductDetailViewProps = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product.sizes?.[0]?.value ?? "");
  const [color, setColor] = useState(product.colors?.[0]?.value ?? "");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product.id, quantity, {
      selectedSize: size || undefined,
      selectedColor: color || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] border border-[var(--color-border,#EAE6DD)] mb-3">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="flex gap-2">
          {product.images.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => setMainImage(img)}
              className={`relative w-16 h-16 rounded-[2px] overflow-hidden border-2 ${mainImage === img ? "border-[var(--color-primary,#2F4B3C)]" : "border-transparent"}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text,#333333)] leading-snug mb-3">
          {product.name}
        </h1>
        <p className="text-2xl font-bold text-[var(--color-primary,#2F4B3C)] mb-1">
          {formatPrice(product.price)}円{TAX_INCLUDED_LABEL}
        </p>
        {product.freeShipping && (
          <p className="text-xs text-[var(--color-accent,#C6A45C)] mb-4">送料無料対象商品</p>
        )}

        {product.conditionTags && product.conditionTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {product.conditionTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-[var(--color-ivory,#F5F1E8)] text-[var(--color-primary,#2F4B3C)] rounded-[2px]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {product.sizes && (
            <Select
              label="サイズ"
              options={product.sizes}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          )}
          {product.colors && (
            <Select
              label="カラー"
              options={product.colors}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          )}
          <div className="space-y-1">
            <label htmlFor="quantity" className="block text-sm">
              数量
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24 border border-[var(--color-border,#EAE6DD)] rounded-[2px] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleAdd} className="flex-1">
            {added ? "カートに追加しました" : "カートに追加"}
          </Button>
          <Button variant="secondary" href="/cart" className="flex-1">
            カートを見る
          </Button>
        </div>

        <div className="mt-8 space-y-4 text-sm text-[var(--color-text-muted,#666666)]">
          <div>
            <h2 className="font-bold text-[var(--color-text,#333333)] mb-2">商品説明</h2>
            <p>{product.description}</p>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProductReviews({ product }: { product: ProductDetail }) {
  return (
    <div className="mt-12">
      <h2 className="text-lg font-bold text-[var(--color-primary,#2F4B3C)] mb-4">
        レビュー
      </h2>
      <div className="space-y-4">
        {product.reviews.map((review) => (
          <div
            key={review.id}
            className="border border-[var(--color-border,#EAE6DD)] rounded-[2px] p-4"
          >
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">{review.author}</span>
              <span className="text-[var(--color-text-muted,#666666)]">{review.date}</span>
            </div>
            <p className="text-[var(--color-accent,#C6A45C)] text-sm mb-2">
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </p>
            <p className="text-sm text-[var(--color-text-muted,#666666)]">{review.comment}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted,#666666)] mt-4">
        ※ MVPではレビュー表示のみ。投稿機能は今後追加予定です。
      </p>
    </div>
  );
}
