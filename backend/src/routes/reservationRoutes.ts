import { Router } from "express";
import type createReservationController from "../controllers/reservationController";
import requireRestaurantAuth from "../middleware/requireRestaurantAuth";

type ReservationController = ReturnType<typeof createReservationController>;

function createReservationRoutes(reservationController: ReservationController) {
  const router = Router();

  router.use(requireRestaurantAuth);
  router.post("/check-availability", reservationController.checkAvailability);
  router.post("/book-table", reservationController.createReservation);

  return router;
}

export default createReservationRoutes;
