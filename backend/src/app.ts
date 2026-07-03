import cors from "cors";
import express from "express";
import { env, getAllowedOrigins } from "./config/env";
import createAuthController from "./controllers/authController";
import createReservationController from "./controllers/reservationController";
import errorHandler from "./middleware/errorHandler";
import createRestaurantRepository from "./repositories/restaurantRepositoryFactory";
import createReservationRepository from "./repositories/reservationRepositoryFactory";
import createAuthRoutes from "./routes/authRoutes";
import docsRoutes from "./routes/docsRoutes";
import healthRoutes from "./routes/healthRoutes";
import createReservationRoutes from "./routes/reservationRoutes";
import createAuthService from "./services/authService";
import createReservationService from "./services/reservationService";

function createApp() {
  const app = express();
  const restaurantRepository = createRestaurantRepository();
  const reservationRepository = createReservationRepository();
  const authService = createAuthService(restaurantRepository);
  const reservationService = createReservationService(reservationRepository);
  const authController = createAuthController(authService);
  const reservationController = createReservationController(reservationService);

  app.use(cors({ origin: getAllowedOrigins() }));
  app.use(express.json());

  app.use("/api/health", healthRoutes);
  app.use("/api/docs", docsRoutes);
  app.use("/api/auth", createAuthRoutes(authController));
  app.use("/api", createReservationRoutes(reservationController));

  app.use(errorHandler);

  return app;
}

export default createApp;
