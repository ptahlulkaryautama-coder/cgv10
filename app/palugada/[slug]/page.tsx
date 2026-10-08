import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { palugadaDetailItems } from "@/lib/portal-data";
import { SellerStorefront, type StorefrontSeller } from "./seller-storefront";

type DetailPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return palugadaDetailItems.map((item) => ({ slug: item.detailSlug }));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = palugadaDetailItems.find((entry) => entry.detailSlug === slug);
  return item
    ? {
        title: `${item.name} | PALUGADA CGV`,
        description: item.detailDescription,
        openGraph: {
          title: `${item.name} · PALUGADA CGV`,
          description: item.detailDescription,
        },
      }
    : { title: "PALUGADA CGV" };
}

export default async function PalugadaDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = palugadaDetailItems.find((entry) => entry.detailSlug === slug);
  if (!item) notFound();

  const structuredProducts =
    item.detailSlug === "donat-kentang-warga"
      ? [
          {
            id: "maniez-coklat",
            name: "Donat Kentang Coklat Meses",
            variant: "Box 6 pcs",
            description: "Donat kentang lembut dengan taburan meses coklat premium.",
            price: 20000,
            imageSrc: item.galleryImages?.[0]?.src ?? item.imageSrc,
            imageAlt: "Donat kentang coklat Ma'niez Donut",
            availability: "Tersedia",
          },
          {
            id: "maniez-keju",
            name: "Donat Kentang Keju Gurih",
            variant: "Box 6 pcs",
            description: "Donat kentang lembut dengan limpahan keju cheddar gurih.",
            price: 22000,
            imageSrc: item.galleryImages?.[1]?.src ?? item.imageSrc,
            imageAlt: "Donat kentang keju Ma'niez Donut",
            availability: "Tersedia",
          },
          {
            id: "maniez-red-velvet",
            name: "Donat Red Velvet",
            variant: "Box 6 pcs",
            description: "Pilihan red velvet manis pas untuk teman santai sore.",
            price: 24000,
            imageSrc: item.galleryImages?.[2]?.src ?? item.imageSrc,
            imageAlt: "Donat red velvet Ma'niez Donut",
            availability: "Pre-order H-1",
          },
        ]
      : undefined;

  const seller: StorefrontSeller = {
    slug: item.detailSlug,
    name: item.name,
    category: item.category,
    cluster: item.cluster,
    description: item.detailDescription,
    imageSrc: item.imageSrc,
    coverImageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    galleryImages: item.galleryImages ?? [],
    whatsappHref: item.whatsappHref,
    whatsappLabel: item.whatsappLabel,
    whatsappDisplayNumber: item.whatsappDisplayNumber,
    sellerStatus: item.sellerStatus,
    sellerStatusLabel: item.sellerStatusLabel,
    sellerStatusNote: item.sellerStatusNote,
    availabilityNote: item.availabilityNote,
    priceNote: item.price,
    highlights: item.exampleScope,
    structuredProducts,
  };

  return <SellerStorefront seller={seller} />;
}
