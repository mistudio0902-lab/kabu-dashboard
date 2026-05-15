import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0d2137",
};

export const metadata: Metadata = {
  title: "kabu dashboard | AIによる日本株自動売買の実績公開",
  description:
    "Claude Codeが日本株を自律的に売買。PEAD戦略・売買代金急増戦略の2本柱で実資金運用中。トレード履歴・損益をリアルタイム公開。",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "kabu dashboard | AIによる日本株自動売買の実績公開",
    description:
      "AIが日本株を自動売買。Claude Codeによる実資金運用のパフォーマンスをリアルタイム公開。",
    type: "website",
    siteName: "kabu dashboard",
    locale: "ja_JP",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "kabu dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "kabu dashboard | AIによる日本株自動売買の実績公開",
    description: "AIが日本株を自動売買。実資金運用のパフォーマンスをリアルタイム公開。",
    images: ["/og-image.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "kabu dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
