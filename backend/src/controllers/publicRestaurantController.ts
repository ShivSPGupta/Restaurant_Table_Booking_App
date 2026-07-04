import type { RequestHandler } from "express";
import type { RestaurantRepository } from "../types/restaurant";

function createPublicRestaurantController(
  restaurantRepository: RestaurantRepository
) {
  const listRestaurants: RequestHandler = async (req, res, next) => {
    try {
      const city = typeof req.query.city === "string" ? req.query.city : undefined;
      const restaurants = await restaurantRepository.findPublic(city);
      res.json(restaurants);
    } catch (error) {
      next(error);
    }
  };

  return {
    listRestaurants,
  };
}

export default createPublicRestaurantController;
