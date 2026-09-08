/** Next.js がビルド時にインラインしないよう、動的に読む */
export function readEnv(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  const value = raw.trim().replace(/^["']|["']$/g, "");
  return value || null;
}
