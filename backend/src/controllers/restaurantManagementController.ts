import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middleware/requireRestaurantAuth";
import type createRestaurantManagementService from "../services/restaurantManagementService";

type RestaurantManagementService = ReturnType<
  typeof createRestaurantManagementService
>;

function createRestaurantManagementController(
  restaurantManagementService: RestaurantManagementService
) {
  const listReservations: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const reservations = await restaurantManagementService.listReservations(
        restaurantId as string
      );
      res.json(reservations);
    } catch (error) {
      next(error);
    }
  };

  const listTables: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const tables = await restaurantManagementService.listTables(
        restaurantId as string
      );
      res.json(tables);
    } catch (error) {
      next(error);
    }
  };

  const createTable: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const table = await restaurantManagementService.createTable(
        restaurantId as string,
        req.body
      );
      res.status(201).json(table);
    } catch (error) {
      next(error);
    }
  };

  const updateTable: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const table = await restaurantManagementService.updateTable(
        restaurantId as string,
        req.params.tableId as string,
        req.body
      );
      res.json(table);
    } catch (error) {
      next(error);
    }
  };

  const updateAvailability: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const restaurant = await restaurantManagementService.updateAvailability(
        restaurantId as string,
        req.body
      );
      res.json(restaurant);
    } catch (error) {
      next(error);
    }
  };

  return {
    listReservations,
    listTables,
    createTable,
    updateTable,
    updateAvailability,
  };
}

export default createRestaurantManagementController;
