"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { compressImageFile } from "@/lib/security-visitor-data";
import {
  IconAlertTriangle,
  IconCamera,
  IconCheck,
  IconIdCard,
  IconRefresh,
  IconScanFace,
  IconShield,
  IconTrash,
  IconX,
} from "./security-icons";

interface SecurityCameraCaptureProps {
  label: string;
  type: "visitor" | "id_card";
  initialPreview?: string | null;
  onPhotoCaptured: (file: File, previewUrl: string) => void;
  onPhotoCleared: () => void;
  required?: boolean;
}

export function SecurityCameraCapture({
  label,
  type,
  initialPreview = null,
  onPhotoCaptured,
  onPhotoCleared,
  required = false,
}: SecurityCameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    type === "visitor" ? "user" : "environment",
  );
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tactile vibration
  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([20, 30, 20]);
      } catch {}
    }
  }, []);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Check available cameras
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (tempPreview && tempPreview.startsWith("blob:")) {
        URL.revokeObjectURL(tempPreview);
      }
    };
  }, [stopStream, tempPreview]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);
    setIsCapturing(true);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Kamera hardware tidak terdeteksi. Silakan gunakan tombol unggah berkas.",
      );
      setIsCapturing(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCapturing(false);
    } catch (err: unknown) {
      setIsCapturing(false);
      const errorMsg =
        err instanceof Error
          ? err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
            ? "Izin akses kamera ditolak. Silakan izinkan browser atau gunakan unggah berkas."
            : err.name === "NotFoundError" || err.name === "DevicesNotFoundError"
              ? "Kamera tidak ditemukan pada perangkat ini."
              : `Gagal mengakses sensor optik (${err.message}).`
          : "Gagal mengakses kamera.";
      setCameraError(errorMsg);
    }
  }, [facingMode, stopStream]);

  function handleOpenModal() {
    triggerHaptic();
    setCapturedBlob(null);
    setTempPreview(null);
    setIsOpen(true);
    setTimeout(() => {
      void startCamera();
    }, 100);
  }

  function handleCloseModal() {
    stopStream();
    if (tempPreview && tempPreview.startsWith("blob:")) {
      URL.revokeObjectURL(tempPreview);
    }
    setCapturedBlob(null);
    setTempPreview(null);
    setIsOpen(false);
  }

  function handleToggleCamera() {
    triggerHaptic();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  function handleSnapPhoto() {
    if (!videoRef.current) return;
    triggerHaptic();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setTempPreview(url);
        stopStream();
      },
      "image/jpeg",
      0.9,
    );
  }

  function handleRetake() {
    triggerHaptic();
    if (tempPreview && tempPreview.startsWith("blob:")) {
      URL.revokeObjectURL(tempPreview);
    }
    setCapturedBlob(null);
    setTempPreview(null);
    void startCamera();
  }

  async function handleConfirmPhoto() {
    if (!capturedBlob) return;
    triggerHaptic();
    setIsCapturing(true);

    const fileName = `${type}_${Date.now()}.jpg`;
    const originalFile = new File([capturedBlob], fileName, { type: "image/jpeg" });

    try {
      const compressed = await compressImageFile(originalFile, 1200, 0.82);
      const finalFile = new File([compressed], fileName, { type: "image/jpeg" });
      const finalUrl = URL.createObjectURL(finalFile);

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(finalUrl);
      onPhotoCaptured(finalFile, finalUrl);
      handleCloseModal();
    } catch {
      const finalUrl = URL.createObjectURL(originalFile);
      setPreviewUrl(finalUrl);
      onPhotoCaptured(originalFile, finalUrl);
      handleCloseModal();
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      const finalFile = new File([compressed], file.name, { type: file.type });
      const finalUrl = URL.createObjectURL(finalFile);

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(finalUrl);
      onPhotoCaptured(finalFile, finalUrl);
    } catch {
      const finalUrl = URL.createObjectURL(file);
      setPreviewUrl(finalUrl);
      onPhotoCaptured(file, finalUrl);
    }
  }

  function handleClear() {
    triggerHaptic();
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onPhotoCleared();
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
          <span>{label}</span>
          {required ? (
            <span className="rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold tracking-tight">
              REQUIRED
            </span>
          ) : (
            <span className="rounded bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.2 text-[10px] font-mono font-bold tracking-tight">
              OPTIONAL
            </span>
          )}
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <IconTrash size={12} />
            <span>Hapus Foto</span>
          </button>
        )}
      </div>

      {previewUrl ? (
        <div className="group relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={label}
            className="w-full h-48 sm:h-52 object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          {/* Tactical Overlay Reticle */}
          <div className="pointer-events-none absolute inset-3 border border-dashed border-emerald-400/30 rounded-xl" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-3.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 text-xs font-mono font-bold text-emerald-300 backdrop-blur shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VERIFIED // SEC-PASS
            </span>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 px-3.5 text-xs font-bold text-slate-200 hover:text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
            >
              <IconRefresh size={13} />
              <span>Foto Ulang</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 transition-all hover:border-emerald-500/40 hover:bg-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Direct Tactical Camera Button */}
            <button
              type="button"
              onClick={handleOpenModal}
              className="flex-1 min-h-14 cursor-pointer inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-slate-850 via-slate-800 to-slate-850 px-4 text-sm font-bold text-emerald-400 shadow-md transition-all hover:border-emerald-500/50 hover:bg-slate-800 active:scale-[0.98] border border-slate-700"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {type === "visitor" ? <IconScanFace size={20} /> : <IconIdCard size={20} />}
              </span>
              <div className="text-left">
                <span className="block leading-tight font-bold tracking-wide text-slate-100">
                  {type === "visitor" ? "Optical Facial Capture" : "Optical Document Scan"}
                </span>
                <span className="block text-[10px] font-mono text-slate-400">
                  {type === "visitor" ? "Kamera Wajah Tamu / Driver" : "Dokumen KTP / SIM / Paspor"}
                </span>
              </div>
            </button>

            {/* Fallback File/Gallery Input */}
            <label className="min-h-14 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 text-xs font-bold text-slate-300 shadow-sm transition-all hover:bg-slate-800 hover:text-white active:scale-95">
              <IconCamera size={16} className="text-slate-400" />
              <span>Berkas</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={type === "visitor" ? "user" : "environment"}
                onChange={handleFileInputChange}
                className="sr-only"
              />
            </label>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <IconShield size={11} className="text-emerald-500" />
              AES-256 SECURE VAULT
            </span>
            <span>AUTO-OPTIMIZED // 1200PX</span>
          </div>
        </div>
      )}

      {/* Fullscreen High-Tech Camera HUD Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 sm:p-6 backdrop-blur-md">
          <div className="relative flex flex-col w-full max-w-lg max-h-[96vh] rounded-3xl bg-slate-950 overflow-hidden shadow-2xl border border-slate-800">
            {/* Tactical Top Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <IconCamera size={16} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {tempPreview ? "PREVIEW // EVIDENCE" : label}
                  </h3>
                  <p className="text-[10px] font-mono text-emerald-400">
                    {tempPreview ? "Pastikan gambar tajam dan terbaca jelas" : "Posisikan subjek dalam reticle optik"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup kamera"
              >
                <IconX size={15} />
              </button>
            </div>

            {/* Viewfinder Area with HUD Elements */}
            <div className="relative flex-1 min-h-[340px] max-h-[520px] bg-black grid place-items-center overflow-hidden">
              {isFlashing && (
                <div className="absolute inset-0 z-30 bg-white pointer-events-none transition-opacity duration-200" />
              )}

              {tempPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={tempPreview}
                  alt="Hasil potret"
                  className="w-full h-full object-contain max-h-[520px]"
                />
              ) : cameraError ? (
                <div className="p-6 text-center text-white max-w-xs">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <IconAlertTriangle size={24} />
                  </div>
                  <p className="text-xs font-bold text-rose-300 font-mono leading-relaxed">{cameraError}</p>
                  <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-bold text-slate-950 shadow-lg hover:bg-emerald-400">
                    <span>Unggah dari File</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture={type === "visitor" ? "user" : "environment"}
                      onChange={(e) => {
                        handleFileInputChange(e);
                        handleCloseModal();
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={`w-full h-full object-cover max-h-[520px] ${
                      facingMode === "user" ? "scale-x-[-1]" : ""
                    }`}
                  />

                  {/* High-Tech Tactical Reticle Overlay */}
                  <div className="pointer-events-none absolute inset-6 flex flex-col justify-between">
                    {/* Top Corner Brackets */}
                    <div className="flex justify-between items-start">
                      <div className="h-6 w-6 border-t-2 border-l-2 border-emerald-400" />
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-950/80 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 backdrop-blur border border-emerald-500/30 shadow">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {type === "visitor" ? "OPTICAL FACIAL HUD" : "OCR DOCUMENT HUD"}
                      </span>
                      <div className="h-6 w-6 border-t-2 border-r-2 border-emerald-400" />
                    </div>

                    {/* Center Crosshair / Scanning reticle */}
                    <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44 rounded-xl border border-emerald-400/40 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-400/60" />
                      <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                    </div>

                    {/* Bottom Corner Brackets */}
                    <div className="flex justify-between items-end">
                      <div className="h-6 w-6 border-b-2 border-l-2 border-emerald-400" />
                      <span className="rounded bg-slate-950/80 px-2 py-0.5 text-[9px] font-mono text-slate-400 border border-slate-800">
                        720P HD // READY
                      </span>
                      <div className="h-6 w-6 border-b-2 border-r-2 border-emerald-400" />
                    </div>
                  </div>

                  {isCapturing && (
                    <div className="absolute inset-0 bg-black/80 grid place-items-center text-white z-20">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                        <span className="text-xs font-mono font-bold tracking-wider text-emerald-400">INITIALIZING OPTICAL SENSOR...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tactical Action Controls Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              {tempPreview ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 min-h-12 cursor-pointer rounded-xl border border-slate-700 bg-slate-800 px-4 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <IconRefresh size={14} />
                    <span>Ulangi Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPhoto}
                    className="flex-1 min-h-12 cursor-pointer rounded-xl bg-emerald-500 px-4 text-xs font-bold text-slate-950 shadow-lg transition-all hover:bg-emerald-400 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <IconCheck size={16} />
                    <span>Gunakan Bukti Ini</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  {/* Camera Flip Switch */}
                  {hasMultipleCameras ? (
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className="min-h-11 px-3.5 cursor-pointer rounded-xl border border-slate-700 bg-slate-800 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
                      title="Ganti sensor kamera"
                    >
                      <IconRefresh size={14} />
                      <span className="hidden sm:inline">Flip</span>
                    </button>
                  ) : (
                    <div className="w-12" />
                  )}

                  {/* Main Tactile Shutter Button */}
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    disabled={isCapturing || Boolean(cameraError)}
                    className="group relative h-16 w-16 cursor-pointer rounded-full border-2 border-emerald-400 bg-slate-950 p-1 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Ambil foto"
                  >
                    <span className="h-12 w-12 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="min-h-11 px-4 cursor-pointer rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
