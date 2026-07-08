import { Router } from "express";
import type createReservationController from "../controllers/reservationController";
import { requireAuth } from "../middleware/requireRestaurantAuth";

type ReservationController = ReturnType<typeof createReservationController>;

function createReservationRoutes(reservationController: ReservationController) {
  const router = Router();

  router.use(requireAuth);
  router.get("/reservations", reservationController.listMyReservations);
  router.patch("/reservations/:reservationId", reservationController.updateMyReservation);
  router.delete("/reservations/:reservationId", reservationController.cancelMyReservation);
  router.post("/check-availability", reservationController.checkAvailability);
  router.post("/book-table", reservationController.createReservation);

  return router;
}

export default createReservationRoutes;
