import path from "path";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export type AppEnv = {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  corsOrigin: string;
  dataDir: string;
  databaseUrl?: string;
};

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const defaultCorsOrigin = isProduction
  ? "https://restaurant-table-booking-front.vercel.app"
  : "http://localhost:3000";

export const env: AppEnv = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || defaultCorsOrigin,
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "..", "data"),
  databaseUrl: process.env.DATABASE_URL,
};

export function getAllowedOrigins(): boolean | string[] {
  if (!env.corsOrigin || env.corsOrigin === "*") {
    return true;
  }

  return env.corsOrigin.split(",").map((origin) => origin.trim());
}
