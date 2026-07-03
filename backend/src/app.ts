import cors from "cors";
import express from "express";
import { env, getAllowedOrigins } from "./config/env";
import createReservationController from "./controllers/reservationController";
import errorHandler from "./middleware/errorHandler";
import createReservationRepository from "./repositories/reservationRepositoryFactory";
import healthRoutes from "./routes/healthRoutes";
import createReservationRoutes from "./routes/reservationRoutes";
import createReservationService from "./services/reservationService";

function createApp() {
  const app = express();
  const reservationRepository = createReservationRepository();
  const reservationService = createReservationService(reservationRepository);
  const reservationController = createReservationController(reservationService);

  app.use(cors({ origin: getAllowedOrigins() }));
  app.use(express.json());

  app.use("/api/health", healthRoutes);
  app.use("/api", createReservationRoutes(reservationController));

  app.use(errorHandler);

  return app;
}

export default createApp;
