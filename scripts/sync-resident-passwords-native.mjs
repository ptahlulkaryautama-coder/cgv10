import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Baca .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
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
const anonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const serviceRoleKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🚀 Mengambil daftar pendaftaran warga...");

  const { data: requests, error: reqErr } = await supabaseAdmin
    .from("resident_registration_requests")
    .select("id, email, display_name, status, cluster, block_or_unit")
    .order("created_at", { ascending: true });

  if (reqErr) {
    console.error("❌ Gagal mengambil data pendaftaran warga:", reqErr.message);
    process.exit(1);
  }

  console.log(`📋 Total ${requests.length} data pendaftaran ditemukan.`);

  const processedEmails = new Set();
  let successCount = 0;
  let failCount = 0;

  for (const req of requests) {
    const email = req.email?.toLowerCase().trim();
    if (!email || processedEmails.has(email)) continue;
    processedEmails.add(email);

    // Jangan sentuh akun pengurus
    if (["dharma.doddy9@yahoo.co.uk", "zulhendy@gmail.com", "nikodiponako7@gmail.com"].includes(email)) {
      continue;
    }

    try {
      console.log(`🔄 Mendaftarkan akun resmi untuk: ${email} (${req.display_name || "-"})`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password: "cgv10warga",
        options: {
          data: {
            display_name: req.display_name || "Warga CGV10",
          },
        },
      });

      if (error) {
        console.error(`  ❌ Gagal: ${error.message}`);
        failCount++;
      } else {
        console.log(`  ✅ Berhasil dibuat: ${email} (ID: ${data.user?.id})`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Error:`, err.message);
      failCount++;
    }

    // Beri jeda 200ms agar rate limit aman
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n==========================================");
  console.log(`🎉 SINKRONISASI SELESAI!`);
  console.log(`✅ Berhasil dibuat & aktif: ${successCount} akun warga`);
  if (failCount > 0) {
    console.log(`⚠️  Gagal                 : ${failCount} akun`);
  }
  console.log(`🔑 Password Seluruh Warga : cgv10warga`);
  console.log("==========================================");

  // Auto assign role warga for approved
  console.log("🛡️  Memastikan role 'warga' aktif untuk yang berstatus approved...");
  await supabaseAdmin.rpc("approve_backfill_roles", {}).catch(() => {});
}

main();
