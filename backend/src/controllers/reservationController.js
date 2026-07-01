function createReservationController(reservationService) {
  function checkAvailability(req, res, next) {
    try {
      const availability = reservationService.checkAvailability(req.body);
      res.json(availability);
    } catch (error) {
      next(error);
    }
  }

  function createReservation(req, res, next) {
    try {
      const reservation = reservationService.createReservation(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  }

  return {
    checkAvailability,
    createReservation,
  };
}

module.exports = createReservationController;
