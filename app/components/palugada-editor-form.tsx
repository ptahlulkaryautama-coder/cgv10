"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type DaySchedule,
  type PriceConfig,
  type PriceType,
  type StoreProductItem,
  type StructuredPalugadaListing,
  type WeeklySchedule,
  dayKeyLabels,
  defaultWeeklySchedule,
  formatPriceFromConfig,
} from "@/lib/palugada-storefront-utils";

export type PalugadaEditorFiles = {
  logoFile?: File | null;
  coverFile?: File | null;
  menuFile?: File | null;
  galleryFiles: Array<{ id: string; file?: File; existingUrl?: string }>;
};

type PalugadaEditorFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<StructuredPalugadaListing>;
  existingPhotos?: {
    logoUrl?: string;
    coverUrl?: string;
    menuPhotoUrl?: string;
    galleryUrls?: string[];
  };
  onSave: (
    data: StructuredPalugadaListing,
    files: PalugadaEditorFiles
  ) => Promise<{ success: boolean; listingId?: string; error?: string }>;
  isSaving: boolean;
  saveMessage?: string;
  cancelHref?: string;
};

const categoryOptions = [
  { value: "kuliner", label: "Kuliner (Makanan / Minuman / Camilan)", icon: "🍽️" },
  { value: "jasa", label: "Jasa (Laundry / Servis / Teknisi / Jahit)", icon: "🛠️" },
  { value: "barang", label: "Barang & Retail (Toko / Sayur / Sepeda)", icon: "📦" },
  { value: "properti", label: "Properti (Sewa Rumah / Kos / Titip Jual)", icon: "🏠" },
  { value: "lainnya", label: "Lainnya (Usaha / Layanan Warga)", icon: "🏪" },
];

const unitSuggestions = ["porsi", "kg", "item", "kunjungan", "box", "paket", "hari", "bulan", "orang"];

const highlightSuggestions: Record<string, string[]> = {
  kuliner: ["Makan di tempat", "Free Wi-Fi & Charging", "Antar area CGV", "Pesan via WA", "Halal & Higienis"],
  jasa: ["Layanan panggilan ke rumah", "Pengerjaan rapi & bergaransi", "Antar-jemput cucian", "Teknisi warga terpercaya"],
  barang: ["Produk original / terjamin", "Siap antar ke rumah", "Bisa COD / ambil di cluster", "Stok siap kirim"],
  properti: ["Lokasi strategis di CGV", "Lingkungan aman 24 jam", "Bisa survei langsung", "Fasilitas lengkap"],
  lainnya: ["Pelayanan ramah", "Harga warga bersahabat", "Respons cepat via WA"],
};

export function PalugadaEditorForm({
  mode,
  initialData,
  existingPhotos,
  onSave,
  isSaving,
  saveMessage,
  cancelHref = "/palugada/",
}: PalugadaEditorFormProps) {
  // ── Form State ──
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState<StructuredPalugadaListing["category"] | "">(
    initialData?.category || ""
  );
  const [ownerName, setOwnerName] = useState(initialData?.ownerName || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [tagline, setTagline] = useState(initialData?.tagline || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [aboutStory, setAboutStory] = useState(initialData?.aboutStory || "");

  // Location & Service
  const [cluster, setCluster] = useState(initialData?.cluster || "");
  const [addressDetail, setAddressDetail] = useState(initialData?.addressDetail || "");
  const [mapsUrl, setMapsUrl] = useState(initialData?.mapsUrl || "");
  const [serviceTypes, setServiceTypes] = useState<string[]>(initialData?.serviceTypes || []);
  const [deliveryArea, setDeliveryArea] = useState(initialData?.deliveryArea || "");
  const [orderNotes, setOrderNotes] = useState(initialData?.orderNotes || "");

  // Price Configuration
  const [priceType, setPriceType] = useState<PriceType>(initialData?.priceConfig?.type || "starting_at");
  const [priceAmount, setPriceAmount] = useState<string>(
    initialData?.priceConfig?.amount != null ? String(initialData.priceConfig.amount) : ""
  );
  const [priceMin, setPriceMin] = useState<string>(
    initialData?.priceConfig?.min != null ? String(initialData.priceConfig.min) : ""
  );
  const [priceMax, setPriceMax] = useState<string>(
    initialData?.priceConfig?.max != null ? String(initialData.priceConfig.max) : ""
  );
  const [priceUnit, setPriceUnit] = useState<string>(initialData?.priceConfig?.unit || "");

  // Schedule Configuration
  const [scheduleType, setScheduleType] = useState<"schedule" | "appointment">(
    initialData?.scheduleType || "schedule"
  );
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(
    initialData?.weeklySchedule || defaultWeeklySchedule
  );
  const [sellerStatus, setSellerStatus] = useState<"online" | "offline">(
    initialData?.sellerStatus || "online"
  );
  const [serviceNotes, setServiceNotes] = useState(initialData?.serviceNotes || "");

  // Highlights & Products
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
  const [customHighlight, setCustomHighlight] = useState("");
  const [structuredProducts, setStructuredProducts] = useState<StoreProductItem[]>(
    initialData?.structuredProducts || []
  );
  const [adminNotes, setAdminNotes] = useState(initialData?.adminNotes || "");

  // Visual Files & Preview State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(existingPhotos?.logoUrl || initialData?.logoUrl || "");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(existingPhotos?.coverUrl || initialData?.coverUrl || "");

  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [menuPreview, setMenuPreview] = useState<string>(existingPhotos?.menuPhotoUrl || initialData?.menuPhotoUrl || "");

  const [galleryItems, setGalleryItems] = useState<Array<{ id: string; file?: File; previewUrl: string; existingUrl?: string }>>(() => {
    const urls = existingPhotos?.galleryUrls || initialData?.galleryUrls || [];
    return urls.map((url, i) => ({
      id: `existing-${i}-${Date.now()}`,
      previewUrl: url,
      existingUrl: url,
    }));
  });

  // UI helpers
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ listingId: string } | null>(null);

  // Handle local image file previews with memory cleanup
  function handleImageFile(file: File, type: "logo" | "cover" | "menu") {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 10 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Format berkas harus berupa gambar (JPG, PNG, WebP).");
      return;
    }
    setErrorMessage("");
    const url = URL.createObjectURL(file);
    if (type === "logo") {
      setLogoFile(file);
      setLogoPreview(url);
    } else if (type === "cover") {
      setCoverFile(file);
      setCoverPreview(url);
    } else if (type === "menu") {
      setMenuFile(file);
      setMenuPreview(url);
    }
  }

  function handleAddGalleryFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    const currentCount = galleryItems.length;
    const remainingSlots = 4 - currentCount;
    if (remainingSlots <= 0) {
      setErrorMessage("Maksimal 4 foto galeri tambahan.");
      return;
    }

    const newItems: typeof galleryItems = [];
    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.size > 10 * 1024 * 1024 || !file.type.startsWith("image/")) return;
      newItems.push({
        id: `new-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    setGalleryItems((prev) => [...prev, ...newItems]);
  }

  function removeGalleryItem(id: string) {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  }

  // ── Validation ──
  const requiredValidation = useMemo(() => {
    const isNameValid = name.trim().length >= 2;
    const isCatValid = Boolean(category);
    const isClusterValid = cluster.trim().length >= 2;
    const isWhatsappValid = whatsapp.replace(/\D/g, "").length >= 7;
    const isDescValid = description.trim().length >= 10;

    const completed = [isNameValid, isCatValid, isClusterValid, isWhatsappValid, isDescValid].filter(Boolean).length;
    const isAllValid = completed === 5;

    return { isNameValid, isCatValid, isClusterValid, isWhatsappValid, isDescValid, completed, isAllValid };
  }, [name, category, cluster, whatsapp, description]);

  // Formatted price preview
  const currentPriceConfig: PriceConfig = useMemo(() => {
    return {
      type: priceType,
      amount: priceAmount ? parseInt(priceAmount.replace(/\D/g, ""), 10) || null : null,
      min: priceMin ? parseInt(priceMin.replace(/\D/g, ""), 10) || null : null,
      max: priceMax ? parseInt(priceMax.replace(/\D/g, ""), 10) || null : null,
      unit: priceUnit.trim() || null,
    };
  }, [priceType, priceAmount, priceMin, priceMax, priceUnit]);

  const formattedPricePreview = useMemo(() => {
    return formatPriceFromConfig(currentPriceConfig);
  }, [currentPriceConfig]);

  // Apply monday schedule to all days
  function copyMonToAllDays() {
    const mon = weeklySchedule.mon;
    setWeeklySchedule({
      mon: { ...mon },
      tue: { ...mon },
      wed: { ...mon },
      thu: { ...mon },
      fri: { ...mon },
      sat: { ...mon },
      sun: { ...mon },
    });
  }

  function updateDaySchedule(day: keyof WeeklySchedule, updates: Partial<DaySchedule>) {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
  }

  // Toggle highlight
  function toggleHighlight(text: string) {
    setHighlights((prev) => {
      if (prev.includes(text)) return prev.filter((t) => t !== text);
      if (prev.length >= 4) {
        setErrorMessage("Maksimal 4 keunggulan usaha.");
        return prev;
      }
      return [...prev, text];
    });
  }

  // Structured products repeater handlers
  function addProduct() {
    const newProduct: StoreProductItem = {
      id: `prod-${Date.now()}`,
      name: "",
      description: "",
      price: null,
      availability: "available",
      sortOrder: structuredProducts.length + 1,
    };
    setStructuredProducts((prev) => [...prev, newProduct]);
  }

  function updateProduct(id: string, updates: Partial<StoreProductItem>) {
    setStructuredProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }

  function removeProduct(id: string) {
    setStructuredProducts((prev) => prev.filter((p) => p.id !== id));
  }

  // Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!requiredValidation.isAllValid) {
      setErrorMessage("Mohon lengkapi 5 bagian wajib sebelum menyimpan.");
      return;
    }

    if (category === "") {
      setErrorMessage("Silakan pilih kategori usaha.");
      return;
    }

    const listingData: StructuredPalugadaListing = {
      id: initialData?.id,
      name: name.trim(),
      category: category as StructuredPalugadaListing["category"],
      ownerName: ownerName.trim() || undefined,
      whatsapp: whatsapp.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      aboutStory: aboutStory.trim() || undefined,
      cluster: cluster.trim(),
      addressDetail: addressDetail.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      serviceTypes,
      deliveryArea: deliveryArea.trim() || undefined,
      orderNotes: orderNotes.trim() || undefined,
      priceConfig: currentPriceConfig,
      scheduleType,
      weeklySchedule,
      sellerStatus,
      serviceNotes: serviceNotes.trim() || undefined,
      highlights,
      structuredProducts,
      adminNotes: adminNotes.trim() || undefined,
      logoUrl: logoPreview || undefined,
      coverUrl: coverPreview || undefined,
      menuPhotoUrl: menuPreview || undefined,
      galleryUrls: galleryItems.map((item) => item.existingUrl || item.previewUrl),
    };

    const filesPayload: PalugadaEditorFiles = {
      logoFile,
      coverFile,
      menuFile,
      galleryFiles: galleryItems.map((item) => ({
        id: item.id,
        file: item.file,
        existingUrl: item.existingUrl,
      })),
    };

    const result = await onSave(listingData, filesPayload);
    if (!result.success) {
      setErrorMessage(result.error || "Gagal menyimpan lapak. Coba periksa kembali.");
    } else if (result.listingId) {
      setSuccessInfo({ listingId: result.listingId });
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">
      {/* ── Top Tabs (Form & Live Preview) on Mobile/Tablet ── */}
      <div className="flex items-center justify-between border-b border-[#DED4C4] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "form"
                ? "bg-[#003D34] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            📝 Formulir Lapak
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "preview"
                ? "bg-[#003D34] text-white shadow-sm"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            👁️ Preview Hasil Publik
          </button>
        </div>

        {/* Completeness Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              requiredValidation.isAllValid
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {requiredValidation.completed}/5 Wajib Terisi
          </span>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {successInfo && (
        <div
          role="status"
          className="rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-6 shadow-lg space-y-3 animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="text-lg font-black text-emerald-900">
                {mode === "create" ? "Lapak Berhasil Didaftarkan!" : "Lapak Berhasil Diperbarui!"}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Lapak Anda siap tampil di katalog PALUGADA CGV dengan tampilan mini landing page baru yang rapi.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/palugada/detail/?id=${encodeURIComponent(successInfo.listingId)}`}
              target="_blank"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow hover:bg-emerald-800"
            >
              <span>🌐 Lihat Halaman Publik ↗</span>
            </Link>
            <Link
              href="/palugada/"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              Kembali ke Katalog PALUGADA
            </Link>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 p-4 text-xs sm:text-sm font-semibold text-red-800 shadow-sm flex items-center justify-between"
        >
          <span>⚠️ {errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-xs text-red-600 hover:underline ml-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Form View ── */}
      <div className={`grid gap-8 lg:grid-cols-12 ${activeTab === "form" ? "block" : "hidden lg:grid"}`}>
        {/* Form Main Column (7 cols on desktop) */}
        <form onSubmit={handleSubmit} className="space-y-8 lg:col-span-8">

          {/* ── 1. IDENTITAS USAHA ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-[#003D34]">
              1. Identitas Usaha
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-stone-800 sm:col-span-2">
                Nama Lapak / Usaha <span className="text-red-600">*</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kafe Kak Ayu"
                  maxLength={120}
                  required
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800">
                Kategori Usaha <span className="text-red-600">*</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StructuredPalugadaListing["category"])}
                  required
                  className="mt-1.5 min-h-11 w-full cursor-pointer rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                >
                  <option value="" disabled>-- Pilih Kategori --</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-bold text-stone-800">
                Nama Penanggung Jawab / Pemilik
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Contoh: Ayu Setyorini"
                  maxLength={100}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800 sm:col-span-2">
                Nomor WhatsApp Usaha <span className="text-red-600">*</span>
                <span className="block text-[11px] font-normal text-stone-500 mt-0.5">
                  Nomor ini akan langsung terhubung ke tombol chat pelanggan di portal.
                </span>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 087894101707 atau +62812..."
                  maxLength={20}
                  required
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800 sm:col-span-2">
                Tagline Singkat (Opsional)
                <span className="block text-[11px] font-normal text-stone-500 mt-0.5">
                  Tampil sebagai slogan pemikat di bagian atas halaman (hero).
                </span>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Contoh: Makan, ngopi, dan santai dekat rumah."
                  maxLength={160}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800 sm:col-span-2">
                Deskripsi Singkat <span className="text-red-600">*</span>
                <span className="block text-[11px] font-normal text-stone-500 mt-0.5">
                  Tampil di kartu katalog dan ringkasan lapak. Jangan masukkan nama pemilik/nomor kontak di sini.
                </span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan menu, produk, atau jasa yang Anda sediakan untuk warga..."
                  maxLength={1000}
                  required
                  className="mt-1.5 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] p-3.5 text-xs sm:text-sm font-medium leading-relaxed text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800 sm:col-span-2">
                Cerita / Profil Lengkap Usaha (Opsional)
                <textarea
                  rows={3}
                  value={aboutStory}
                  onChange={(e) => setAboutStory(e.target.value)}
                  placeholder="Cerita asal mula usaha, kebersihan, bahan yang digunakan, atau hal spesial lainnya..."
                  maxLength={2000}
                  className="mt-1.5 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] p-3.5 text-xs sm:text-sm font-medium leading-relaxed text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>
            </div>
          </fieldset>

          {/* ── 2. LOKASI & LAYANAN ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-[#003D34]">
              2. Lokasi & Layanan
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-stone-800">
                Cluster / Blok / Area Layanan <span className="text-red-600">*</span>
                <input
                  type="text"
                  value={cluster}
                  onChange={(e) => setCluster(e.target.value)}
                  placeholder="Contoh: Ruko Acacia F3A atau Cluster Colloseum"
                  maxLength={120}
                  required
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800">
                Tautan Google Maps (Opsional)
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="block text-xs font-bold text-stone-800 mb-2">
                  Pilihan Tipe Layanan
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Makan di Tempat (Dine-in)",
                    "Ambil Sendiri (Takeaway)",
                    "Antar ke Rumah (Delivery CGV)",
                    "Layanan Panggilan / Kunjungan",
                    "Survei Lokasi",
                  ].map((service) => {
                    const checked = serviceTypes.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          setServiceTypes((prev) =>
                            checked ? prev.filter((s) => s !== service) : [...prev, service]
                          );
                        }}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                          checked
                            ? "border-[#003D34] bg-[#003D34] text-white shadow-sm"
                            : "border-[#DED4C4] bg-[#FBF9F5] text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        {checked ? "✓ " : "+ "}
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block text-xs font-bold text-stone-800">
                Alamat Detail / Lokasi Fisik (Opsional)
                <input
                  type="text"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Contoh: Ruko Blok F3A Lt. 1"
                  maxLength={160}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800">
                Area Pengantaran / Cakupan Jasa
                <input
                  type="text"
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  placeholder="Contoh: Seluruh Cluster Cipta Green Ville"
                  maxLength={160}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800">
                Catatan Pemesanan
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Contoh: PO H-1 / Pemesanan via WA"
                  maxLength={160}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>

              <label className="block text-xs font-bold text-stone-800">
                Catatan Layanan Tambahan
                <input
                  type="text"
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Contoh: Istirahat sholat Jumat 11.30-13.00"
                  maxLength={160}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34] focus:ring-2 focus:ring-[#003D34]/15"
                />
              </label>
            </div>
          </fieldset>

          {/* ── 3. STRUKTUR HARGA ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-[#003D34]">
              3. Penataan Harga
            </legend>

            <div className="space-y-4">
              <div>
                <span className="block text-xs font-bold text-stone-800 mb-2">Tipe Harga</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { type: "starting_at" as PriceType, label: "Mulai Dari" },
                    { type: "fixed" as PriceType, label: "Harga Tetap" },
                    { type: "range" as PriceType, label: "Rentang Harga" },
                    { type: "contact" as PriceType, label: "Hubungi Penjual" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setPriceType(item.type)}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        priceType === item.type
                          ? "border-[#003D34] bg-[#003D34] text-white shadow-sm"
                          : "border-[#DED4C4] bg-[#FBF9F5] text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Inputs depending on priceType */}
              {priceType === "range" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Harga Minimum (Rp)
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="180000"
                      min={0}
                      className="mt-1 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
                    />
                  </label>
                  <label className="block text-xs font-bold text-stone-800">
                    Harga Maksimum (Rp)
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="2400000"
                      min={0}
                      className="mt-1 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
                    />
                  </label>
                </div>
              ) : priceType !== "contact" ? (
                <label className="block text-xs font-bold text-stone-800">
                  Nominal Harga (Rp)
                  <input
                    type="number"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    placeholder="Contoh: 15000"
                    min={0}
                    className="mt-1 min-h-11 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
                  />
                </label>
              ) : null}

              {/* Unit Selector */}
              {priceType !== "contact" && (
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Satuan Harga (Opsional)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {unitSuggestions.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setPriceUnit(u)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          priceUnit === u
                            ? "border-[#003D34] bg-[#003D34] text-white"
                            : "border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        /{u}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    placeholder="Atau ketik satuan custom: box / porsi / jam..."
                    maxLength={30}
                    className="min-h-10 w-full rounded-xl border border-[#DED4C4] bg-[#FBF9F5] px-3.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
                  />
                </div>
              )}

              {/* Price Preview Tag */}
              <div className="rounded-2xl bg-[#E4F0ED] p-3.5 text-xs text-[#003D34] flex items-center justify-between">
                <span>Tampilan Harga di Katalog & Halaman:</span>
                <span className="font-extrabold text-sm text-[#003D34]">{formattedPricePreview}</span>
              </div>
            </div>
          </fieldset>

          {/* ── 4. JADWAL & KETERSEDIAAN ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-[#003D34]">
              4. Jadwal & Jam Operasional (WIB)
            </legend>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType("schedule")}
                  className={`flex-1 rounded-xl border p-3 text-xs font-bold transition-all ${
                    scheduleType === "schedule"
                      ? "border-[#003D34] bg-[#003D34] text-white shadow"
                      : "border-[#DED4C4] bg-[#FBF9F5] text-stone-700"
                  }`}
                >
                  ⏰ Jam Operasional Harian
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType("appointment")}
                  className={`flex-1 rounded-xl border p-3 text-xs font-bold transition-all ${
                    scheduleType === "appointment"
                      ? "border-[#003D34] bg-[#003D34] text-white shadow"
                      : "border-[#DED4C4] bg-[#FBF9F5] text-stone-700"
                  }`}
                >
                  📅 Berdasarkan Janji / Pesanan
                </button>
              </div>

              {scheduleType === "schedule" && (
                <div className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-stone-700">Jadwal Per Hari (WIB)</span>
                    <button
                      type="button"
                      onClick={copyMonToAllDays}
                      className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-bold text-[#003D34] hover:bg-stone-100"
                    >
                      ⚡ Samakan Jam Senin ke Semua Hari
                    </button>
                  </div>

                  {(Object.keys(weeklySchedule) as Array<keyof WeeklySchedule>).map((dayKey) => {
                    const day = weeklySchedule[dayKey];
                    return (
                      <div key={dayKey} className="flex items-center justify-between gap-3 text-xs py-1">
                        <label className="flex items-center gap-2 font-bold text-stone-800 w-24">
                          <input
                            type="checkbox"
                            checked={day.open}
                            onChange={(e) => updateDaySchedule(dayKey, { open: e.target.checked })}
                            className="h-4 w-4 rounded accent-[#003D34]"
                          />
                          <span>{dayKeyLabels[dayKey]}</span>
                        </label>

                        {day.open ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={day.start}
                              onChange={(e) => updateDaySchedule(dayKey, { start: e.target.value })}
                              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold"
                            />
                            <span className="text-stone-400">-</span>
                            <input
                              type="time"
                              value={day.end}
                              onChange={(e) => updateDaySchedule(dayKey, { end: e.target.value })}
                              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold"
                            />
                            <span className="text-stone-500 text-[11px]">WIB</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 font-semibold italic">Tutup</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Status Terima Pesanan */}
              <div className="rounded-2xl border border-[#DED4C4] bg-white p-4 space-y-2">
                <span className="block text-xs font-bold text-stone-800">Status Toko Saat Ini</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSellerStatus("online")}
                    className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-extrabold transition-all ${
                      sellerStatus === "online"
                        ? "bg-emerald-600 text-white shadow"
                        : "border border-stone-300 bg-stone-100 text-stone-600"
                    }`}
                  >
                    <span>🟢</span>
                    <span>Buka (Menerima Pesanan)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerStatus("offline")}
                    className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-extrabold transition-all ${
                      sellerStatus === "offline"
                        ? "bg-zinc-700 text-white shadow"
                        : "border border-stone-300 bg-stone-100 text-stone-600"
                    }`}
                  >
                    <span>⏸️</span>
                    <span>Tutup Sementara</span>
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          {/* ── 5. FOTO & IDENTITAS VISUAL (EKSPLISIT) ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-6">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-[#003D34]">
              5. Foto & Identitas Visual
            </legend>

            {/* A. Foto Utama / Cover */}
            <div className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-[#003D34]">📸 1. Foto Utama / Cover Lapak (Rekomendasi)</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Tampil di kartu katalog dan bagian atas halaman lapak. Gunakan foto tempat usaha, suasana, atau produk asli.
                  </p>
                </div>
                {coverPreview && (
                  <button
                    type="button"
                    onClick={() => { setCoverFile(null); setCoverPreview(""); }}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {coverPreview ? (
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <label className="flex aspect-[21/9] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white hover:border-[#003D34] transition-colors">
                  <span className="text-2xl">📷</span>
                  <span className="mt-1 text-xs font-bold text-stone-600">Pilih Foto Utama Lapak</span>
                  <span className="text-[10px] text-stone-400">JPG, PNG, WebP (Maks. 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], "cover")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* B. Logo Usaha */}
            <div className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-[#003D34]">🏷️ 2. Logo Usaha (Opsional)</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Tampil sebagai avatar kecil identitas lapak (tidak diperbesar jadi foto utama).
                  </p>
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(""); }}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {logoPreview ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white p-1 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo Preview" className="h-full w-full rounded-full object-contain" />
                </div>
              ) : (
                <label className="flex h-20 w-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white hover:border-[#003D34] transition-colors">
                  <span className="text-lg">🏷️</span>
                  <span className="text-[11px] font-bold text-stone-600">Pilih Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], "logo")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* C. Foto Daftar Menu / Brosur */}
            <div className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-[#003D34]">📋 3. Foto Daftar Menu / Brosur Layanan (Opsional)</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Pengunjung dapat memperbesar foto ini untuk membaca daftar menu dan harga dengan jelas.
                  </p>
                </div>
                {menuPreview && (
                  <button
                    type="button"
                    onClick={() => { setMenuFile(null); setMenuPreview(""); }}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {menuPreview ? (
                <div className="relative aspect-[4/3] max-w-xs overflow-hidden rounded-xl border border-stone-300 bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={menuPreview} alt="Menu Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <label className="flex aspect-[4/3] max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white hover:border-[#003D34] transition-colors">
                  <span className="text-xl">📋</span>
                  <span className="mt-1 text-xs font-bold text-stone-600">Unggah Foto Menu</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], "menu")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* D. Galeri Foto Produk & Tempat */}
            <div className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-[#003D34]">🖼️ 4. Galeri Produk / Suasana (Maks. 4 Foto)</span>
                  <p className="text-[11px] text-stone-500">Foto dokumentasi tambahan untuk galeri lapak.</p>
                </div>
                <span className="text-xs font-bold text-stone-500">{galleryItems.length}/4 Foto</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {galleryItems.map((item, idx) => (
                  <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-stone-300 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={`Galeri ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(item.id)}
                      className="absolute right-1.5 top-1.5 rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow hover:bg-red-700"
                    >
                      Hapus
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                {galleryItems.length < 4 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white hover:border-[#003D34] transition-colors">
                    <span className="text-xl">➕</span>
                    <span className="mt-1 text-[11px] font-bold text-stone-600">Tambah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddGalleryFile(e.target.files)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </fieldset>

          {/* ── 6. MENU / LAYANAN / PRODUK UNGGULAN (OPSIONAL) ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <legend className="text-xs font-black uppercase tracking-widest text-[#003D34]">
                  6. Daftar Item / Menu Unggulan (Opsional)
                </legend>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Tambahkan menu atau layanan satu per satu agar pengunjung bisa memesan item spesifik via WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#003D34] px-3 text-xs font-bold text-white hover:bg-[#002D27]"
              >
                <span>+ Tambah Item</span>
              </button>
            </div>

            {structuredProducts.length > 0 ? (
              <div className="space-y-4">
                {structuredProducts.map((prod, index) => (
                  <div key={prod.id} className="rounded-2xl border border-stone-200 bg-[#FBF9F5] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="text-xs font-extrabold text-[#003D34]">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeProduct(prod.id)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Hapus Item
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs font-bold text-stone-800">
                        Nama Item / Menu / Jasa
                        <input
                          type="text"
                          value={prod.name}
                          onChange={(e) => updateProduct(prod.id, { name: e.target.value })}
                          placeholder="Contoh: Donat Keju / Servis AC"
                          className="mt-1 min-h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
                        />
                      </label>

                      <label className="block text-xs font-bold text-stone-800">
                        Harga (Rp)
                        <input
                          type="number"
                          value={prod.price != null ? prod.price : ""}
                          onChange={(e) =>
                            updateProduct(prod.id, {
                              price: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                          }
                          placeholder="Contoh: 20000"
                          min={0}
                          className="mt-1 min-h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
                        />
                      </label>

                      <label className="block text-xs font-bold text-stone-800 sm:col-span-2">
                        Deskripsi Singkat Item
                        <input
                          type="text"
                          value={prod.description || ""}
                          onChange={(e) => updateProduct(prod.id, { description: e.target.value })}
                          placeholder="Contoh: Donat kentang lembut dengan limpahan keju cheddar gurih."
                          className="mt-1 min-h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#003D34]"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                Belum ada item digital yang ditambahkan. (Jika sudah ada foto menu, bagian ini boleh dilewati).
              </p>
            )}
          </fieldset>

          {/* ── 7. KEUNGGULAN USAHA (OPSIONAL) ── */}
          <fieldset className="rounded-3xl border border-[#DED4C4] bg-white p-5 sm:p-7 shadow-sm space-y-4">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-[#003D34]">
              7. Keunggulan Usaha (Maks. 4)
            </legend>
            <p className="text-[11px] text-stone-500">
              Pilih keunggulan yang benar-benar ada pada usaha Anda.
            </p>

            <div className="flex flex-wrap gap-2">
              {(highlightSuggestions[category || "lainnya"] || highlightSuggestions.lainnya).map((hl) => {
                const checked = highlights.includes(hl);
                return (
                  <button
                    key={hl}
                    type="button"
                    onClick={() => toggleHighlight(hl)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                      checked
                        ? "border-[#003D34] bg-[#003D34] text-white shadow-sm"
                        : "border-stone-300 bg-[#FBF9F5] text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {checked ? "✓ " : "+ "}
                    {hl}
                  </button>
                );
              })}
            </div>

            {/* Custom Highlight Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customHighlight}
                onChange={(e) => setCustomHighlight(e.target.value)}
                placeholder="Tambah keunggulan custom..."
                maxLength={40}
                className="min-h-10 flex-1 rounded-xl border border-stone-300 bg-[#FBF9F5] px-3.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#003D34]"
              />
              <button
                type="button"
                onClick={() => {
                  if (customHighlight.trim()) {
                    toggleHighlight(customHighlight.trim());
                    setCustomHighlight("");
                  }
                }}
                className="rounded-xl bg-[#003D34] px-4 text-xs font-bold text-white hover:bg-[#002D27]"
              >
                + Tambah
              </button>
            </div>
          </fieldset>

          {/* ── 8. CATATAN KHUSUS PENGURUS (TERPISAH DARI PUBLIK) ── */}
          <fieldset className="rounded-3xl border border-amber-300/60 bg-amber-50/50 p-5 sm:p-7 shadow-sm space-y-3">
            <legend className="px-2 text-xs font-black uppercase tracking-widest text-amber-900">
              🔒 8. Catatan Internal untuk Pengurus (Opsional)
            </legend>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Catatan ini <strong>HANYA</strong> dapat dilihat oleh Anda dan Pengurus RT. Tidak akan pernah ditampilkan di kartu katalog, halaman publik, maupun tautan berbagi.
            </p>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Contoh: Usaha baru buka minggu depan / minta bantuan posting di pengumuman RT..."
              maxLength={500}
              className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs font-medium text-[#1A1A1A] outline-none focus:border-amber-600"
            />
          </fieldset>

          {/* ── Submit Action ── */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={isSaving || !requiredValidation.isAllValid}
              className={`inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-8 text-sm font-black shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                requiredValidation.isAllValid
                  ? "bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] text-[#15140B] hover:brightness-110"
                  : "bg-stone-300 text-stone-500"
              }`}
            >
              <span>{isSaving ? "⏳ Menyimpan..." : mode === "create" ? "🚀 Daftarkan Lapak Sekarang" : "💾 Simpan Perubahan Lapak"}</span>
            </button>

            <Link
              href={cancelHref}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-300 bg-white px-6 text-xs font-bold text-stone-700 hover:bg-stone-100"
            >
              Batal
            </Link>

            {saveMessage && (
              <span className="text-xs font-semibold text-[#003D34]">{saveMessage}</span>
            )}
          </div>
        </form>

        {/* ── Live Preview Column (Sticky Sidebar on Desktop) ── */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-[#DED4C4] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#003D34]">
                👁️ Preview Kartu Katalog
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                Live
              </span>
            </div>

            {/* Catalog Card Preview */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Cover Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#003D34] to-[#001D18] p-4 text-center text-white">
                    <span className="text-4xl">{categoryOptions.find((c) => c.value === category)?.icon || "🏪"}</span>
                    <p className="mt-1 text-xs font-bold text-white/80">{name || "Nama Lapak"}</p>
                  </div>
                )}

                {category && (
                  <span className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#1A1A1A] shadow">
                    {category}
                  </span>
                )}

                <span className={`absolute right-2.5 top-2.5 rounded-lg px-2 py-0.5 text-[10px] font-bold shadow ${
                  sellerStatus === "online" ? "bg-emerald-950/80 text-emerald-300" : "bg-stone-900/80 text-stone-300"
                }`}>
                  {sellerStatus === "online" ? "🟢 Buka" : "⏸️ Tutup"}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#003D34]">
                  {cluster || "Cluster Warga"}
                </p>
                <h3 className="line-clamp-1 text-base font-extrabold text-[#1A1A1A]">
                  {name || "Nama Lapak Anda"}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-stone-500">
                  {description || "Deskripsi singkat mengenai menu, barang, atau jasa Anda..."}
                </p>

                <div className="rounded-xl bg-[#FBF9F5] p-2.5 text-xs flex items-center justify-between border border-stone-200">
                  <span className="text-stone-500 font-medium">Harga</span>
                  <span className="font-extrabold text-[#003D34]">{formattedPricePreview}</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <span className="flex-1 min-h-8 flex items-center justify-center rounded-lg border border-[#003D34]/30 text-[11px] font-bold text-[#003D34] bg-[#E4F0ED]">
                    Detail Lapak
                  </span>
                  <span className="flex-1 min-h-8 flex items-center justify-center rounded-lg bg-[#D4AF37] text-[11px] font-black text-[#15140B]">
                    Hubungi WA
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3 text-xs text-stone-500 space-y-1">
              <p>✓ Foto cover & logo terpisah rapi.</p>
              <p>✓ Tidak memuat data internal di deskripsi publik.</p>
              <p>✓ WhatsApp otomatis terhubung ke chat.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
