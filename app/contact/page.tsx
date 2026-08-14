"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { PageHeader, PageSection } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { companyInfo } from "@/lib/data/company";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await submitContactForm(new FormData(e.currentTarget));
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error ?? "送信に失敗しました");
    }
  }

  return (
    <>
      <PageHeader
        title="お問い合わせ"
        breadcrumbs={[{ label: "トップ", href: "/" }, { label: "お問い合わせ" }]}
      />
      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-bold mb-4">お問い合わせ先</h2>
            <dl className="text-sm space-y-2 text-[var(--color-text-muted,#666666)]">
              <div><dt className="inline font-medium text-[var(--color-text,#333333)]">メール: </dt><dd className="inline">{companyInfo.email}</dd></div>
              <div><dt className="inline font-medium text-[var(--color-text,#333333)]">電話: </dt><dd className="inline">{companyInfo.phone}</dd></div>
              <div><dt className="inline font-medium text-[var(--color-text,#333333)]">営業時間: </dt><dd className="inline">{companyInfo.hours}</dd></div>
            </dl>
          </div>
          <div>
            {sent ? (
              <p className="text-[var(--color-primary,#2F4B3C)] font-medium">
                お問い合わせを受け付けました。担当者よりご連絡いたします。
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="name" label="お名前" required />
                <Input name="email" type="email" label="メールアドレス" required />
                <Textarea name="message" label="お問い合わせ内容" required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit">送信する</Button>
              </form>
            )}
          </div>
        </div>
      </PageSection>
    </>
  );
}
