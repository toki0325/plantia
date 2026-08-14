import Image from "next/image";

export function TopHero() {
  return (
    <section className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] min-h-[180px] max-h-[780px] overflow-hidden">
      <Image
        src="/images/hero/hero_main_v1.jpg"
        alt="庭に、いちばんの居場所を。"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-4">
        <p className="text-white/90 text-sm md:text-base mb-2 tracking-wide">
          NOVAGRACE
        </p>
        <h1 className="text-white text-xl sm:text-2xl md:text-4xl font-bold drop-shadow-lg leading-snug">
          庭に、いちばんの居場所を。
        </h1>
      </div>
    </section>
  );
}
