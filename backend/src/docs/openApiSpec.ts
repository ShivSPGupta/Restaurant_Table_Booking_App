const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Restaurant Table Booking API",
    version: "1.0.0",
    description:
      "API documentation for checking table availability and creating restaurant reservations.",
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
      name: "Reservations",
      description: "Availability checks and table booking.",
    },
    {
      name: "Auth",
      description: "Restaurant account registration and login.",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": {
            description: "The API is running.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a restaurant account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRestaurantRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Restaurant account created successfully.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid registration request.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "A restaurant account already exists for this email.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login to a restaurant account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRestaurantRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Restaurant login successful.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid login request.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Invalid email or password.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/check-availability": {
      post: {
        tags: ["Reservations"],
        summary: "Check whether a date and time are available",
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
          "400": {
            description: "Invalid availability request.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Restaurant login is required.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/book-table": {
      post: {
        tags: ["Reservations"],
        summary: "Create a table reservation",
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
          "400": {
            description: "Invalid booking request.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "Restaurant login is required.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "The requested time slot is already booked.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["ok", "service", "environment", "storage", "uptime", "timestamp"],
        properties: {
          ok: {
            type: "boolean",
            example: true,
          },
          service: {
            type: "string",
            example: "restaurant-booking-api",
          },
          environment: {
            type: "string",
            example: "development",
          },
          storage: {
            type: "string",
            enum: ["file", "postgresql"],
            example: "postgresql",
          },
          uptime: {
            type: "number",
            example: 42.31,
          },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-07-15T12:00:00.000Z",
          },
        },
      },
      AvailabilityRequest: {
        type: "object",
        required: ["date", "time"],
        properties: {
          date: {
            type: "string",
            format: "date",
            example: "2026-07-15",
          },
          time: {
            type: "string",
            example: "19:00",
          },
        },
      },
      AvailabilityResponse: {
        type: "object",
        required: ["available", "slots"],
        properties: {
          available: {
            type: "boolean",
            example: true,
          },
          slots: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["19:00"],
          },
        },
      },
      RegisterRestaurantRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            example: "The Green Fork",
          },
          email: {
            type: "string",
            format: "email",
            example: "owner@greenfork.com",
          },
          password: {
            type: "string",
            minLength: 8,
            example: "securepass123",
          },
          phone: {
            type: "string",
            example: "+91 98765 43210",
          },
          address: {
            type: "string",
            example: "12 Market Street",
          },
        },
      },
      LoginRestaurantRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "owner@greenfork.com",
          },
          password: {
            type: "string",
            example: "securepass123",
          },
        },
      },
      Restaurant: {
        type: "object",
        required: ["id", "name", "email", "createdAt"],
        properties: {
          id: {
            type: "string",
            example: "clx7bq7cm0000x8q2v9p4z2m1",
          },
          name: {
            type: "string",
            example: "The Green Fork",
          },
          email: {
            type: "string",
            format: "email",
            example: "owner@greenfork.com",
          },
          phone: {
            type: "string",
            nullable: true,
            example: "+91 98765 43210",
          },
          address: {
            type: "string",
            nullable: true,
            example: "12 Market Street",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-07-15T12:00:00.000Z",
          },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["token", "restaurant"],
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          restaurant: {
            $ref: "#/components/schemas/Restaurant",
          },
        },
      },
      BookingRequest: {
        type: "object",
        required: ["date", "time", "guests", "name", "contact"],
        properties: {
          date: {
            type: "string",
            format: "date",
            example: "2026-07-15",
          },
          time: {
            type: "string",
            example: "19:00",
          },
          guests: {
            type: "integer",
            minimum: 1,
            example: 4,
          },
          name: {
            type: "string",
            example: "Asha",
          },
          contact: {
            type: "string",
            example: "9999999999",
          },
        },
      },
      Reservation: {
        allOf: [
          {
            $ref: "#/components/schemas/BookingRequest",
          },
          {
            type: "object",
            required: ["id", "createdAt"],
            properties: {
              id: {
                type: "string",
                example: "clx7bq7cm0000x8q2v9p4z2m1",
              },
              restaurantId: {
                type: "string",
                example: "clx7bp2dn0000q8q2p5w2x9m7",
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2026-07-15T12:00:00.000Z",
              },
            },
          },
        ],
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "string",
            example: "This time slot is already booked.",
          },
        },
      },
    },
  },
} as const;

export default openApiSpec;
