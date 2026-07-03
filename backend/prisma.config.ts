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

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
