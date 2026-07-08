import { errorResponse, unauthorizedResponse } from "../responses";

export const restaurantManagementPaths = {
  "/api/restaurant/reservations": {
    get: {
      tags: ["Restaurant Management"],
      summary: "List reservations for the logged-in restaurant",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Restaurant reservations.",
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
        "403": errorResponse,
      },
    },
  },
  "/api/restaurant/reservations/{reservationId}": {
    patch: {
      tags: ["Restaurant Management"],
      summary: "Modify a restaurant reservation",
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
      tags: ["Restaurant Management"],
      summary: "Cancel a restaurant reservation",
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
  "/api/restaurant/tables": {
    get: {
      tags: ["Restaurant Management"],
      summary: "List restaurant tables",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Restaurant tables.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Table",
                },
              },
            },
          },
        },
        "401": unauthorizedResponse,
        "403": errorResponse,
      },
    },
    post: {
      tags: ["Restaurant Management"],
      summary: "Create a restaurant table",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TableRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Table created successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Table",
              },
            },
          },
        },
        "400": errorResponse,
        "401": unauthorizedResponse,
        "403": errorResponse,
        "409": errorResponse,
      },
    },
  },
  "/api/restaurant/tables/{tableId}": {
    patch: {
      tags: ["Restaurant Management"],
      summary: "Modify a restaurant table",
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/TableId" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TableRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Table updated successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Table",
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
  },
  "/api/restaurant/event-spaces": {
    get: {
      tags: ["Restaurant Management"],
      summary: "List restaurant event spaces",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Restaurant event spaces.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/EventSpace",
                },
              },
            },
          },
        },
        "401": unauthorizedResponse,
        "403": errorResponse,
      },
    },
    post: {
      tags: ["Restaurant Management"],
      summary: "Create a restaurant event space",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/EventSpaceRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Event space created successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EventSpace",
              },
            },
          },
        },
        "400": errorResponse,
        "401": unauthorizedResponse,
        "403": errorResponse,
      },
    },
  },
  "/api/restaurant/availability": {
    patch: {
      tags: ["Restaurant Management"],
      summary: "Update restaurant opening and closing time",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AvailabilitySettingsRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Restaurant availability updated successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Restaurant",
              },
            },
          },
        },
        "400": errorResponse,
        "401": unauthorizedResponse,
        "403": errorResponse,
        "404": errorResponse,
      },
    },
  },
} as const;
