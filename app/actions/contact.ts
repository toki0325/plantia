"use server";

export async function submitContactForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length > 100) {
    return { success: false, error: "お名前を正しく入力してください" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "メールアドレスが正しくありません" };
  }
  if (!message || message.length > 2000) {
    return { success: false, error: "お問い合わせ内容を正しく入力してください" };
  }

  // MVP: メール送信は未実装。本番では Resend 等と連携
  return { success: true };
}
