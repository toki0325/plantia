import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction, requireSessionUser } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "マイページ" };

export default async function MyPage() {
  const user = await requireSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="マイページ" breadcrumbs={[{ label: "トップ", href: "/" }, { label: "マイページ" }]} />
      <PageSection>
        <p className="mb-6">こんにちは、{user.name} さん</p>
        <nav className="space-y-3 max-w-md">
          <Link href="/mypage/orders" className="block p-4 border rounded-[2px] hover:bg-[var(--color-ivory,#F5F1E8)]">
            注文履歴
          </Link>
          <Link href="/mypage/favorite" className="block p-4 border rounded-[2px] hover:bg-[var(--color-ivory,#F5F1E8)]">
            お気に入り
          </Link>
        </nav>
        <form action={logoutAction} className="mt-8">
          <Button type="submit" variant="secondary">ログアウト</Button>
        </form>
      </PageSection>
    </>
  );
}
