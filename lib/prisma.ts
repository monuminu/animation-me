import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!

  // PrismaPg reads target schema from adapter options, not only from URL params.
  const schemaFromUrl = (() => {
    try {
      return new URL(connectionString).searchParams.get('schema')?.trim()
    } catch {
      return undefined
    }
  })()

  const schema = process.env.DATABASE_SCHEMA?.trim() || schemaFromUrl
  const adapter = new PrismaPg({ connectionString }, schema ? { schema } : undefined)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
