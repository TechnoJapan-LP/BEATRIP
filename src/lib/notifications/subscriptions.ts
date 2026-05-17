import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

// Vercel本番では /tmp に保存（永続化は将来 KV へ移行）
const READ_BASE = join(process.cwd(), "data");
const WRITE_BASE =
  process.env.VERCEL === "1" ? "/tmp/beatrip" : READ_BASE;
const SUBS_FILE = join(WRITE_BASE, "subscriptions.json");
const SUBS_FILE_RO = join(READ_BASE, "subscriptions.json");
const ALERTS_FILE = join(WRITE_BASE, "alerts.json");
const ALERTS_FILE_RO = join(READ_BASE, "alerts.json");

async function readJsonWithFallback<T>(primary: string, fallback: string, defaultValue: T): Promise<T> {
  try {
    const raw = await readFile(primary, "utf-8");
    return JSON.parse(raw);
  } catch {
    try {
      const raw = await readFile(fallback, "utf-8");
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }
}

export type Subscription = {
  id: string;
  route: string;
  type: "line" | "x";
  webhookUrl: string;
  createdAt: string;
};

export type AlertChannel = "push" | "line" | "slack" | "webhook";

export type Alert = {
  id: string;
  target: string;
  targetType: "route" | "airline";
  channels: AlertChannel[];
  pushSubscription?: PushSubscriptionJSON;
  webhookUrl?: string;
  createdAt: string;
};

type PushSubscriptionJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function loadSubscriptions(): Promise<Subscription[]> {
  return readJsonWithFallback<Subscription[]>(SUBS_FILE, SUBS_FILE_RO, []);
}

export async function addSubscription(
  sub: Omit<Subscription, "id" | "createdAt">
): Promise<Subscription> {
  await mkdir(WRITE_BASE, { recursive: true });
  const subs = await loadSubscriptions();
  const newSub: Subscription = {
    ...sub,
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  subs.push(newSub);
  try {
    await writeFile(SUBS_FILE, JSON.stringify(subs, null, 2));
  } catch (e) {
    console.warn("[Subscriptions] Failed to persist:", e);
  }
  return newSub;
}

export async function removeSubscription(id: string): Promise<boolean> {
  const subs = await loadSubscriptions();
  const filtered = subs.filter((s) => s.id !== id);
  if (filtered.length === subs.length) return false;
  try {
    await writeFile(SUBS_FILE, JSON.stringify(filtered, null, 2));
  } catch (e) {
    console.warn("[Subscriptions] Failed to persist:", e);
  }
  return true;
}

export async function loadAlerts(): Promise<Alert[]> {
  return readJsonWithFallback<Alert[]>(ALERTS_FILE, ALERTS_FILE_RO, []);
}

async function saveAlerts(alerts: Alert[]) {
  try {
    await mkdir(WRITE_BASE, { recursive: true });
    await writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  } catch (e) {
    console.warn("[Alerts] Failed to persist:", e);
  }
}

export async function addAlert(
  alert: Omit<Alert, "id" | "createdAt">
): Promise<Alert> {
  const alerts = await loadAlerts();
  const newAlert: Alert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  await saveAlerts(alerts);
  return newAlert;
}

export async function removeAlert(id: string): Promise<boolean> {
  const alerts = await loadAlerts();
  const filtered = alerts.filter((a) => a.id !== id);
  if (filtered.length === alerts.length) return false;
  await saveAlerts(filtered);
  return true;
}

export async function getAlertsForTarget(
  target: string,
  targetType: "route" | "airline"
): Promise<Alert[]> {
  const alerts = await loadAlerts();
  return alerts.filter(
    (a) =>
      a.targetType === targetType &&
      a.target.toLowerCase() === target.toLowerCase()
  );
}

export async function getMatchingAlerts(
  airlineCode: string,
  routes: string[]
): Promise<Alert[]> {
  const alerts = await loadAlerts();
  return alerts.filter((a) => {
    if (a.targetType === "airline") {
      return a.target.toLowerCase() === airlineCode.toLowerCase();
    }
    return routes.some(
      (r) =>
        r.toLowerCase().includes(a.target.toLowerCase()) ||
        a.target.toLowerCase().includes(r.toLowerCase())
    );
  });
}
