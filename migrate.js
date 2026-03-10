const { spawnSync } = require("child_process");
const result = spawnSync("npx", ["prisma", "db", "push", "--accept-data-loss"], { stdio: "inherit" });
process.exit(result.status || 0);
