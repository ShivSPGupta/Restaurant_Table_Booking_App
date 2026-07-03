import { Router } from "express";
import { env } from "../config/env";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "restaurant-booking-api",
    environment: env.nodeEnv,
    storage: env.databaseUrl ? "postgresql" : "file",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
