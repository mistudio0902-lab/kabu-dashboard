import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0d2137",
};

export const metadata: Metadata = {
  title: "KabuDashboard | 株売データを一画面で監視",
  description:
    "Claude Codeによる日本株完全自動売買のリアルタイムパフォーマンス公開。PEAD戦略・売買代金急増戦略のトレード履歴をリアルデータで公開。",
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "KabuDashboard | 株売データを一画面で監視",
    description:
      "AIが日本株を自動売買。Claude Codeによる実資金運用のパフォーマンスをリアルタイム公開。",
    type: "website",
    siteName: "KabuDashboard",
    locale: "ja_JP",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KabuDashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KabuDashboard | 株売データを一画面で監視",
    description: "AIが日本株を自動売買。実資金運用のパフォーマンスをリアルタイム公開。",
    images: ["/og-image.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "KabuDashboard",
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
