const { Router } = require("express");

function createReservationRoutes(reservationController) {
  const router = Router();

  router.post("/check-availability", reservationController.checkAvailability);
  router.post("/book-table", reservationController.createReservation);

  return router;
}

module.exports = createReservationRoutes;
