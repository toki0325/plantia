import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/data/home";

type ProductCardProps = {
  product: Product;
  dark?: boolean;
};

export function ProductCard({ product, dark = false }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={`group block ${dark ? "product-section-dark" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden bg-white mb-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 16vw"
        />
        {product.freeShipping && (
          <span className="absolute bottom-2 left-2 bg-[var(--cainz-orange)] text-white text-[10px] md:text-xs px-2 py-0.5 font-medium">
            送料無料
          </span>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 bg-white text-[var(--text-default)] text-[10px] px-1.5 py-0.5">
            {product.badge}
          </span>
        )}
      </div>
      <p
        className={`product-name text-xs leading-snug line-clamp-2 mb-1 ${
          dark ? "text-[#aaaaaa]" : "text-[var(--text-description)]"
        }`}
      >
        {product.name}
      </p>
      <p
        className={`product-price text-sm md:text-base font-bold ${
          dark ? "text-white" : "text-[var(--text-default)]"
        }`}
      >
        {formatPrice(product.price)}
        <span className="text-xs font-normal ml-0.5">円</span>
      </p>
    </Link>
  );
}

type ProductGridProps = {
  products: Product[];
  dark?: boolean;
};

export function ProductGrid({ products, dark = false }: ProductGridProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 ${
        dark ? "product-section-dark" : ""
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} dark={dark} />
      ))}
    </div>
  );
}

type ProductCarouselProps = {
  products: Product[];
};

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <div className="product-carousel pb-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
