const { execSync } = require("child_process");
try {
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
} catch (e) {
  console.log("Migration warning (continuing):", e.message);
}
