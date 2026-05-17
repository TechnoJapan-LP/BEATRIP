"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const STORAGE_KEY = "beatrip-favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function FavoriteButton({ dealId }: { dealId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setIsFavorited(getFavorites().includes(dealId));
  }, [dealId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const favs = getFavorites();
    const next = isFavorited
      ? favs.filter((id) => id !== dealId)
      : [...favs, dealId];
    setFavorites(next);
    setIsFavorited(!isFavorited);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
      className="flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm p-1.5 shadow-sm transition-all hover:bg-white hover:shadow-md sm:p-2"
      style={{
        transform: animate ? "scale(1.25)" : "scale(1)",
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Heart
        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
          isFavorited
            ? "fill-rose-500 text-rose-500"
            : "fill-none text-zinc-500"
        }`}
      />
    </button>
  );
}
