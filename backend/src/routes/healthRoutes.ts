import { Router } from "express";
import { env } from "../config/env";
import { getPrismaErrorDetails } from "../lib/prismaError";

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
    const [restaurants, reservations] = await Promise.all([
      prisma.restaurant.count(),
      prisma.reservation.count(),
    ]);

    res.json({
      ok: true,
      storage: "postgresql",
      checks: {
        connection: true,
        restaurantModel: true,
        reservationModel: true,
      },
      counts: {
        restaurants,
        reservations,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const prismaError = getPrismaErrorDetails(error);

    if (prismaError) {
      res.status(500).json({
        ok: false,
        storage: "postgresql",
        error: {
          code: prismaError.code,
          meta: prismaError.meta,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next(error);
  }
});

export default router;
