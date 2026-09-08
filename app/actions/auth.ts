"use server";

import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "plantia-session";
const TEMP_ACCOUNT_COOKIE = "plantia-temp-account";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type TempAccount = {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  postalCode?: string;
  address?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  postalCode?: string;
  address?: string;
};

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

function parseAccount(raw: string | undefined): TempAccount | null {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as TempAccount;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw)) as TempAccount;
    } catch {
      try {
        return JSON.parse(raw) as TempAccount;
      } catch {
        return null;
      }
    }
  }
}

function getTempAccount(cookieStore: Awaited<ReturnType<typeof cookies>>): TempAccount | null {
  return parseAccount(cookieStore.get(TEMP_ACCOUNT_COOKIE)?.value);
}

function writeAccount(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  account: TempAccount,
) {
  cookieStore.set(
    TEMP_ACCOUNT_COOKIE,
    Buffer.from(JSON.stringify(account), "utf8").toString("base64"),
    cookieOptions(),
  );
}

function writeSession(cookieStore: Awaited<ReturnType<typeof cookies>>, email: string) {
  cookieStore.set(SESSION_COOKIE, email, cookieOptions());
}

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

  writeAccount(cookieStore, account);
  writeSession(cookieStore, account.email);
  return { success: true };
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  passwordConfirm: string,
) {
  if (!name.trim() || name.length > 100) return { success: false, error: "お名前を正しく入力してください" };
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
  writeAccount(cookieStore, account);
  writeSession(cookieStore, account.email);

  return { success: true };
}

export async function saveCheckoutProfile(data: {
  name: string;
  phone: string;
  postalCode: string;
  address: string;
}) {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE)?.value;
  const account = getTempAccount(cookieStore);
  if (!email || !account || account.email !== email) return;

  writeAccount(cookieStore, {
    ...account,
    name: data.name.trim() || account.name,
    phone: data.phone,
    postalCode: data.postalCode,
    address: data.address,
  });
  writeSession(cookieStore, account.email);
}

export async function refreshSessionCookies() {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE)?.value;
  const account = getTempAccount(cookieStore);
  if (!email || !account || account.email !== email) return;
  writeAccount(cookieStore, account);
  writeSession(cookieStore, email);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
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
    phone: account.phone,
    postalCode: account.postalCode,
    address: account.address,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}
