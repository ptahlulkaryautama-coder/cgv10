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

async function inspect() {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }

  console.log("=== PENGURUS & ZULHENDRY IN AUTH.USERS ===");
  const matched = authData.users.filter(u => 
    (u.email || "").toLowerCase().includes("zul") ||
    (u.email || "").toLowerCase().includes("doddy") ||
    (u.email || "").toLowerCase().includes("niko") ||
    (u.email || "").toLowerCase().includes("dharma")
  );

  for (const u of matched) {
    console.log(`\nEmail: ${u.email} | ID: ${u.id} | ConfirmedAt: ${u.email_confirmed_at} | LastSignIn: ${u.last_sign_in_at}`);
    const { data: prof } = await supabaseAdmin.from("profiles").select("*").eq("id", u.id).maybeSingle();
    console.log("  Profile:", prof);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("*").eq("user_id", u.id);
    console.log("  Roles:", roles);
  }
}

inspect();
