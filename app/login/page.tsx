"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const result = await loginAction(
      String(form.get("email")),
      String(form.get("password")),
    );
    if (result.success) {
      router.push("/mypage");
    } else {
      setError(result.error ?? "ログインに失敗しました");
    }
  }

  return (
    <>
      <PageHeader title="ログイン" breadcrumbs={[{ label: "トップ", href: "/" }, { label: "ログイン" }]} />
      <PageSection>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <Input name="email" type="email" label="メールアドレス" required />
          <Input name="password" type="password" label="パスワード" required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">ログイン</Button>
          <p className="text-sm text-center">
            <Link href="/register" className="text-[var(--color-primary,#2F4B3C)] underline">
              新規会員登録はこちら
            </Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
