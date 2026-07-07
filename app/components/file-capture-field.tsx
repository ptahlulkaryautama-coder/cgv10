"use client";

import { useEffect, useMemo, useState } from "react";

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

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
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
  const remainingSlots = Math.max(0, maxFiles - attachments.length);

  function addFiles(fileList: FileList | null) {
    if (!fileList || remainingSlots === 0) {
      return;
    }

    const nextAttachments = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots)
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
      }));

    if (nextAttachments.length > 0) {
      onChange([...attachments, ...nextAttachments]);
    }

    setInputKey((current) => current + 1);
  }

  function removeAttachment(idToRemove: string) {
    onChange(attachments.filter((attachment) => attachment.id !== idToRemove));
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-foreground">
            {label}
          </label>
          <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
        </div>
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          {attachments.length}/{maxFiles} foto
        </span>
      </div>

      <div className="mt-4">
        <input
          key={inputKey}
          id={id}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          disabled={remainingSlots === 0}
          onChange={(event) => addFiles(event.target.files)}
          className="sr-only"
        />
        <label
          htmlFor={id}
          aria-disabled={remainingSlots === 0}
          className={[
            "inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background sm:w-auto",
            remainingSlots === 0
              ? "cursor-not-allowed border-border bg-muted/10 text-muted"
              : "cursor-pointer border-primary/25 bg-primary-soft text-primary hover:border-primary/45 hover:bg-primary-soft/80",
          ].join(" ")}
        >
          Pilih atau ambil foto
        </label>
      </div>

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
    </div>
  );
}
