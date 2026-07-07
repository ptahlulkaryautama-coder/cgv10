import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegister } from "./components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "CGV10",
  title: "CGV10 — Portal Digital Warga",
  description:
    "Portal digital warga Cipta Greenville RT 010 / RW 021 untuk kabar warga, layanan, pengurus, transparansi iuran, kontak, dan PALUGADA CGV.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CGV10",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/assets/brand/favicon.svg",
    apple: "/assets/pwa/cgv10-pwa-icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#003d34",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background font-sans text-foreground">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
