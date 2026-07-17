import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivacyConsent } from "./components/privacy-consent";
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
  metadataBase: new URL("https://portalwargacgv.id"),
  applicationName: "CGV10",
  title: {
    default: "CGV10 - Portal Digital Warga",
    template: "%s | CGV10",
  },
  description:
    "Portal digital warga Cipta Greenville RT 010 / RW 021 untuk kabar warga, layanan, pengurus, transparansi iuran, kontak, dan PALUGADA CGV.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "CGV10 - Portal Digital Warga",
    description:
      "Kabar warga, layanan, pengurus, transparansi iuran, kontak, dan PALUGADA CGV dalam satu portal.",
    url: "https://portalwargacgv.id",
    siteName: "CGV10",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/assets/pwa/cgv10-screenshot-wide.png",
        width: 1280,
        height: 720,
        alt: "Portal digital warga CGV10",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CGV10 - Portal Digital Warga",
    description:
      "Portal digital warga Cipta Greenville RT 010 / RW 021.",
    images: ["/assets/pwa/cgv10-screenshot-wide.png"],
  },
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
        <PrivacyConsent />
      </body>
    </html>
  );
}
