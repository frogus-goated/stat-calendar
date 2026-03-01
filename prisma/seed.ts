import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
const prisma = new PrismaClient();
const rand = (a: number, b: number) => Math.round((Math.random()*(b-a)+a)*100)/100;
const randI = (a: number, b: number) => Math.floor(Math.random()*(b-a+1))+a;
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function todayDubai() { const n=new Date(), u=n.getTime()+n.getTimezoneOffset()*60000, d=new Date(u+4*3600000); d.setHours(0,0,0,0); return d; }

async function main() {
  console.log("⚠️  Note: Seeding demo data only. Create your admin account by visiting the app.");
  await prisma.appSettings.deleteMany();
  await prisma.appSettings.create({ data: { id: uuid(), totalsMinSalesGoal: 3000, totalsExcellentSalesGoal: 6000, totalsLtvGoal: 45 } });
  console.log("✅ Created default settings. Visit the app to register your admin account.");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
