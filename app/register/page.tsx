import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = { title: "新規会員登録" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);
  const user = await getSessionUser();
  if (user) redirect(nextPath);

  return (
    <>
      <PageHeader
        title="新規会員登録"
        breadcrumbs={[{ label: "トップ", href: "/" }, { label: "新規会員登録" }]}
      />
      <PageSection>
        <RegisterForm nextPath={nextPath} />
      </PageSection>
    </>
  );
}
