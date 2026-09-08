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
  envVars["SUPABASE_SERVICE_ROLE_KEY"]
);

async function run() {
  console.log("=== 1. Setting existing submissions (Kafe Kak Ayu & BEREMPAS) to approved ===");
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("palugada_listings")
    .update({
      status: "approved",
      seller_status: "online",
      seller_status_note: "Buka · Lapak aktif",
      published_at: new Date().toISOString(),
    })
    .in("name", ["Kafe Kak Ayu", "BEREMPAS (Bebek Rempah Pedas)"])
    .select("id, name, status, seller_status, published_at");

  console.log("Updated listings:", updated, "Error:", updateErr);
}

run();
