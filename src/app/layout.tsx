import type { Metadata } from "next";
import { Cairo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GazaCare Connect — استشارات طبية عن بُعد",
  description:
    "استشارات طبية عن بُعد من غزة — ملف طبي، مرفقات، ورد الطبيب بمكان واحد.",
  icons: {
    icon: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-zinc-900 dark:text-zinc-50">
        <div className="gc-app relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
