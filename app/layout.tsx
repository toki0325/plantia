import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_JP } from "next/font/google";
import { getSessionUser } from "@/app/actions/auth";
import { CartProvider } from "@/components/providers/CartProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PLANTIA｜庭に、いちばんの居場所を。",
    template: "%s｜PLANTIA",
  },
  description:
    "頑張りすぎない、上質な庭時間。人工芝・ジョイントタイル・ガーデンファニチャー・園芸用品・雑草対策まで、統一感のあるおしゃれな庭・ベランダづくりを提案します。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>
          <SiteHeader user={user ? { name: user.name } : null} />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
