import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const supabaseAdmin = createClient(
  envVars["NEXT_PUBLIC_SUPABASE_URL"],
  envVars["SUPABASE_SERVICE_ROLE_KEY"],
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function backfillRoles() {
  console.log("🛡️  Memberikan role 'warga' untuk seluruh warga yang sudah disetujui...");
  
  // Ambil semua pendaftaran yang approved
  const { data: approvedReqs } = await supabaseAdmin
    .from("resident_registration_requests")
    .select("requested_user_id, email, status")
    .eq("status", "approved");

  // Ambil list user di auth
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailToId = new Map();
  for (const u of authData.users) {
    if (u.email) emailToId.set(u.email.toLowerCase().trim(), u.id);
  }

  let roleCount = 0;
  for (const req of (approvedReqs || [])) {
    const email = req.email?.toLowerCase().trim();
    const userId = emailToId.get(email) || req.requested_user_id;
    if (!userId) continue;

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "warga" }, { onConflict: "user_id, role" });

    if (!error) roleCount++;
  }

  console.log(`✅ Sukses memastikan ${roleCount} warga approved memiliki role 'warga'!`);
}

backfillRoles();
