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
  const { data: listings } = await supabaseAdmin.from("palugada_listings").select("*").limit(2);
  console.log("=== LISTING COLUMNS ===");
  if (listings && listings[0]) {
    console.log(Object.keys(listings[0]));
    console.log("Sample listing 0:", listings[0]);
  }
}

run();
