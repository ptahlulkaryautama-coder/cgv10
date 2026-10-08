export type DestinationType = "house" | "facility" | "other";
export type VisitType = "kurir" | "tamu" | "teknisi" | "lainnya";
export type VisitorStatus = "active" | "checked_out";

export type VisitorLog = {
  id: string;
  idempotency_key?: string | null;
  visitor_name: string;
  destination_type: DestinationType;
  cluster: string;
  unit_number: string;
  facility_name: string;
  visit_type: VisitType;
  purpose: string;
  institution: string;
  vehicle_plate: string;
  visitor_photo_path: string;
  visitor_photo_url?: string | null;
  id_card_photo_path: string;
  id_card_photo_url?: string | null;
  id_card_required: boolean;
  notes: string;
  status: VisitorStatus;
  checked_in_at: string;
  checked_in_by?: string | null;
  checked_in_by_name: string;
  checked_out_at?: string | null;
  checked_out_by?: string | null;
  checked_out_by_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitorLogFormInput = {
  visitor_name: string;
  destination_type: DestinationType;
  cluster: string;
  unit_number: string;
  facility_name: string;
  visit_type: VisitType;
  purpose: string;
  institution: string;
  vehicle_plate: string;
  visitor_photo_file: File | null;
  visitor_photo_preview: string | null;
  visitor_photo_path?: string;
  id_card_photo_file: File | null;
  id_card_photo_preview: string | null;
  id_card_photo_path?: string;
  id_card_required: boolean;
  notes: string;
  idempotency_key?: string;
};

export const VISIT_TYPE_LABELS: Record<VisitType, { label: string; iconKey: "package" | "users" | "wrench" | "file-text"; tone: string }> = {
  kurir: { label: "Logistik / Kurir", iconKey: "package", tone: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  tamu: { label: "Tamu Warga", iconKey: "users", tone: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  teknisi: { label: "Teknisi / Perbaikan", iconKey: "wrench", tone: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  lainnya: { label: "Lainnya / Umum", iconKey: "file-text", tone: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
};

export const DESTINATION_TYPE_LABELS: Record<DestinationType, string> = {
  house: "Rumah Warga",
  facility: "Fasilitas Umum",
  other: "Lainnya / Lingkungan",
};

/**
 * Format timestamp in Asia/Jakarta (WIB) timezone
 */
export function formatWibDateTime(isoDateString: string | null | undefined): string {
  if (!isoDateString) return "-";
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB";
  } catch {
    return isoDateString;
  }
}

export function formatWibTime(isoDateString: string | null | undefined): string {
  if (!isoDateString) return "-";
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date) + " WIB";
  } catch {
    return isoDateString;
  }
}

export function formatWibDateOnly(isoDateString: string | null | undefined): string {
  if (!isoDateString) return "-";
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDateString;
  }
}

export function getTodayWibString(): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

/**
 * Calculate human duration between check-in and check-out or current time
 */
export function calculateVisitDuration(checkInIso: string, checkOutIso?: string | null): string {
  try {
    const start = new Date(checkInIso).getTime();
    const end = checkOutIso ? new Date(checkOutIso).getTime() : Date.now();
    const diffMs = Math.max(0, end - start);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    if (totalMinutes < 1) return "< 1 mnt";
    if (totalMinutes < 60) return `${totalMinutes} mnt`;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) return `${hours} jam`;
    return `${hours} jam ${mins} mnt`;
  } catch {
    return "-";
  }
}

/**
 * Check if a date falls on "today" in Asia/Jakarta timezone
 */
export function isTodayWib(isoDateString: string): boolean {
  try {
    const itemDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(isoDateString));

    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    return itemDate === todayDate;
  } catch {
    return false;
  }
}

/**
 * Compress an image file via Canvas to minimize upload size while preserving legible identity text.
 */
export async function compressImageFile(file: File, maxDimension = 1280, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Gagal menginisialisasi canvas untuk kompresi"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Gagal mengompresi gambar"));
          }
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gagal membaca file gambar"));
    };

    img.src = objectUrl;
  });
}

/**
 * Mock data for local standalone testing and initial fallback state
 */
export const initialMockVisitorLogs: VisitorLog[] = [
  {
    id: "visit-demo-001",
    idempotency_key: "idem-demo-001",
    visitor_name: "Budi Santoso",
    destination_type: "house",
    cluster: "Aurora",
    unit_number: "12",
    facility_name: "",
    visit_type: "kurir",
    purpose: "Mengantar paket Shopee",
    institution: "Shopee Xpress",
    vehicle_plate: "BP 4821 QW",
    visitor_photo_path: "visitor-photos/demo-budi.jpg",
    visitor_photo_url: null,
    id_card_photo_path: "",
    id_card_photo_url: null,
    id_card_required: false,
    notes: "Paket berukuran sedang, dititip di teras rumah sesuai izin warga.",
    status: "active",
    checked_in_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    checked_in_by: "sec-user-1",
    checked_in_by_name: "Slamet (Pos Utama)",
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "visit-demo-002",
    idempotency_key: "idem-demo-002",
    visitor_name: "Rahmat Hidayat",
    destination_type: "house",
    cluster: "Plumeria",
    unit_number: "5",
    facility_name: "",
    visit_type: "tamu",
    purpose: "Kunjungan silaturahmi keluarga",
    institution: "",
    vehicle_plate: "BP 1290 XY",
    visitor_photo_path: "visitor-photos/demo-rahmat.jpg",
    visitor_photo_url: null,
    id_card_photo_path: "id-cards/demo-rahmat-ktp.jpg",
    id_card_photo_url: null,
    id_card_required: true,
    notes: "Mobil parkir di dalam carport rumah No. 5.",
    status: "active",
    checked_in_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    checked_in_by: "sec-user-1",
    checked_in_by_name: "Slamet (Pos Utama)",
    created_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
  },
  {
    id: "visit-demo-003",
    idempotency_key: "idem-demo-003",
    visitor_name: "Andi Saputra",
    destination_type: "facility",
    cluster: "Umum",
    unit_number: "",
    facility_name: "Balai Warga / Lapangan",
    visit_type: "teknisi",
    purpose: "Pengecekan instalasi kabel fiber",
    institution: "IndiHome / Telkom",
    vehicle_plate: "BP 7712 AA",
    visitor_photo_path: "visitor-photos/demo-andi.jpg",
    visitor_photo_url: null,
    id_card_photo_path: "",
    id_card_required: false,
    notes: "Didampingi bidang keamanan selama perbaikan tiang.",
    status: "checked_out",
    checked_in_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    checked_in_by: "sec-user-1",
    checked_in_by_name: "Slamet (Pos Utama)",
    checked_out_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    checked_out_by: "sec-user-1",
    checked_out_by_name: "Slamet (Pos Utama)",
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "visit-demo-004",
    idempotency_key: "idem-demo-004",
    visitor_name: "Doni Kurniawan",
    destination_type: "house",
    cluster: "Aurora",
    unit_number: "33A",
    facility_name: "",
    visit_type: "kurir",
    purpose: "Pengiriman barang elektronik",
    institution: "J&T Cargo",
    vehicle_plate: "BP 8820 KD",
    visitor_photo_path: "visitor-photos/demo-doni.jpg",
    visitor_photo_url: null,
    id_card_photo_path: "",
    id_card_required: false,
    notes: "Barang sudah diterima langsung oleh penghuni rumah.",
    status: "checked_out",
    checked_in_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    checked_in_by: "sec-user-2",
    checked_in_by_name: "Heri P (Pos Gerbang)",
    checked_out_at: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    checked_out_by: "sec-user-2",
    checked_out_by_name: "Heri P (Pos Gerbang)",
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
  },
  {
    id: "visit-demo-005-yesterday",
    idempotency_key: "idem-demo-005",
    visitor_name: "Yogi Pratama",
    destination_type: "house",
    cluster: "Meteora",
    unit_number: "8",
    facility_name: "",
    visit_type: "teknisi",
    purpose: "Pengerjaan renovasi plafon rumah (menginap)",
    institution: "CV Mandiri Konstruksi",
    vehicle_plate: "BP 3341 TY",
    visitor_photo_path: "visitor-photos/demo-yogi.jpg",
    visitor_photo_url: null,
    id_card_photo_path: "id-cards/demo-yogi-ktp.jpg",
    id_card_required: true,
    notes: "Izin kerja lintas hari sudah dikonfirmasi ke Ketua RT.",
    status: "active",
    // Checked in yesterday to verify multi-day active visits remain visible
    checked_in_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    checked_in_by: "sec-user-2",
    checked_in_by_name: "Heri P (Pos Gerbang)",
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
];
