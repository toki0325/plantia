"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mainCategories } from "@/lib/data/home";

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/search" method="get" className={`flex items-stretch ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="何をお探しですか？例）人工芝"
        className="flex-1 rounded-l-[2px] px-3 py-2 text-sm text-[var(--color-text,#333333)] bg-white outline-none min-w-0"
        aria-label="商品検索"
      />
      <button
        type="submit"
        className="rounded-r-[2px] bg-[var(--color-accent,#C6A45C)] px-3 md:px-4 flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
        aria-label="検索"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </form>
  );
}

export function SiteHeader({ user }: { user: { name: string } | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="bg-[var(--color-primary,#2F4B3C)] text-white sticky top-0 z-50">
      <div className="content-width">
        <div className="flex items-center gap-3 md:gap-4 min-h-[var(--header-height)] py-2 md:py-0">
          <Link href="/" className="shrink-0 text-base sm:text-lg md:text-xl font-bold tracking-tight">
            PLANTIA
          </Link>

          <SearchForm className="hidden md:flex flex-1 max-w-xl mx-auto" />

          <div className="hidden md:flex items-center gap-4 shrink-0 text-sm ml-auto">
            {user ? (
              <Link href="/mypage" className="hover:underline whitespace-nowrap text-white/90">
                {user.name}さん
              </Link>
            ) : (
              <Link href="/login" className="hover:underline whitespace-nowrap text-white/90">
                ログイン・新規会員登録
              </Link>
            )}
            <Link href="/cart" className="flex items-center gap-1 hover:underline whitespace-nowrap text-white/90">
              <CartIcon />
              カート
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden ml-auto">
            <Link
              href="/cart"
              className="p-2 text-white/90 hover:text-white"
              aria-label="カート"
            >
              <CartIcon />
            </Link>
            <button
              type="button"
              className="p-2 text-white/90 hover:text-white"
              aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <SearchForm className="w-full" />
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="メニューを閉じる"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="fixed inset-x-0 top-[var(--header-height)] z-50 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto bg-white text-[var(--color-text,#333333)] border-b border-[var(--color-border,#EAE6DD)] md:hidden shadow-lg"
            aria-label="モバイルメニュー"
          >
            <div className="content-width py-4 space-y-6">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted,#666666)] mb-2">カテゴリ</p>
                <ul className="space-y-1">
                  {mainCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={category.href}
                        className="block py-2 text-sm hover:text-[var(--color-primary,#2F4B3C)]"
                        onClick={() => setMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted,#666666)] mb-2">ショップ</p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link href="/ranking" className="block py-2 hover:text-[var(--color-primary,#2F4B3C)]" onClick={() => setMenuOpen(false)}>
                      ランキング
                    </Link>
                  </li>
                  <li>
                    <Link href="/newarrival" className="block py-2 hover:text-[var(--color-primary,#2F4B3C)]" onClick={() => setMenuOpen(false)}>
                      新着商品
                    </Link>
                  </li>
                  <li>
                    <Link href="/condition" className="block py-2 hover:text-[var(--color-primary,#2F4B3C)]" onClick={() => setMenuOpen(false)}>
                      条件から探す
                    </Link>
                  </li>
                  <li>
                    <Link href="/feature" className="block py-2 hover:text-[var(--color-primary,#2F4B3C)]" onClick={() => setMenuOpen(false)}>
                      特集記事
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border,#EAE6DD)]">
                {user ? (
                  <Link
                    href="/mypage"
                    className="inline-flex items-center justify-center h-11 px-4 text-sm bg-[var(--color-primary,#2F4B3C)] text-white rounded-[2px]"
                    onClick={() => setMenuOpen(false)}
                  >
                    マイページ（{user.name}さん）
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center h-11 px-4 text-sm bg-[var(--color-primary,#2F4B3C)] text-white rounded-[2px]"
                    onClick={() => setMenuOpen(false)}
                  >
                    ログイン・新規会員登録
                  </Link>
                )}
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center h-11 px-4 text-sm border border-[var(--color-primary,#2F4B3C)] text-[var(--color-primary,#2F4B3C)] rounded-[2px]"
                  onClick={() => setMenuOpen(false)}
                >
                  カートを見る
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
