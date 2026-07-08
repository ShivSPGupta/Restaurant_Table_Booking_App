import type { RequestHandler } from "express";
import type { EventSpaceCategory, EventSpaceRepository } from "../types/eventSpace";
import type { RestaurantRepository } from "../types/restaurant";

function createPublicRestaurantController(
  restaurantRepository: RestaurantRepository,
  eventSpaceRepository: EventSpaceRepository
) {
  const listRestaurants: RequestHandler = async (req, res, next) => {
    try {
      const city = typeof req.query.city === "string" ? req.query.city : undefined;
      const bookingType =
        typeof req.query.bookingType === "string"
          ? req.query.bookingType
          : undefined;
      const eventSpaceCategory =
        typeof req.query.eventSpaceCategory === "string"
          ? (req.query.eventSpaceCategory as EventSpaceCategory)
          : undefined;
      const restaurants = await restaurantRepository.findPublic(city);

      if (bookingType !== "EVENT_SPACE") {
        res.json(restaurants);
        return;
      }

      if (!eventSpaceCategory) {
        res.status(400).json({
          error: "Select a specific event space category.",
        });
        return;
      }

      const restaurantsWithEventSpaces = await Promise.all(
        restaurants.map(async (restaurant) => {
          const eventSpaces = await eventSpaceRepository.findByRestaurantId(
            restaurant.id
          );
          const activeCategories = Array.from(
            new Set(
              eventSpaces
                .filter((space) => space.isActive)
                .map((space) => space.category)
            )
          );

          return {
            ...restaurant,
            eventSpaceCategories: activeCategories,
          };
        })
      );
      const filteredRestaurants = restaurantsWithEventSpaces.filter(
        (restaurant) =>
          restaurant.eventSpaceCategories.length > 0 &&
          restaurant.eventSpaceCategories.includes(eventSpaceCategory)
      );

      res.json(filteredRestaurants);
    } catch (error) {
      next(error);
    }
  };

  return {
    listRestaurants,
  };
}

export default createPublicRestaurantController;
