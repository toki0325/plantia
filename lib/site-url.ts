import { headers } from "next/headers";
import { readEnv } from "@/lib/env";

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHost(host: string): boolean {
  return host.includes("localhost") || host.startsWith("127.0.0.1");
}

export async function getRequestBaseUrl(): Promise<string> {
  const configured = readEnv("KOMOJU_RETURN_BASE_URL");
  if (configured) return stripSlash(configured);

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) {
    throw new Error("サイトのURLを特定できません。KOMOJU_RETURN_BASE_URL を設定してください。");
  }
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (isLocalHost(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/** KOMOJU決済画面は https のため、localhost の画像は表示できない */
export async function getPublicAssetBaseUrl(): Promise<string> {
  const configured =
    readEnv("KOMOJU_IMAGE_BASE_URL") || readEnv("NEXT_PUBLIC_SITE_URL");
  if (configured) return stripSlash(configured);

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  const requestBase = await getRequestBaseUrl();
  const host = requestBase.replace(/^https?:\/\//, "").split("/")[0] ?? "";
  if (isLocalHost(host)) {
    // KOMOJUはhttpsのため、localhost画像は表示されない
    return "https://raw.githubusercontent.com/toki0325/plantia/main/public";
  }

  return requestBase;
}

export function toAbsoluteAssetUrl(
  baseUrl: string,
  path: string | undefined,
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${stripSlash(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
}
