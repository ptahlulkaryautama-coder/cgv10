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

const supabase = createClient(
  envVars["NEXT_PUBLIC_SUPABASE_URL"],
  envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
);

async function simulateGate() {
  console.log("Simulating AdminAuthGate without session first...");
  const { data: noSession } = await supabase.auth.getSession();
  console.log("noSession:", noSession);

  // Let's test if anon can query profiles/user_roles for Zulhendry
  const userId = "04b48c43-b35f-4e2f-a7bc-b5c8184a5b2d";
  const [profRes, roleRes] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  console.log("Anon profile query:", profRes);
  console.log("Anon role query:", roleRes);
}

simulateGate();
