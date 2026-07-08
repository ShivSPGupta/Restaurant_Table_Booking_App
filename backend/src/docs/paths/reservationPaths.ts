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
  "/api/reservations/{reservationId}": {
    patch: {
      tags: ["Reservations"],
      summary: "Modify a logged-in user's reservation",
      description:
        "Users can modify only reservations linked to their own account.",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ReservationId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateReservationRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Reservation updated successfully.",
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
        "403": errorResponse,
        "404": errorResponse,
        "409": errorResponse,
      },
    },
    delete: {
      tags: ["Reservations"],
      summary: "Cancel a logged-in user's reservation",
      description:
        "Users can cancel only reservations linked to their own account.",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/ReservationId" }],
      responses: {
        "204": {
          description: "Reservation cancelled successfully.",
        },
        "401": unauthorizedResponse,
        "403": errorResponse,
        "404": errorResponse,
      },
    },
  },
  "/api/check-availability": {
    post: {
      tags: ["Reservations"],
      summary: "Check whether a restaurant slot is available",
      description:
        "Guests provide restaurantId, guest count, booking type, and optional table/event-space category. Event-space availability also requires an endTime and checks overlapping time ranges. Restaurant accounts automatically check their own restaurant. The response includes active matching tables or event spaces that can seat the party and are not booked for the requested time.",
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
        "Guests book a selected restaurant with either an available table or event space. Event-space bookings require start and end time and block overlapping reservations. Restaurant accounts can create a booking for their own restaurant. If a category is provided, the selected table or event space must match it.",
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
