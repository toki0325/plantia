import type { Metadata } from "next";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { CheckoutCompleteView } from "@/components/checkout/CheckoutCompleteView";
import { resolveCheckoutSession } from "@/app/actions/checkout";

export const metadata: Metadata = { title: "ご注文完了" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ session_id?: string; order?: string }> };

export default async function CheckoutCompletePage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const result = await resolveCheckoutSession(session_id);

  return (
    <>
      <PageHeader title="ご注文完了" />
      <PageSection>
        <CheckoutCompleteView result={result} />
      </PageSection>
    </>
  );
}
