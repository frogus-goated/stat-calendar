const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

async function main() {
  const prisma = new PrismaClient();
  const drops = [
    "ALTER TABLE models DROP COLUMN IF EXISTS min_sales_goal",
    "ALTER TABLE models DROP COLUMN IF EXISTS excellent_sales_goal",
    "ALTER TABLE models DROP COLUMN IF EXISTS ltv_goal",
    "ALTER TABLE app_settings DROP COLUMN IF EXISTS totals_min_sales_goal",
    "ALTER TABLE app_settings DROP COLUMN IF EXISTS totals_excellent_sales_goal",
    "ALTER TABLE app_settings DROP COLUMN IF EXISTS totals_ltv_goal",
  ];
  for (const sql of drops) {
    try { await prisma.$executeRawUnsafe(sql); console.log("OK:", sql); } catch (e) { console.log("Skip:", sql); }
  }
  await prisma.$disconnect();
  console.log("Old columns dropped. Running prisma db push...");
  execSync("npx prisma db push", { stdio: "inherit" });
}
main().catch(e => { console.error(e); process.exit(1); });
