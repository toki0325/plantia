import { redirect } from "next/navigation";
import { requireSessionUser } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { OrderHistoryList } from "@/components/mypage/OrderHistoryList";

export const metadata = { title: "注文履歴" };

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
        <OrderHistoryList email={user.email} />
      </PageSection>
    </>
  );
}
