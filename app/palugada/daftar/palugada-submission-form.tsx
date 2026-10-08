"use client";

import { useState } from "react";
import {
  PalugadaEditorForm,
  type PalugadaEditorFiles,
} from "@/app/components/palugada-editor-form";
import {
  type StructuredPalugadaListing,
  serializeStructuredListing,
} from "@/lib/palugada-storefront-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const palugadaPublicMediaBucket = "portal-post-media";

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getUploadContentType(file: File) {
  if (file.type) return file.type;
  const fallback: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    heif: "image/heif",
  };
  return fallback[getFileExtension(file.name)] ?? "application/octet-stream";
}

function getSafeFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "foto-palugada";
  return `${base}.${extension || "jpg"}`;
}

type UploadSession = {
  listing_id: string;
  upload_token: string;
};

export function PalugadaSubmissionForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function handleSave(
    data: StructuredPalugadaListing,
    files: PalugadaEditorFiles
  ): Promise<{ success: boolean; listingId?: string; error?: string }> {
    setIsSaving(true);
    setSaveMessage("Menyiapkan pendaftaran lapak...");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (userError || !userId) {
        throw new Error("Masuk terlebih dahulu supaya lapak terhubung dengan akun warga Anda.");
      }

      // 1. Initial serialization
      const serialized = serializeStructuredListing(data);

      setSaveMessage("Mendaftarkan lapak ke sistem...");
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "submit_palugada_listing",
        {
          p_name: serialized.name,
          p_category: serialized.category,
          p_cluster: serialized.cluster,
          p_price_label: serialized.price_label,
          p_description: serialized.description,
          p_availability_note: serialized.availability_note,
          p_contact_method: serialized.contact_method,
        }
      );

      if (rpcError) throw rpcError;
      const session = ((rpcData ?? []) as UploadSession[])[0];
      if (!session || !session.listing_id) {
        throw new Error("Gagal membuat pendaftaran lapak. Coba beberapa saat lagi.");
      }

      const listingId = session.listing_id;
      let finalCoverUrl: string | null = null;
      let finalLogoUrl: string | null = null;
      let finalMenuUrl: string | null = null;
      const finalGalleryUrls: string[] = [];

      // 2. Upload Logo if provided
      if (files.logoFile) {
        setSaveMessage("Mengunggah logo usaha...");
        const safeName = getSafeFileName(files.logoFile.name);
        const storagePath = `palugada/${listingId}/logo/${Date.now()}-${safeName}`;

        const { error: logoUploadErr } = await supabase.storage
          .from(palugadaPublicMediaBucket)
          .upload(storagePath, files.logoFile, {
            cacheControl: "31536000",
            contentType: getUploadContentType(files.logoFile),
            upsert: true,
          });

        if (!logoUploadErr) {
          const { data: urlData } = supabase.storage
            .from(palugadaPublicMediaBucket)
            .getPublicUrl(storagePath);
          finalLogoUrl = urlData.publicUrl;

          await supabase.from("attachments").insert({
            owner_user_id: userId,
            linked_type: "palugada_listing",
            linked_id: listingId,
            file_name: files.logoFile.name,
            file_type: getUploadContentType(files.logoFile),
            file_size: files.logoFile.size,
            storage_path: storagePath,
            visibility: "public_after_approval",
            moderation_status: "approved",
          });
        }
      }

      // 3. Upload Dedicated Cover Photo if provided
      if (files.coverFile) {
        setSaveMessage("Mengunggah foto utama lapak...");
        const safeName = getSafeFileName(files.coverFile.name);
        const storagePath = `palugada/${listingId}/cover/${Date.now()}-${safeName}`;

        const { error: coverUploadErr } = await supabase.storage
          .from(palugadaPublicMediaBucket)
          .upload(storagePath, files.coverFile, {
            cacheControl: "31536000",
            contentType: getUploadContentType(files.coverFile),
            upsert: true,
          });

        if (!coverUploadErr) {
          const { data: urlData } = supabase.storage
            .from(palugadaPublicMediaBucket)
            .getPublicUrl(storagePath);
          finalCoverUrl = urlData.publicUrl;

          await supabase.from("attachments").insert({
            owner_user_id: userId,
            linked_type: "palugada_listing",
            linked_id: listingId,
            file_name: files.coverFile.name,
            file_type: getUploadContentType(files.coverFile),
            file_size: files.coverFile.size,
            storage_path: storagePath,
            visibility: "public_after_approval",
            moderation_status: "approved",
          });
        }
      }

      // 4. Upload Menu Photo if provided
      if (files.menuFile) {
        setSaveMessage("Mengunggah foto menu / brosur...");
        const safeName = getSafeFileName(files.menuFile.name);
        const storagePath = `palugada/${listingId}/menu/${Date.now()}-${safeName}`;

        const { error: menuUploadErr } = await supabase.storage
          .from(palugadaPublicMediaBucket)
          .upload(storagePath, files.menuFile, {
            cacheControl: "31536000",
            contentType: getUploadContentType(files.menuFile),
            upsert: true,
          });

        if (!menuUploadErr) {
          const { data: urlData } = supabase.storage
            .from(palugadaPublicMediaBucket)
            .getPublicUrl(storagePath);
          finalMenuUrl = urlData.publicUrl;

          await supabase.from("attachments").insert({
            owner_user_id: userId,
            linked_type: "palugada_listing",
            linked_id: listingId,
            file_name: files.menuFile.name,
            file_type: getUploadContentType(files.menuFile),
            file_size: files.menuFile.size,
            storage_path: storagePath,
            visibility: "public_after_approval",
            moderation_status: "approved",
          });
        }
      }

      // 5. Upload Gallery Photos if provided
      for (const [idx, item] of files.galleryFiles.entries()) {
        if (item.file) {
          setSaveMessage(`Mengunggah galeri ${idx + 1} dari ${files.galleryFiles.length}...`);
          const safeName = getSafeFileName(item.file.name);
          const storagePath = `palugada/${listingId}/photos/${Date.now()}-${safeName}`;

          const { error: galleryUploadErr } = await supabase.storage
            .from(palugadaPublicMediaBucket)
            .upload(storagePath, item.file, {
              cacheControl: "31536000",
              contentType: getUploadContentType(item.file),
              upsert: true,
            });

          if (!galleryUploadErr) {
            const { data: urlData } = supabase.storage
              .from(palugadaPublicMediaBucket)
              .getPublicUrl(storagePath);
            const pubUrl = urlData.publicUrl;
            finalGalleryUrls.push(pubUrl);

            await supabase.from("attachments").insert({
              owner_user_id: userId,
              linked_type: "palugada_listing",
              linked_id: listingId,
              file_name: item.file.name,
              file_type: getUploadContentType(item.file),
              file_size: item.file.size,
              storage_path: storagePath,
              visibility: "public_after_approval",
              moderation_status: "approved",
            });

            // If no dedicated cover was given, first gallery image serves as cover
            if (!finalCoverUrl && idx === 0) {
              finalCoverUrl = pubUrl;
            }
          }
        } else if (item.existingUrl) {
          finalGalleryUrls.push(item.existingUrl);
        }
      }

      // 6. Update listing record with final URLs and complete re-serialized metadata
      const updatedListingData: StructuredPalugadaListing = {
        ...data,
        id: listingId,
        logoUrl: finalLogoUrl || data.logoUrl,
        coverUrl: finalCoverUrl || data.coverUrl,
        menuPhotoUrl: finalMenuUrl || data.menuPhotoUrl,
        galleryUrls: finalGalleryUrls.length ? finalGalleryUrls : data.galleryUrls,
      };

      const finalSerialized = serializeStructuredListing(updatedListingData);

      await supabase
        .from("palugada_listings")
        .update({
          cover_image_url: finalCoverUrl || data.coverUrl || null,
          cover_image_alt: `Cover ${data.name.trim()}`,
          description: finalSerialized.description,
          price_label: finalSerialized.price_label,
          seller_status: finalSerialized.seller_status,
          seller_status_note: finalSerialized.seller_status_note,
        })
        .eq("id", listingId);

      setSaveMessage("Lapak berhasil didaftarkan dan langsung tayang di katalog!");
      return { success: true, listingId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Pendaftaran lapak belum berhasil dikirim.";
      setSaveMessage("");
      return { success: false, error: msg };
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="py-2">
      <PalugadaEditorForm
        mode="create"
        onSave={handleSave}
        isSaving={isSaving}
        saveMessage={saveMessage}
        cancelHref="/palugada/"
      />
    </div>
  );
}
