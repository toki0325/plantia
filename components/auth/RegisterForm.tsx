"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";

export function RegisterForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const passwordConfirm = String(form.get("passwordConfirm"));

    if (password !== passwordConfirm) {
      setLoading(false);
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
      router.refresh();
      router.push(nextPath);
      return;
    }
    setLoading(false);
    setError(result.error ?? "登録に失敗しました");
  }

  const loginHref =
    nextPath === "/mypage" ? "/login" : `/login?next=${encodeURIComponent(nextPath)}`;

  return (
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登録中..." : "会員登録してはじめる"}
      </Button>
      <p className="text-sm text-center">
        <Link href={loginHref} className="text-[var(--color-primary,#2F4B3C)] underline">
          ログインはこちら
        </Link>
      </p>
    </form>
  );
}
