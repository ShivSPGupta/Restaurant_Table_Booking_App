import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function withRequiredSsl(connectionString: string): string {
  const isSupabaseUrl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com");

  if (!isSupabaseUrl || connectionString.includes("sslmode=")) {
    return connectionString;
  }

  const separator = connectionString.includes("?") ? "&" : "?";
  return `${connectionString}${separator}sslmode=require`;
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "POSTGRES_PRISMA_URL or DATABASE_URL is required to initialize Prisma."
  );
}

const adapter = new PrismaPg(new Pool({ connectionString: withRequiredSsl(connectionString) }));

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
