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

async function testRLS() {
  const userId = "04b48c43-b35f-4e2f-a7bc-b5c8184a5b2d"; // Zulhendy
  
  // Let's check user_roles RLS policies by querying pg_policies
  const { data: policies, error: polErr } = await supabaseAdmin
    .from("pg_policies")
    .select("*");
  console.log("pg_policies query:", polErr?.message || policies?.length);

  // Let's create an impersonated client with Zulhendy's auth token
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: "zulhendy@gmail.com"
  });
  console.log("Magiclink generation:", linkErr?.message || "success");

  // Let's check RLS by signing in with token or checking user_roles policies
  const { data: userRoles, error: userRolesErr } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  console.log("Admin user_roles:", userRoles, userRolesErr);
}

testRLS();
