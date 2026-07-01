const express = require("express");
const cors = require("cors");
const { env, getAllowedOrigins } = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/healthRoutes");
const createReservationRoutes = require("./routes/reservationRoutes");
const createReservationController = require("./controllers/reservationController");
const createReservationService = require("./services/reservationService");
const createFileReservationRepository = require("./repositories/fileReservationRepository");

function createApp() {
  const app = express();
  const reservationRepository = createFileReservationRepository(env.dataDir);
  const reservationService = createReservationService(reservationRepository);
  const reservationController = createReservationController(reservationService);

  app.use(cors({ origin: getAllowedOrigins() }));
  app.use(express.json());

  app.use("/api/health", healthRoutes);
  app.use("/api", createReservationRoutes(reservationController));

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
