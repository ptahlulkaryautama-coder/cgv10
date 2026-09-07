import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Baca .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ File .env.local tidak ditemukan.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    value = value.trim().replace(/^['"]|['"]$/g, "");
    envVars[match[1]] = value;
  }
}

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("🚀 Menghubungkan ke Supabase Auth Admin...");

  // 1. Ambil semua pendaftaran warga
  const { data: requests, error: reqErr } = await supabaseAdmin
    .from("resident_registration_requests")
    .select("id, email, display_name, status, cluster, block_or_unit");

  if (reqErr) {
    console.error("❌ Gagal mengambil data pendaftaran warga:", reqErr.message);
    process.exit(1);
  }

  console.log(`📋 Ditemukan ${requests.length} data pendaftaran warga.`);

  // 2. Ambil semua auth users
  const { data: authUsersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersErr) {
    console.error("❌ Gagal mengambil daftar auth users:", usersErr);
    console.error("Detail:", JSON.stringify(usersErr, Object.getOwnPropertyNames(usersErr), 2));
    process.exit(1);
  }

  const authUserMap = new Map();
  for (const u of authUsersData.users) {
    if (u.email) {
      authUserMap.set(u.email.toLowerCase().trim(), u);
    }
  }

  console.log(`🔐 Total ${authUsersData.users.length} akun terdaftar di Supabase Auth.`);
  console.log("⚙️  Menyetel password 'cgv10warga' dan konfirmasi email untuk seluruh warga...\n");

  let updatedCount = 0;
  let createdCount = 0;
  let failedCount = 0;

  const processedEmails = new Set();

  for (const req of requests) {
    const email = req.email?.toLowerCase().trim();
    if (!email || processedEmails.has(email)) continue;
    processedEmails.add(email);

    const existingAuthUser = authUserMap.get(email);

    try {
      if (existingAuthUser) {
        // Update password & confirm email secara resmi via GoTrue
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
          existingAuthUser.id,
          {
            password: "cgv10warga",
            email_confirm: true,
            user_metadata: {
              ...existingAuthUser.user_metadata,
              display_name: req.display_name || existingAuthUser.user_metadata?.display_name,
            },
          }
        );

        if (updateErr) {
          console.error(`❌ [UPDATE FAILED] ${email}: ${updateErr.message}`);
          failedCount++;
        } else {
          console.log(`✅ [PASSWORD DISETEL] ${email} (${req.display_name || "-"})`);
          updatedCount++;
        }
      } else {
        // Create user baru langsung aktif
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: "cgv10warga",
          email_confirm: true,
          user_metadata: {
            display_name: req.display_name || "Warga CGV10",
          },
        });

        if (createErr) {
          console.error(`❌ [CREATE FAILED] ${email}: ${createErr.message}`);
          failedCount++;
        } else {
          console.log(`✨ [AKUN BARU DIBUAT] ${email} (${req.display_name || "-"})`);
          createdCount++;
        }
      }
    } catch (e) {
      console.error(`❌ [ERROR] ${email}:`, e.message);
      failedCount++;
    }
  }

  console.log("\n==========================================");
  console.log(`🎉 PROSES SELESAI!`);
  console.log(`✅ Password Diperbarui : ${updatedCount} akun`);
  console.log(`✨ Akun Baru Dibuat    : ${createdCount} akun`);
  if (failedCount > 0) {
    console.log(`⚠️  Gagal              : ${failedCount} akun`);
  }
  console.log(`🔑 Password Default    : cgv10warga`);
  console.log("==========================================");
}

main();
