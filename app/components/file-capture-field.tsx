"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type CaptureAttachment = {
  id: string;
  file: File;
};

type FileCaptureFieldProps = {
  attachments: CaptureAttachment[];
  description: string;
  id: string;
  label: string;
  maxFiles?: number;
  onChange: (attachments: CaptureAttachment[]) => void;
};

type CameraState = "idle" | "requesting" | "ready" | "error";
const maxOptimizedImageDimension = 1920;
const optimizedImageQuality = 0.82;

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function canOptimizeImage(file: File) {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
}

async function optimizeImageFile(file: File) {
  if (!canOptimizeImage(file)) return file;

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Gambar tidak dapat diproses."));
      image.src = imageUrl;
    });

    const scale = Math.min(
      1,
      maxOptimizedImageDimension / Math.max(image.naturalWidth, image.naturalHeight),
    );

    if (scale === 1 && file.size < 900 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", optimizedImageQuality);
    });

    if (!blob || blob.size >= file.size) return file;

    const optimizedName = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${optimizedName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: CaptureAttachment;
  onRemove: () => void;
}) {
  const previewUrl = useMemo(() => URL.createObjectURL(attachment.file), [attachment.file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <li className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl border border-border bg-background p-2">
      {/* Local object URLs cannot be optimized by next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt={`Preview ${attachment.file.name}`}
        className="h-[72px] w-[72px] rounded-lg object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{attachment.file.name}</p>
        <p className="mt-1 text-xs text-muted">{formatFileSize(attachment.file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-colors duration-200 hover:border-primary/35 hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`Hapus ${attachment.file.name}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M6 6l12 12M18 6L6 18"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </li>
  );
}

export function FileCaptureField({
  attachments,
  description,
  id,
  label,
  maxFiles = 4,
  onChange,
}: FileCaptureFieldProps) {
  const [inputKey, setInputKey] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [processingFiles, setProcessingFiles] = useState(false);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestIdRef = useRef(0);
  const remainingSlots = Math.max(0, maxFiles - attachments.length);

  useEffect(() => {
    const video = videoRef.current;

    if (!cameraOpen || !cameraStream || !video) {
      return;
    }

    video.srcObject = cameraStream;
    void video.play().catch(() => {
      setCameraState("error");
      setCameraError("Preview kamera tidak dapat diputar. Coba tutup lalu buka kembali kamera.");
    });

    return () => {
      video.srcObject = null;
    };
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      cameraRequestIdRef.current += 1;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraStream(null);
      setCameraOpen(false);
      setCameraState("idle");
      setCameraError("");
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      cameraRequestIdRef.current += 1;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function addFiles(files: FileList | File[] | null) {
    if (!files || remainingSlots === 0) {
      return;
    }

    setProcessingFiles(true);

    const selectedFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);
    const optimizedFiles = await Promise.all(selectedFiles.map((file) => optimizeImageFile(file)));
    const nextAttachments = optimizedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
      }));

    if (nextAttachments.length > 0) {
      onChange([...attachments, ...nextAttachments]);
    }

    setInputKey((current) => current + 1);
    setProcessingFiles(false);
  }

  function stopCamera() {
    cameraRequestIdRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStream(null);
    setCameraOpen(false);
    setCameraState("idle");
    setCameraError("");
  }

  async function openCamera() {
    if (remainingSlots === 0) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      nativeCameraInputRef.current?.click();
      return;
    }

    const requestId = cameraRequestIdRef.current + 1;
    cameraRequestIdRef.current = requestId;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStream(null);
    setCameraOpen(true);
    setCameraState("requesting");
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (cameraRequestIdRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setCameraStream(stream);
      setCameraState("ready");
    } catch (error) {
      if (cameraRequestIdRef.current !== requestId) return;

      const errorName = error instanceof DOMException ? error.name : "";
      const message =
        errorName === "NotAllowedError" || errorName === "SecurityError"
          ? "Izin kamera belum diberikan. Aktifkan izin kamera pada browser, lalu coba lagi."
          : errorName === "NotFoundError" || errorName === "OverconstrainedError"
            ? "Kamera tidak ditemukan pada perangkat ini."
            : errorName === "NotReadableError" || errorName === "AbortError"
              ? "Kamera sedang dipakai aplikasi lain atau belum dapat diakses. Tutup aplikasi kamera lain lalu coba lagi."
              : "Kamera belum dapat dibuka. Pastikan portal menggunakan HTTPS dan izin kamera aktif.";

      setCameraState("error");
      setCameraError(message);
    }
  }

  async function takePhoto() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraState("error");
      setCameraError("Kamera belum siap. Tunggu preview muncul, lalu coba jepret kembali.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraState("error");
      setCameraError("Foto belum dapat diproses oleh browser ini.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    if (!blob) {
      setCameraState("error");
      setCameraError("Foto gagal disimpan. Silakan jepret kembali.");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = new File([blob], `foto-kamera-${timestamp}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    await addFiles([file]);
    stopCamera();
  }

  function removeAttachment(idToRemove: string) {
    onChange(attachments.filter((attachment) => attachment.id !== idToRemove));
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p id={`${id}-label`} className="text-sm font-semibold text-foreground">
            {label}
          </p>
          <p id={`${id}-description`} className="mt-1 text-xs leading-5 text-muted">
            {description}
          </p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {attachments.length}/{maxFiles} foto
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <div>
          <input
            ref={nativeCameraInputRef}
            key={`camera-${inputKey}`}
            id={`${id}-camera-fallback`}
            type="file"
            accept="image/*"
            capture="environment"
            disabled={remainingSlots === 0}
            aria-labelledby={`${id}-label ${id}-camera-text`}
            aria-describedby={`${id}-description`}
            onChange={(event) => {
              void addFiles(event.target.files);
            }}
            className="sr-only"
          />
          <button
            type="button"
            onClick={openCamera}
            disabled={remainingSlots === 0}
            aria-describedby={`${id}-description`}
            className={[
              "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-3 text-center text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:px-4",
              remainingSlots === 0
                ? "cursor-not-allowed border-border bg-muted/10 text-muted"
                : "cursor-pointer border-primary bg-primary text-white hover:bg-primary-hover",
            ].join(" ")}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
              <path d="M8.5 6.5 10 4h4l1.5 2.5H19A2 2 0 0 1 21 8.5v8A2 2 0 0 1 19 18.5H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.5Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
              <circle cx="12" cy="12.5" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span id={`${id}-camera-text`}>Ambil foto</span>
          </button>
        </div>

        <div>
          <input
            key={`gallery-${inputKey}`}
            id={`${id}-gallery`}
            type="file"
            accept="image/*"
            multiple
            disabled={remainingSlots === 0}
            aria-labelledby={`${id}-label ${id}-gallery-text`}
            aria-describedby={`${id}-description`}
            onChange={(event) => {
              void addFiles(event.target.files);
            }}
            className="peer sr-only"
          />
          <label
            htmlFor={`${id}-gallery`}
            aria-disabled={remainingSlots === 0}
            className={[
              "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-3 text-center text-sm font-semibold transition-colors duration-200 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background sm:w-auto sm:px-4",
              remainingSlots === 0
                ? "cursor-not-allowed border-border bg-muted/10 text-muted"
                : "cursor-pointer border-primary/25 bg-primary-soft text-primary hover:border-primary/45 hover:bg-primary-soft/80",
            ].join(" ")}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
              <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="8.2" cy="9" r="1.5" fill="currentColor" />
              <path d="m5.5 17 4.2-4.2 3.2 3.1 2.2-2.2 3.4 3.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
            <span id={`${id}-gallery-text`}>Pilih galeri</span>
          </label>
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-muted">
        Ambil foto membuka kamera langsung di laptop atau HP. Foto besar akan diringankan otomatis sebelum diunggah.
      </p>

      {processingFiles ? (
        <p className="mt-3 rounded-xl border border-primary/20 bg-primary-soft p-3 text-xs font-semibold text-primary" role="status" aria-live="polite">
          Menyiapkan foto agar lebih ringan...
        </p>
      ) : null}

      {attachments.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-4 text-sm leading-6 text-muted">
          Belum ada foto dipilih. Foto hanya dipreview di perangkat ini dan belum diunggah.
        </p>
      )}

      {cameraOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-camera-title`}
          aria-describedby={`${id}-camera-help`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) stopCamera();
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-t-[24px] border border-white/15 bg-surface shadow-2xl sm:rounded-[24px]">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2 id={`${id}-camera-title`} className="text-lg font-bold text-foreground">
                  Ambil foto
                </h2>
                <p id={`${id}-camera-help`} className="mt-1 text-sm leading-5 text-muted">
                  Arahkan kamera ke produk atau lapak, lalu tekan Jepret foto.
                </p>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Tutup kamera"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            <div className="relative aspect-[4/3] max-h-[65vh] overflow-hidden bg-[#101412] sm:aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                aria-label="Preview kamera"
                className={`h-full w-full object-contain ${cameraState === "ready" ? "block" : "hidden"}`}
              />

              {cameraState === "requesting" ? (
                <div className="absolute inset-0 grid place-items-center px-6 text-center text-white" aria-live="polite">
                  <div>
                    <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" />
                    <p className="mt-4 text-sm font-semibold">Menunggu izin kamera...</p>
                    <p className="mt-1 text-xs leading-5 text-white/70">Pilih Izinkan saat browser meminta akses.</p>
                  </div>
                </div>
              ) : null}

              {cameraState === "error" ? (
                <div className="absolute inset-0 grid place-items-center px-6 text-center text-white" role="alert">
                  <div className="max-w-md">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto h-10 w-10 text-accent">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M12 7.5v5M12 16.5h.01" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                    <p className="mt-3 text-sm font-semibold leading-6">{cameraError}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border bg-background px-4 py-4 sm:flex sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors duration-200 hover:border-primary/30 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Batal
              </button>
              {cameraState === "error" ? (
                <button
                  type="button"
                  onClick={openCamera}
                  className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Coba lagi
                </button>
              ) : (
                <button
                  type="button"
                  onClick={takePhoto}
                  disabled={cameraState !== "ready"}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 enabled:cursor-pointer enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                    <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                  </svg>
                  Jepret foto
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
