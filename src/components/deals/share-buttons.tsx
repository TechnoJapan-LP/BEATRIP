"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export function ShareButtons({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title}\n${description}`);

  const xShareUrl = `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-400 mr-1">
        <Share2 className="h-3 w-3 inline-block mr-0.5" />
        共有
      </span>
      <a
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 text-white transition-colors hover:bg-zinc-700"
        title="Xでシェア"
      >
        <XIcon className="h-3.5 w-3.5" />
      </a>
      <a
        href={lineShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#06C755] text-white transition-colors hover:bg-[#05b34d]"
        title="LINEでシェア"
      >
        <LineIcon className="h-4 w-4" />
      </a>
      <button
        onClick={copyLink}
        className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
        title="リンクをコピー"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
