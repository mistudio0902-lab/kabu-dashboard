import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "kabu-trader | Claude Code 自動売買 Live",
  description:
    "Claude Codeによる日本株完全自動売買のリアルタイムパフォーマンス公開。PEAD戦略・売買代金急増戦略のトレード履歴をリアルデータで公開。",
  openGraph: {
    title: "kabu-trader | Claude Code 自動売買 Live",
    description:
      "AIが日本株を自動売買。Claude Codeによる実資金運用のパフォーマンスをリアルタイム公開。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kabu-trader | Claude Code 自動売買 Live",
    description: "AIが日本株を自動売買。実資金運用のパフォーマンスをリアルタイム公開。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
