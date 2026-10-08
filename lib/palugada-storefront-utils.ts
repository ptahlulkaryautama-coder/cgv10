/**
 * Unified PALUGADA Storefront & Form Utilities
 * Handles WhatsApp normalization, structured price formatting, weekly schedules,
 * Jakarta timezone operational status, clean description separation, and data serialization/parsing.
 */

export type PriceType = "fixed" | "starting_at" | "range" | "contact";

export type PriceConfig = {
  type: PriceType;
  amount?: number | null;
  min?: number | null;
  max?: number | null;
  unit?: string | null;
};

export type DaySchedule = {
  open: boolean;
  start: string; // "07:00"
  end: string;   // "23:00"
};

export type WeeklySchedule = {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
};

export type StoreProductItem = {
  id: string;
  name: string;
  description?: string;
  price?: number | null;
  unit?: string;
  imageSrc?: string;
  availability?: "available" | "preorder" | "out_of_stock";
  sortOrder?: number;
};

export type StructuredPalugadaListing = {
  id?: string;
  name: string;
  category: "kuliner" | "jasa" | "barang" | "properti" | "lainnya";
  ownerName?: string;
  whatsapp: string;
  tagline?: string;
  description: string;
  aboutStory?: string;
  cluster: string;
  addressDetail?: string;
  mapsUrl?: string;
  serviceTypes: string[];
  deliveryArea?: string;
  orderNotes?: string;
  priceConfig: PriceConfig;
  scheduleType: "schedule" | "appointment";
  weeklySchedule: WeeklySchedule;
  sellerStatus: "online" | "offline";
  serviceNotes?: string;
  highlights: string[];
  structuredProducts: StoreProductItem[];
  adminNotes?: string;
  logoUrl?: string;
  coverUrl?: string;
  menuPhotoUrl?: string;
  galleryUrls: string[];
};

export const defaultDaySchedule: DaySchedule = {
  open: true,
  start: "08:00",
  end: "21:00",
};

export const defaultWeeklySchedule: WeeklySchedule = {
  mon: { open: true, start: "08:00", end: "21:00" },
  tue: { open: true, start: "08:00", end: "21:00" },
  wed: { open: true, start: "08:00", end: "21:00" },
  thu: { open: true, start: "08:00", end: "21:00" },
  fri: { open: true, start: "08:00", end: "21:00" },
  sat: { open: true, start: "08:00", end: "21:00" },
  sun: { open: true, start: "08:00", end: "21:00" },
};

export const dayKeyLabels: Record<keyof WeeklySchedule, string> = {
  mon: "Senin",
  tue: "Selasa",
  wed: "Rabu",
  thu: "Kamis",
  fri: "Jumat",
  sat: "Sabtu",
  sun: "Minggu",
};

export const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/**
 * Normalizes Indonesian and international WhatsApp numbers.
 * Converts 08xxx -> 628xxx, strips spaces, dashes, and letters.
 */
export function normalizeWhatsappNumber(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits.length < 7) return null;

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return digits;
}

/**
 * Formats a WhatsApp link with an encoded pre-filled message.
 */
export function buildWhatsappUrl(rawContact?: string | null, message?: string): string | null {
  const normalized = normalizeWhatsappNumber(rawContact);
  if (!normalized) return null;
  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Clean up corrupted encoding characters (e.g. \uFFFD or lone symbols)
 */
export function cleanCorruptChars(text?: string | null): string {
  if (!text) return "";
  return text.replace(/\uFFFD/g, "·").trim();
}

/**
 * Formats price from structured config with unit and formatting.
 */
export function formatPriceFromConfig(config: PriceConfig): string {
  const unitSuffix = config.unit?.trim() ? ` / ${config.unit.trim()}` : "";

  if (config.type === "contact") {
    return "Hubungi penjual";
  }

  if (config.type === "fixed" && config.amount != null && !isNaN(config.amount)) {
    return `${rupiahFormatter.format(config.amount)}${unitSuffix}`;
  }

  if (config.type === "starting_at" && config.amount != null && !isNaN(config.amount)) {
    return `Mulai ${rupiahFormatter.format(config.amount)}${unitSuffix}`;
  }

  if (
    config.type === "range" &&
    config.min != null &&
    config.max != null &&
    !isNaN(config.min) &&
    !isNaN(config.max)
  ) {
    return `${rupiahFormatter.format(config.min)} – ${rupiahFormatter.format(config.max)}${unitSuffix}`;
  }

  return "Hubungi penjual";
}

/**
 * Formats display price for catalog/storefront without making wild guesses on ambiguous legacy data.
 */
export function formatDisplayPrice(rawPrice?: string | null, category?: string): string {
  if (!rawPrice || !rawPrice.trim()) return "Hubungi penjual";

  const clean = cleanCorruptChars(rawPrice).trim();
  const lower = clean.toLowerCase();

  if (lower === "hubungi penjual" || lower === "gratis" || lower === "informasi menyusul") {
    return clean;
  }

  // Already prefixed with Rp
  if (clean.startsWith("Rp") || clean.startsWith("Mulai Rp")) {
    return clean;
  }

  // Pure digits without ambiguity (e.g. "15000", "50000", "100000", "5300000")
  if (/^\d{4,9}$/.test(clean)) {
    const val = parseInt(clean, 10);
    if (!isNaN(val)) {
      return rupiahFormatter.format(val);
    }
  }

  // Dotted thousands (e.g. "100.000" or "5.300.000")
  if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
    return `Rp${clean}`;
  }

  // Known legacy literal string cases
  if (lower.includes("5k-25k")) {
    return "Mulai Rp5.000 – Rp25.000";
  }

  return clean;
}

export type ExtractedStoreDetails = {
  cleanDescription: string;
  tagline?: string;
  ownerName?: string;
  whatsapp?: string;
  operatingHours?: string;
  orderNote?: string;
  tags: string[];
  highlights: string[];
  googleMapsLink: string;
};

/**
 * Extracts clean description, safe public text, and highlights from legacy or structured text.
 * Ensures internal intake prefixes are safely stripped.
 */
export function extractStoreDetails(
  rawDescription?: string | null,
  name?: string,
  _category?: string,
  cluster?: string,
  availabilityNote?: string | null
): ExtractedStoreDetails {
  const desc = cleanCorruptChars(rawDescription || "");

  // Extract owner name
  const ownerMatch = desc.match(/Pemilik:\s*([^\n\r]+)/i);
  const ownerName = ownerMatch ? ownerMatch[1].trim() : undefined;

  // Extract WhatsApp
  const waMatch = desc.match(/WhatsApp:\s*([^\n\r]+)/i);
  const whatsapp = waMatch ? waMatch[1].trim() : undefined;

  // Extract operating hours
  const hoursMatch = desc.match(/(?:Jam(?:\s+operasional)?|Buka)[:\s]+([^\n\r]+)/i);
  const operatingHours = hoursMatch ? hoursMatch[1].trim() : undefined;

  // Extract order note / availability
  const orderNote = availabilityNote || (desc.match(/Catatan(?:\s+pemesanan)?:\s*([^\n\r]+)/i)?.[1]?.trim());

  // Clean description removing intake headers & private notes
  let cleanDescription = desc
    .replace(/Pemilik:\s*[^\n\r]+/gi, "")
    .replace(/WhatsApp:\s*[^\n\r]+/gi, "")
    .replace(/Catatan foto:[\s\S]*$/gi, "")
    .replace(/Lampiran private:[\s\S]*$/gi, "")
    .replace(/Lampiran:[\s\S]*$/gi, "")
    .replace(/<!--PALUGADA_META_START[\s\S]*PALUGADA_META_END-->/gi, "")
    .trim();

  if (!cleanDescription) {
    cleanDescription = `Lapak usaha resmi warga lingkungan ${cluster || "Cipta Green Ville"}.`;
  }

  // Category & genuine highlights
  const cat = (_category || "").toLowerCase();
  const highlights: string[] = [];
  let tagline: string | undefined;

  if (cat === "kuliner" && (name?.toLowerCase().includes("ayu") || desc.toLowerCase().includes("nasi"))) {
    highlights.push("Makan di Tempat", "Free Wi-Fi & Charging", "Antar area CGV");
    tagline = "Makan, ngopi, dan santai dekat rumah.";
  } else if (cat === "jasa") {
    highlights.push("Layanan Panggilan", "Warga Terpercaya");
  } else if (cat === "barang") {
    highlights.push("Produk Terjamin", "Bisa COD / Ambil Sendiri");
  }

  const tags: string[] = [_category || "Usaha Warga", cluster || "CGV10"];

  return {
    cleanDescription,
    tagline,
    ownerName,
    whatsapp,
    operatingHours,
    orderNote,
    tags,
    highlights,
    googleMapsLink: buildGoogleMapsLink(name || "Lapak", cluster),
  };
}

/**
 * Checks current opening status in Asia/Jakarta (WIB) timezone.
 * Supports weekly schedule per-day, overnight hours (e.g. 17:00 - 01:00), legacy plain text, and appointment mode.
 */
export function getJakartaOperatingStatus(
  scheduleTypeOrScheduleOrText?: "schedule" | "appointment" | WeeklySchedule | string | null,
  weeklyScheduleOrSellerStatus?: WeeklySchedule | "online" | "offline" | string | null,
  maybeSellerStatus?: "online" | "offline" | string | null,
  legacyText?: string | null
): { isOpenNow: boolean | null; statusText: string; timeBadge: string } {
  // Normalize parameters for legacy / polymorphic calls
  let scheduleType: string | undefined;
  let weeklySchedule: WeeklySchedule | undefined;
  let sellerStatus: "online" | "offline" | undefined;
  let rawLegacyText: string | null = legacyText || null;

  if (typeof scheduleTypeOrScheduleOrText === "object" && scheduleTypeOrScheduleOrText !== null) {
    weeklySchedule = scheduleTypeOrScheduleOrText as WeeklySchedule;
    scheduleType = "schedule";
    if (typeof weeklyScheduleOrSellerStatus === "string") {
      sellerStatus = weeklyScheduleOrSellerStatus === "offline" ? "offline" : "online";
    }
  } else if (typeof scheduleTypeOrScheduleOrText === "string") {
    if (scheduleTypeOrScheduleOrText === "schedule" || scheduleTypeOrScheduleOrText === "appointment") {
      scheduleType = scheduleTypeOrScheduleOrText;
      if (typeof weeklyScheduleOrSellerStatus === "object" && weeklyScheduleOrSellerStatus !== null) {
        weeklySchedule = weeklyScheduleOrSellerStatus as WeeklySchedule;
      }
      if (typeof maybeSellerStatus === "string") {
        sellerStatus = maybeSellerStatus === "offline" ? "offline" : "online";
      }
    } else {
      // It's a legacy plain text string like "07.00 - 23.00 WIB"
      rawLegacyText = scheduleTypeOrScheduleOrText;
      if (typeof weeklyScheduleOrSellerStatus === "string") {
        sellerStatus = weeklyScheduleOrSellerStatus === "offline" ? "offline" : "online";
      }
    }
  }

  if (sellerStatus === "offline") {
    return {
      isOpenNow: false,
      statusText: "Tutup sementara",
      timeBadge: "Tutup Sementara",
    };
  }

  // Appointment mode
  if (scheduleType === "appointment") {
    return {
      isOpenNow: true,
      statusText: "Buka berdasarkan janji / pesanan",
      timeBadge: "Berdasarkan Pesanan",
    };
  }

  // Structured Weekly Schedule calculation
  if (weeklySchedule) {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jakartaDate = new Date(utc + 3600000 * 7);

    const dayIndex = jakartaDate.getDay();
    const dayKeys: Array<keyof WeeklySchedule> = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const currentDayKey = dayKeys[dayIndex];
    const todaySchedule = weeklySchedule[currentDayKey];

    if (!todaySchedule || !todaySchedule.open) {
      return {
        isOpenNow: false,
        statusText: `Tutup hari ini (${dayKeyLabels[currentDayKey]})`,
        timeBadge: "Tutup Hari Ini",
      };
    }

    const [startH, startM] = todaySchedule.start.split(":").map((v) => parseInt(v, 10) || 0);
    const [endH, endM] = todaySchedule.end.split(":").map((v) => parseInt(v, 10) || 0);

    const currentMinutes = jakartaDate.getHours() * 60 + jakartaDate.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let isOpen = false;
    if (startMinutes <= endMinutes) {
      isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      isOpen = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    const timeRangeStr = `${todaySchedule.start} – ${todaySchedule.end} WIB`;

    if (isOpen) {
      return {
        isOpenNow: true,
        statusText: `Buka sekarang (${timeRangeStr})`,
        timeBadge: `Buka · ${timeRangeStr}`,
      };
    } else {
      return {
        isOpenNow: false,
        statusText: `Tutup sekarang (Buka ${todaySchedule.start} WIB)`,
        timeBadge: `Tutup · Buka ${todaySchedule.start} WIB`,
      };
    }
  }

  // Fallback for legacy listings with plain text schedule
  if (rawLegacyText) {
    const clean = cleanCorruptChars(rawLegacyText);
    const timeMatch = clean.match(/(\d{1,2})[.:](\d{2})\s*[-–—to]\s*(\d{1,2})[.:](\d{2})/i);
    if (timeMatch) {
      const startHour = parseInt(timeMatch[1], 10);
      const startMin = parseInt(timeMatch[2], 10);
      const endHour = parseInt(timeMatch[3], 10);
      const endMin = parseInt(timeMatch[4], 10);

      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const jakartaDate = new Date(utc + 3600000 * 7);
      const currentMinutes = jakartaDate.getHours() * 60 + jakartaDate.getMinutes();
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      const isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      const formattedStart = `${String(startHour).padStart(2, "0")}.${String(startMin).padStart(2, "0")}`;
      const formattedEnd = `${String(endHour).padStart(2, "0")}.${String(endMin).padStart(2, "0")}`;
      const timeRangeStr = `${formattedStart} – ${formattedEnd} WIB`;

      return {
        isOpenNow: isOpen,
        statusText: isOpen ? `Buka sekarang (${timeRangeStr})` : `Tutup sekarang (Buka ${formattedStart} WIB)`,
        timeBadge: isOpen ? `Buka · ${timeRangeStr}` : `Tutup · Buka ${formattedStart} WIB`,
      };
    }
  }

  return {
    isOpenNow: true,
    statusText: "Buka · Menerima pesanan",
    timeBadge: "Buka",
  };
}


/**
 * Builds Google Maps search link.
 */
export function buildGoogleMapsLink(name: string, cluster?: string): string {
  const query = `${name} ${cluster || ""} Cipta Green Ville Batam`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

const METADATA_TAG_START = "<!--PALUGADA_META_START";
const METADATA_TAG_END = "PALUGADA_META_END-->";

/**
 * Serializes a StructuredPalugadaListing into database fields.
 * Keeps clean description for standard readers, and encodes structured metadata safely.
 */
export function serializeStructuredListing(data: StructuredPalugadaListing): {
  name: string;
  category: string;
  cluster: string;
  price_label: string;
  description: string;
  availability_note: string;
  contact_method: string;
  seller_status: "online" | "offline";
  seller_status_note: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
} {
  const formattedPrice = formatPriceFromConfig(data.priceConfig);

  let formattedScheduleNote = "Berdasarkan Pesanan";
  if (data.scheduleType === "schedule" && data.weeklySchedule) {
    const mon = data.weeklySchedule.mon;
    formattedScheduleNote = mon.open ? `${mon.start} - ${mon.end} WIB` : "Jadwal harian";
  }

  const metadataPayload = {
    tagline: data.tagline?.trim() || "",
    aboutStory: data.aboutStory?.trim() || "",
    ownerName: data.ownerName?.trim() || "",
    addressDetail: data.addressDetail?.trim() || "",
    mapsUrl: data.mapsUrl?.trim() || "",
    serviceTypes: data.serviceTypes || [],
    deliveryArea: data.deliveryArea?.trim() || "",
    orderNotes: data.orderNotes?.trim() || "",
    priceConfig: data.priceConfig,
    scheduleType: data.scheduleType,
    weeklySchedule: data.weeklySchedule,
    highlights: data.highlights || [],
    structuredProducts: data.structuredProducts || [],
    adminNotes: data.adminNotes?.trim() || "",
    logoUrl: data.logoUrl || "",
    coverUrl: data.coverUrl || "",
    menuPhotoUrl: data.menuPhotoUrl || "",
    galleryUrls: data.galleryUrls || [],
  };

  const jsonString = JSON.stringify(metadataPayload);
  const cleanPublicDesc = data.description.trim();
  const serializedDescription = `${cleanPublicDesc}\n\n${METADATA_TAG_START}${jsonString}${METADATA_TAG_END}`;

  return {
    name: data.name.trim(),
    category: data.category,
    cluster: data.cluster.trim(),
    price_label: formattedPrice,
    description: serializedDescription,
    availability_note: data.deliveryArea?.trim() || data.orderNotes?.trim() || data.serviceNotes?.trim() || "",
    contact_method: data.whatsapp.trim(),
    seller_status: data.sellerStatus,
    seller_status_note: formattedScheduleNote,
    cover_image_url: data.coverUrl || null,
    cover_image_alt: `Cover ${data.name.trim()}`,
  };
}

/**
 * Parses raw database row + attachments into a complete StructuredPalugadaListing.
 * Handles both new structured listings and legacy unmigrated rows cleanly.
 */
export function parseStructuredListing(
  row: {
    id?: string;
    name: string;
    category: string;
    cluster: string;
    price_label?: string | null;
    description?: string | null;
    availability_note?: string | null;
    contact_method?: string | null;
    seller_status?: "online" | "offline" | string | null;
    seller_status_note?: string | null;
    cover_image_url?: string | null;
    cover_image_alt?: string | null;
  },
  attachments: Array<{
    id?: string;
    file_name: string;
    storage_path: string;
    publicUrl: string;
  }> = []
): StructuredPalugadaListing {
  const rawDesc = row.description || "";
  let cleanDesc = rawDesc;
  let parsedMeta: Partial<StructuredPalugadaListing> = {};

  // Check for embedded structured metadata
  if (rawDesc.includes(METADATA_TAG_START) && rawDesc.includes(METADATA_TAG_END)) {
    const startIndex = rawDesc.indexOf(METADATA_TAG_START);
    const endIndex = rawDesc.indexOf(METADATA_TAG_END);
    cleanDesc = rawDesc.slice(0, startIndex).trim();
    const jsonStr = rawDesc.slice(startIndex + METADATA_TAG_START.length, endIndex);
    try {
      parsedMeta = JSON.parse(jsonStr) as Partial<StructuredPalugadaListing>;
    } catch {
      /* fallback */
    }
  } else {
    // Legacy row: clean intake prefixes safely
    cleanDesc = cleanDesc
      .replace(/Pemilik:\s*[^\n\r]+/gi, "")
      .replace(/WhatsApp:\s*[^\n\r]+/gi, "")
      .replace(/Catatan foto:[\s\S]*$/gi, "")
      .replace(/Lampiran private:[\s\S]*$/gi, "")
      .replace(/Lampiran:[\s\S]*$/gi, "")
      .trim();
  }

  // Derive explicit photo roles
  let logoUrl = parsedMeta.logoUrl || "";
  let coverUrl = parsedMeta.coverUrl || row.cover_image_url || "";
  let menuPhotoUrl = parsedMeta.menuPhotoUrl || "";
  const galleryUrls: string[] = parsedMeta.galleryUrls?.length
    ? [...parsedMeta.galleryUrls]
    : [];

  // Categorize attachments if not explicitly set
  for (const att of attachments) {
    const pathLower = att.storage_path.toLowerCase();
    const nameLower = att.file_name.toLowerCase();

    if (!logoUrl && (pathLower.includes("/logo/") || nameLower.includes("logo"))) {
      logoUrl = att.publicUrl;
    } else if (!menuPhotoUrl && (pathLower.includes("/menu/") || nameLower.includes("menu") || nameLower.includes("142"))) {
      menuPhotoUrl = att.publicUrl;
    } else if (!coverUrl && pathLower.includes("/cover/")) {
      coverUrl = att.publicUrl;
    } else if (!galleryUrls.includes(att.publicUrl)) {
      galleryUrls.push(att.publicUrl);
    }
  }

  if (!coverUrl && attachments[0]) {
    coverUrl = attachments[0].publicUrl;
  }

  // Legacy price parsing
  const defaultPriceConfig: PriceConfig = parsedMeta.priceConfig || {
    type: "contact",
    amount: null,
    min: null,
    max: null,
    unit: "",
  };

  const validCat = (["kuliner", "jasa", "barang", "properti", "lainnya"].includes(
    row.category?.toLowerCase()
  )
    ? row.category.toLowerCase()
    : "lainnya") as StructuredPalugadaListing["category"];

  return {
    id: row.id,
    name: row.name || "",
    category: validCat,
    ownerName: parsedMeta.ownerName || "",
    whatsapp: row.contact_method || "",
    tagline: parsedMeta.tagline || (validCat === "kuliner" && row.name.toLowerCase().includes("ayu") ? "Makan, ngopi, dan santai dekat rumah." : ""),
    description: cleanDesc || "Lapak usaha resmi warga lingkungan Cipta Green Ville.",
    aboutStory: parsedMeta.aboutStory || "",
    cluster: row.cluster || "",
    addressDetail: parsedMeta.addressDetail || "",
    mapsUrl: parsedMeta.mapsUrl || "",
    serviceTypes: parsedMeta.serviceTypes || [],
    deliveryArea: parsedMeta.deliveryArea || row.availability_note || "",
    orderNotes: parsedMeta.orderNotes || "",
    priceConfig: defaultPriceConfig,
    scheduleType: parsedMeta.scheduleType || (row.seller_status_note?.includes("07") ? "schedule" : "appointment"),
    weeklySchedule: parsedMeta.weeklySchedule || defaultWeeklySchedule,
    sellerStatus: (row.seller_status === "offline" ? "offline" : "online"),
    serviceNotes: parsedMeta.serviceNotes || row.availability_note || "",
    highlights: parsedMeta.highlights || (validCat === "kuliner" && row.name.toLowerCase().includes("ayu") ? ["Makan di tempat", "Free Wi-Fi & Charging", "Antar area CGV"] : []),
    structuredProducts: parsedMeta.structuredProducts || [],
    adminNotes: parsedMeta.adminNotes || "",
    logoUrl,
    coverUrl,
    menuPhotoUrl,
    galleryUrls,
  };
}
