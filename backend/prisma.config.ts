import "dotenv/config";
import { defineConfig } from "prisma/config";

const schemaCommandNames = new Set([
  "db:push",
  "db:migrate",
  "db:deploy",
  "db:studio",
]);
const isSchemaCommand = schemaCommandNames.has(
  process.env.npm_lifecycle_event || ""
);
const schemaDatabaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.MIGRATE_DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.POSTGRES_PRISMA_URL;
const runtimeDatabaseUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/restaurant_table_booking";
const databaseUrl = isSchemaCommand
  ? schemaDatabaseUrl || runtimeDatabaseUrl
  : runtimeDatabaseUrl;

const isTransactionPoolerUrl =
  databaseUrl.includes("pgbouncer=true") ||
  databaseUrl.includes("pooler.supabase.com:6543");

if (isSchemaCommand && isTransactionPoolerUrl) {
  throw new Error(
    "Prisma schema commands require POSTGRES_URL_NON_POOLING to use a non-transaction-pooler Supabase URL, such as the direct db.<project-ref>.supabase.co:5432 URL or the session pooler on port 5432. Do not use pgbouncer=true or port 6543 for db:push/migrations."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
