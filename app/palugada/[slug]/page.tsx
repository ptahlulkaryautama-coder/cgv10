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
  return item ? { title: `${item.name} | PALUGADA CGV`, description: item.detailDescription } : { title: "PALUGADA CGV" };
}

export default async function PalugadaDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const item = palugadaDetailItems.find((entry) => entry.detailSlug === slug);
  if (!item) notFound();

  const seller: StorefrontSeller = {
    slug: item.detailSlug,
    name: item.name,
    category: item.category,
    cluster: item.cluster,
    description: item.detailDescription,
    imageSrc: item.imageSrc,
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
  };

  return <SellerStorefront seller={seller} />;
}
