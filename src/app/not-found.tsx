import Link from "next/link";
import { Plane } from "lucide-react";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <Plane className="mb-6 h-16 w-16 text-zinc-600" />
        <h1 className="font-bebas text-[8rem] leading-none tracking-tight text-zinc-100 sm:text-[10rem]">
          404
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          ページが見つかりませんでした
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
        >
          <Plane className="h-4 w-4" />
          ホームに戻る
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
