"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const passwordConfirm = String(form.get("passwordConfirm"));

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }

    const result = await registerAction(
      String(form.get("name")),
      String(form.get("email")),
      password,
      passwordConfirm,
    );
    if (result.success) {
      router.push("/mypage");
    } else {
      setError(result.error ?? "登録に失敗しました");
    }
  }

  return (
    <>
      <PageHeader
        title="新規会員登録"
        breadcrumbs={[{ label: "トップ", href: "/" }, { label: "新規会員登録" }]}
      />
      <PageSection>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <Input name="name" label="お名前" required />
          <Input name="email" type="email" label="メールアドレス" required />
          <Input
            name="password"
            type="password"
            label="パスワード（8文字以上）"
            minLength={8}
            required
          />
          <Input
            name="passwordConfirm"
            type="password"
            label="パスワード（確認）"
            minLength={8}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            会員登録
          </Button>
          <p className="text-xs text-[var(--color-text-muted,#666666)] text-center leading-relaxed">
            ※ MVPでは、このブラウザを閉じると登録情報は消えます。同じ端末内での一時的な会員登録です。
          </p>
          <p className="text-sm text-center">
            <Link href="/login" className="text-[var(--color-primary,#2F4B3C)] underline">
              ログインはこちら
            </Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
