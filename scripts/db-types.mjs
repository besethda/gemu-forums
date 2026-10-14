// Regenerates lib/supabase/database.types.ts from the live Supabase schema.
// Needs SUPABASE_PROJECT_ID in .env.local and a one-time `npx supabase login`.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const projectId = process.env.SUPABASE_PROJECT_ID;
if (!projectId) {
  console.error("Set SUPABASE_PROJECT_ID in .env.local (the subdomain of your Supabase URL).");
  process.exit(1);
}

const types = execFileSync(
  "npx",
  ["--yes", "supabase", "gen", "types", "typescript", "--project-id", projectId, "--schema", "public"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
writeFileSync("lib/supabase/database.types.ts", types);
console.log("Wrote lib/supabase/database.types.ts");
