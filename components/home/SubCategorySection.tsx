import Image from "next/image";
import Link from "next/link";

type SubCategoryTabsProps = {
  items: {
    id: string;
    name: string;
    image: string;
    href: string;
  }[];
};

export function SubCategoryTabs({ items }: SubCategoryTabsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group text-center"
        >
          <div className="relative aspect-square overflow-hidden mb-2 border border-[var(--border-default)]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="120px"
            />
          </div>
          <span className="text-xs md:text-sm text-[var(--text-default)] group-hover:text-[var(--text-primary)]">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

type ImageCarouselProps = {
  images: string[];
  alt?: string;
};

export function ImageCarousel({ images, alt = "" }: ImageCarouselProps) {
  if (images.length === 0) return null;

  return (
    <div className="image-carousel mb-6">
      {images.map((src, i) => (
        <div key={src} className="relative aspect-[1220/752] overflow-hidden">
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
