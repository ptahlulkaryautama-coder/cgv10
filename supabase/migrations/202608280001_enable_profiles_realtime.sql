-- Migration: Enable Realtime for profiles table
-- Tujuan: Agar portal dashboard dapat menerima perubahan display_name secara real-time
-- tanpa perlu reload halaman, saat Super Admin memperbarui nama dari panel pengaturan admin.

-- Aktifkan Realtime publikasi untuk tabel profiles
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

COMMENT ON TABLE public.profiles IS 
  'Profil warga dan pengurus. Realtime aktif untuk sinkronisasi display_name secara langsung ke portal dashboard.';
