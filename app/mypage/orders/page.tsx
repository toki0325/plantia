import { redirect } from "next/navigation";
import { requireSessionUser } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";

export const metadata = { title: "注文履歴" };

const demoOrders = [
  { id: "NG-20260720001", date: "2026-07-20", total: 5980, status: "発送済み" },
  { id: "NG-20260615002", date: "2026-06-15", total: 14800, status: "配送中" },
];

export default async function OrdersPage() {
  const user = await requireSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader
        title="注文履歴"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "注文履歴" },
        ]}
      />
      <PageSection>
        <ul className="divide-y divide-[var(--color-border,#EAE6DD)]">
          {demoOrders.map((order) => (
            <li key={order.id} className="py-4 flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{order.id}</p>
                <p className="text-xs text-[var(--color-text-muted,#666666)]">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{order.total.toLocaleString()}円（税込）</p>
                <p className="text-xs text-[var(--color-primary,#2F4B3C)]">{order.status}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--color-text-muted,#666666)] mt-6">※ MVPではダミーの注文履歴を表示しています。</p>
      </PageSection>
    </>
  );
}
