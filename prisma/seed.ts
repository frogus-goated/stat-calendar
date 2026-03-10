import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("Note: Create your admin account by visiting the app.");
  await prisma.appSettings.deleteMany();
  await prisma.appSettings.create({ data: { totalsSalesGoal: 3000, totalsMinLtvGoal: 30, totalsExcellentLtvGoal: 50 } });
  console.log("Created default settings.");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
