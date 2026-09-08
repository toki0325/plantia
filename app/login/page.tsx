import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { safeNextPath } from "@/lib/safe-next";

export const metadata = { title: "ログイン" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);
  const user = await getSessionUser();
  if (user) redirect(nextPath);

  return (
    <>
      <PageHeader title="ログイン" breadcrumbs={[{ label: "トップ", href: "/" }, { label: "ログイン" }]} />
      <PageSection>
        <LoginForm nextPath={nextPath} />
      </PageSection>
    </>
  );
}
