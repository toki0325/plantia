import Link from "next/link";
import Image from "next/image";
import { browseCategories } from "@/lib/data/home";

const shopLinks = [
  { label: "ご利用ガイド", href: "/guide" },
  { label: "よくある質問", href: "/guide/faq" },
  { label: "会社概要", href: "/company" },
  { label: "特定商取引法に基づく表記", href: "/legal" },
];

const supportLinks = [
  { label: "お問い合わせ", href: "/contact" },
  { label: "利用規約", href: "/terms" },
  { label: "プライバシーポリシー", href: "/privacy" },
  { label: "特集記事", href: "/feature" },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="bg-[var(--color-primary,#2F4B3C)] text-white/80 py-10">
        <div className="content-width grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2">
            <h3 className="text-white font-bold mb-4">PLANTIA</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {browseCategories.map((category) => (
                <li key={category.id}>
                  <Link href={category.href} className="hover:text-white">{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">ショップ情報</h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">サポート</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-[var(--color-ivory,#F5F1E8)] py-6">
        <div className="content-width flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/images/icon_v1.png" alt="PLANTIA" width={32} height={32} />
          <p className="text-xs text-[var(--color-text-muted,#666666)]">©2026 PLANTIA</p>
        </div>
      </div>
    </footer>
  );
}
