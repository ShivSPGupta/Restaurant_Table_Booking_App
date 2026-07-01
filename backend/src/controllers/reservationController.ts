import type { RequestHandler } from "express";
import type createReservationService from "../services/reservationService";

type ReservationService = ReturnType<typeof createReservationService>;

function createReservationController(reservationService: ReservationService) {
  const checkAvailability: RequestHandler = (req, res, next) => {
    try {
      const availability = reservationService.checkAvailability(req.body);
      res.json(availability);
    } catch (error) {
      next(error);
    }
  };

  const createReservation: RequestHandler = (req, res, next) => {
    try {
      const reservation = reservationService.createReservation(req.body);
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  };

  return {
    checkAvailability,
    createReservation,
  };
}

export default createReservationController;
