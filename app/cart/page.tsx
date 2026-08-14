import type { Metadata } from "next";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "カート" };

export default function CartPage() {
  return (
    <>
      <PageHeader
        title="カート"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "カート" },
        ]}
      />
      <PageSection>
        <CartView />
      </PageSection>
    </>
  );
}
