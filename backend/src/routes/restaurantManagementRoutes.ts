import { Router } from "express";
import type createRestaurantManagementController from "../controllers/restaurantManagementController";
import requireRestaurantAuth from "../middleware/requireRestaurantAuth";

type RestaurantManagementController = ReturnType<
  typeof createRestaurantManagementController
>;

function createRestaurantManagementRoutes(
  restaurantManagementController: RestaurantManagementController
) {
  const router = Router();

  router.use(requireRestaurantAuth);
  router.get("/reservations", restaurantManagementController.listReservations);
  router.patch(
    "/reservations/:reservationId",
    restaurantManagementController.updateReservation
  );
  router.delete(
    "/reservations/:reservationId",
    restaurantManagementController.cancelReservation
  );
  router.get("/tables", restaurantManagementController.listTables);
  router.post("/tables", restaurantManagementController.createTable);
  router.patch("/tables/:tableId", restaurantManagementController.updateTable);
  router.get("/event-spaces", restaurantManagementController.listEventSpaces);
  router.post("/event-spaces", restaurantManagementController.createEventSpace);
  router.patch("/availability", restaurantManagementController.updateAvailability);

  return router;
}

export default createRestaurantManagementRoutes;
