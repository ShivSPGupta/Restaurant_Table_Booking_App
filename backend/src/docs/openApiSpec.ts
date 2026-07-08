import { openApiComponents } from "./components";
import { authPaths } from "./paths/authPaths";
import { healthPaths } from "./paths/healthPaths";
import { reservationPaths } from "./paths/reservationPaths";
import { restaurantManagementPaths } from "./paths/restaurantManagementPaths";
import { restaurantPaths } from "./paths/restaurantPaths";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Restaurant Table Booking API",
    version: "1.0.0",
    description:
      "Role-based API for restaurant discovery, table booking, guest booking history, and restaurant-side reservation management.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local development",
    },
    {
      url: "https://restaurant-table-booking-app-back.vercel.app",
      description: "Production",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "Service health and runtime metadata.",
    },
    {
      name: "Auth",
      description: "Guest and restaurant account registration and login.",
    },
    {
      name: "Restaurants",
      description: "Public restaurant discovery.",
    },
    {
      name: "Reservations",
      description: "Authenticated availability checks, booking, and history.",
    },
    {
      name: "Restaurant Management",
      description: "Restaurant-only reservation, table, event space, and availability tools.",
    },
  ],
  paths: {
    ...healthPaths,
    ...restaurantPaths,
    ...authPaths,
    ...reservationPaths,
    ...restaurantManagementPaths,
  },
  components: openApiComponents,
} as const;

export default openApiSpec;
