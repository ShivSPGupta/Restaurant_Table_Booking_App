import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://postgres:postgres@localhost:5432/restaurant_table_booking";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
