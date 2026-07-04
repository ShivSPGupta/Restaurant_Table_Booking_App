import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";

function isSupabaseConnection(connectionString: string): boolean {
  return (
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com")
  );
}

function withoutSslMode(connectionString: string): string {
  const parsedUrl = new URL(connectionString);
  parsedUrl.searchParams.delete("sslmode");
  return parsedUrl.toString();
}

function createPoolConfig(connectionString: string): PoolConfig {
  if (!isSupabaseConnection(connectionString)) {
    return { connectionString };
  }

  const supabaseCaCert = process.env.SUPABASE_CA_CERT?.replace(/\\n/g, "\n");

  return {
    connectionString: withoutSslMode(connectionString),
    ssl: supabaseCaCert
      ? {
          ca: supabaseCaCert,
          rejectUnauthorized: true,
        }
      : {
          rejectUnauthorized: false,
        },
  };
}

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "POSTGRES_PRISMA_URL or DATABASE_URL is required to initialize Prisma."
  );
}

const adapter = new PrismaPg(new Pool(createPoolConfig(connectionString)));

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
