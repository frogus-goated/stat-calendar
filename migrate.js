const { execSync } = require("child_process");

// Drop old columns via raw SQL so prisma db push has no data loss warnings
const drops = [
  "ALTER TABLE models DROP COLUMN IF EXISTS min_sales_goal",
  "ALTER TABLE models DROP COLUMN IF EXISTS excellent_sales_goal", 
  "ALTER TABLE models DROP COLUMN IF EXISTS ltv_goal",
  "ALTER TABLE app_settings DROP COLUMN IF EXISTS totals_min_sales_goal",
  "ALTER TABLE app_settings DROP COLUMN IF EXISTS totals_excellent_sales_goal",
  "ALTER TABLE app_settings DROP COLUMN IF EXISTS totals_ltv_goal",
];

for (const sql of drops) {
  try {
    execSync(`npx prisma db execute --stdin <<< "${sql}"`, { stdio: "inherit", shell: "/bin/sh" });
  } catch (e) { /* ignore if column doesn't exist */ }
}

// Now db push with no data loss warnings
execSync("npx prisma db push", { stdio: "inherit" });
