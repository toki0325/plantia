export type StoredOrderItem = {
  name: string;
  quantity: number;
  lineTotal: number;
};

export type StoredOrder = {
  id: string;
  email: string;
  date: string;
  total: number;
  status: "支払い済み" | "入金待ち" | "キャンセル";
  items: StoredOrderItem[];
};

const STORAGE_KEY = "plantia-orders";

function readAll(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders: StoredOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.slice(0, 50)));
}

export function upsertStoredOrder(order: StoredOrder) {
  const orders = readAll().filter((item) => item.id !== order.id);
  writeAll([order, ...orders]);
}

export function getStoredOrdersForEmail(email: string): StoredOrder[] {
  const normalized = email.trim().toLowerCase();
  return readAll()
    .filter((order) => order.email.trim().toLowerCase() === normalized)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
