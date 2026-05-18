"use client";

import { useState, useEffect } from "react";
import { Bell, X, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type NotificationType = "line" | "x";

type Subscription = {
  id: string;
  route: string;
  type: NotificationType;
  webhookUrl: string;
  createdAt: string;
};

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationType>("line");
  const [route, setRoute] = useState("");
  const [webhook, setWebhook] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/subscriptions")
        .then((r) => r.json())
        .then(setSubscriptions)
        .catch(() => {});
    }
  }, [isOpen]);

  async function handleSubscribe() {
    if (!route || !webhook) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route, type: activeTab, webhookUrl: webhook }),
      });
      if (res.ok) {
        const newSub = await res.json();
        setSubscriptions((prev) => [...prev, newSub]);
        setRoute("");
        setWebhook("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/subscriptions?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Bell className="h-5 w-5" />
        {subscriptions.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold">
            {subscriptions.length}
          </span>
        )}
      </button>

      {isOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed bottom-20 right-6 z-50 w-[340px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-zinc-100 animate-fade-up"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900">通知設定</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("line")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                    activeTab === "line"
                      ? "bg-[#06C755] text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  LINE
                </button>
                <button
                  onClick={() => setActiveTab("x")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${
                    activeTab === "x"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  𝕏
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="路線 (例: NRT→BKK)"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="h-9 text-sm bg-zinc-50"
                />
                <Input
                  placeholder={
                    activeTab === "line"
                      ? "LINE Webhook URL"
                      : "X (Twitter) Webhook URL"
                  }
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="h-9 text-sm bg-zinc-50"
                />
                <Button
                  onClick={handleSubscribe}
                  className="w-full h-9 text-sm"
                  disabled={!route || !webhook || loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "この路線を通知登録"
                  )}
                </Button>
              </div>

              {subscriptions.length > 0 && (
                <div className="mt-4 border-t border-zinc-100 pt-3">
                  <span className="text-xs text-zinc-400 mb-2 block">
                    登録済み ({subscriptions.length}件)
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2"
                      >
                        <div>
                          <span className="text-xs font-mono font-medium text-zinc-700">
                            {sub.route}
                          </span>
                          <span className="ml-2 text-[10px] text-zinc-400 uppercase">
                            {sub.type}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemove(sub.id)}
                          className="text-zinc-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
    </>
  );
}
