import Image from "next/image";
import { heroImages } from "@/lib/data/home";

export function HeroCollage() {
  const items = [
    { key: "a", className: "hero-collage__item--a", src: heroImages.a },
    { key: "b", className: "hero-collage__item--b", src: heroImages.b },
    { key: "c", className: "hero-collage__item--c", src: heroImages.c, overlay: true },
    { key: "d", className: "hero-collage__item--d", src: heroImages.d },
    { key: "e", className: "hero-collage__item--e", src: heroImages.e },
  ] as const;

  return (
    <div className="content-width">
      <div className="hero-collage">
        {items.map((item) => (
          <div
            key={item.key}
            className={`${item.className} relative overflow-hidden`}
          >
            <Image
              src={item.src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
              priority={item.key === "c"}
            />
            {"overlay" in item && item.overlay && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                <span className="bg-[var(--primary-color)]/90 text-white text-xs md:text-sm px-3 py-1 mb-2">
                  おしゃれな
                </span>
                <span className="text-white text-lg md:text-2xl font-bold drop-shadow-lg">
                  庭づくり
                </span>
                <span className="text-white text-sm md:text-base mt-1 drop-shadow">
                  ガーデニング用品 特集
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
