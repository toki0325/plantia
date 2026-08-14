import type { Metadata } from "next";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "ご購入手続き" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        title="ご購入手続き"
        breadcrumbs={[
          { label: "トップ", href: "/" },
          { label: "カート", href: "/cart" },
          { label: "ご購入手続き" },
        ]}
      />
      <PageSection>
        <CheckoutForm />
      </PageSection>
    </>
  );
}
