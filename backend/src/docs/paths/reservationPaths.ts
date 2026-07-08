import { errorResponse, unauthorizedResponse } from "../responses";

export const reservationPaths = {
  "/api/reservations": {
    get: {
      tags: ["Reservations"],
      summary: "List reservations for the logged-in account",
      description:
        "Guest accounts receive their own booking history. Restaurant accounts receive reservations for their restaurant.",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Reservations visible to the logged-in account.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Reservation",
                },
              },
            },
          },
        },
        "401": unauthorizedResponse,
      },
    },
  },
  "/api/check-availability": {
    post: {
      tags: ["Reservations"],
      summary: "Check whether a restaurant slot is available",
      description:
        "Guests provide restaurantId. Restaurant accounts automatically check their own restaurant.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AvailabilityRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Availability result for the requested slot.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AvailabilityResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "401": unauthorizedResponse,
      },
    },
  },
  "/api/book-table": {
    post: {
      tags: ["Reservations"],
      summary: "Create a table reservation",
      description:
        "Guests book a selected restaurant. Restaurant accounts can create a booking for their own restaurant.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/BookingRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Reservation created successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Reservation",
              },
            },
          },
        },
        "400": errorResponse,
        "401": unauthorizedResponse,
        "409": errorResponse,
      },
    },
  },
} as const;
