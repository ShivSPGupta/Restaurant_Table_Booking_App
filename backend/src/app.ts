import cors from "cors";
import express from "express";
import { env, getAllowedOrigins } from "./config/env";
import createAuthController from "./controllers/authController";
import createReservationController from "./controllers/reservationController";
import createRestaurantManagementController from "./controllers/restaurantManagementController";
import errorHandler from "./middleware/errorHandler";
import createRestaurantRepository from "./repositories/restaurantRepositoryFactory";
import createReservationRepository from "./repositories/reservationRepositoryFactory";
import createTableRepository from "./repositories/tableRepositoryFactory";
import createUserRepository from "./repositories/userRepositoryFactory";
import createAuthRoutes from "./routes/authRoutes";
import docsRoutes from "./routes/docsRoutes";
import healthRoutes from "./routes/healthRoutes";
import createReservationRoutes from "./routes/reservationRoutes";
import createRestaurantManagementRoutes from "./routes/restaurantManagementRoutes";
import createAuthService from "./services/authService";
import createReservationService from "./services/reservationService";
import createRestaurantManagementService from "./services/restaurantManagementService";

function createApp() {
  const app = express();
  const restaurantRepository = createRestaurantRepository();
  const userRepository = createUserRepository();
  const reservationRepository = createReservationRepository();
  const tableRepository = createTableRepository();
  const authService = createAuthService(restaurantRepository, userRepository);
  const reservationService = createReservationService(reservationRepository);
  const restaurantManagementService = createRestaurantManagementService(
    restaurantRepository,
    reservationRepository,
    tableRepository
  );
  const authController = createAuthController(authService);
  const reservationController = createReservationController(reservationService);
  const restaurantManagementController =
    createRestaurantManagementController(restaurantManagementService);

  app.use(cors({ origin: getAllowedOrigins() }));
  app.use(express.json());

  app.use("/api/health", healthRoutes);
  app.use("/api/docs", docsRoutes);
  app.use("/api/auth", createAuthRoutes(authController));
  app.use(
    "/api/restaurant",
    createRestaurantManagementRoutes(restaurantManagementController)
  );
  app.use("/api", createReservationRoutes(reservationController));

  app.use(errorHandler);

  return app;
}

export default createApp;
