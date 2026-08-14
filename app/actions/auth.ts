"use server";

import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "novagrace-session";
const TEMP_ACCOUNT_COOKIE = "novagrace-temp-account";

type TempAccount = {
  name: string;
  email: string;
  passwordHash: string;
};

type SessionUser = {
  id: string;
  email: string;
  name: string;
};

/** MVP: ブラウザセッション内のみ有効な一時アカウント。DBには保存しない */
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function getTempAccount(cookieStore: Awaited<ReturnType<typeof cookies>>): TempAccount | null {
  const raw = cookieStore.get(TEMP_ACCOUNT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TempAccount;
  } catch {
    return null;
  }
}

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  // maxAge なし = ブラウザを閉じると失効
};

export async function loginAction(email: string, password: string) {
  if (!email.trim() || !password.trim()) {
    return { success: false, error: "メールアドレスとパスワードを入力してください" };
  }

  const cookieStore = await cookies();
  const account = getTempAccount(cookieStore);

  if (
    !account ||
    account.email !== email.trim() ||
    account.passwordHash !== hashPassword(password)
  ) {
    return {
      success: false,
      error: "メールアドレスまたはパスワードが正しくありません",
    };
  }

  cookieStore.set(SESSION_COOKIE, account.email, sessionCookieOptions);
  return { success: true };
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  passwordConfirm: string,
) {
  if (!name.trim() || name.length > 100) {
    return { success: false, error: "お名前を正しく入力してください" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "メールアドレスが正しくありません" };
  }
  if (password.length < 8) {
    return { success: false, error: "パスワードは8文字以上で入力してください" };
  }
  if (password !== passwordConfirm) {
    return { success: false, error: "パスワードが一致しません" };
  }

  const account: TempAccount = {
    name: name.trim(),
    email: email.trim(),
    passwordHash: hashPassword(password),
  };

  const cookieStore = await cookies();
  cookieStore.set(TEMP_ACCOUNT_COOKIE, JSON.stringify(account), sessionCookieOptions);
  cookieStore.set(SESSION_COOKIE, account.email, sessionCookieOptions);

  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE)?.value;
  if (!email) return null;

  const account = getTempAccount(cookieStore);
  if (!account || account.email !== email) return null;

  return {
    id: account.email,
    email: account.email,
    name: account.name,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}
