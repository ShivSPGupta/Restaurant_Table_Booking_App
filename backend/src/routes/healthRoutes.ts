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

router.get("/db", async (_req, res, next) => {
  try {
    if (!env.databaseUrl) {
      res.json({
        ok: true,
        storage: "file",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const prisma = require("../lib/prisma").default;
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      ok: true,
      storage: "postgresql",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
