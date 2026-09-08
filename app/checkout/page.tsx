import type { Metadata } from "next";
import { Suspense } from "react";
import { getSessionUser } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "ご購入手続き" };

export default async function CheckoutPage() {
  const user = await getSessionUser();

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
        <Suspense>
          <CheckoutForm user={user} />
        </Suspense>
      </PageSection>
    </>
  );
}
