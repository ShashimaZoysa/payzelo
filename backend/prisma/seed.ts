import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // TRIAL plan - 14 days free
  await prisma.plan.upsert({
    where: { name: "TRIAL" },
    update: {},
    create: {
      name: "TRIAL",
      price: 0,
      trialDays: 14,
    },
  })

  // PRO plan - Rs. 1500/month
  await prisma.plan.upsert({
    where: { name: "PRO" },
    update: {},
    create: {
      name: "PRO",
      price: 1500,
      trialDays: 0,
    },
  })

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })