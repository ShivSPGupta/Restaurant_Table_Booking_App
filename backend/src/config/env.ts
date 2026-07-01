import path from "path";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export type AppEnv = {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
  dataDir: string;
};

export const env: AppEnv = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3001,
  corsOrigin:
    process.env.CORS_ORIGIN ||
    "http://localhost:3000",
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "..", "data"),
};

export function getAllowedOrigins(): boolean | string[] {
  if (!env.corsOrigin || env.corsOrigin === "*") {
    return true;
  }

  return env.corsOrigin.split(",").map((origin) => origin.trim());
}
