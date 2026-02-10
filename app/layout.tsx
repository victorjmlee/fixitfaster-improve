import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fix It Faster",
  description: "Datadog 트러블슈팅 경연대회",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="font-semibold text-[var(--accent)]">
              Fix It Faster
            </Link>
            <nav className="flex gap-6 text-sm text-zinc-400">
              <Link href="/" className="hover:text-white">챌린지</Link>
              <Link href="/leaderboard" className="hover:text-white">리더보드</Link>
              <Link href="/setup" className="hover:text-white">설정</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
