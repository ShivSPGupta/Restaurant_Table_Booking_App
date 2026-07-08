export const openApiComponents = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  parameters: {
    ReservationId: {
      name: "reservationId",
      in: "path",
      required: true,
      schema: {
        type: "string",
      },
    },
    TableId: {
      name: "tableId",
      in: "path",
      required: true,
      schema: {
        type: "string",
      },
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
    RegisterRestaurantRequest: {
      type: "object",
      required: ["name", "city", "email", "password"],
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
          nullable: true,
          example: "+91 98765 43210",
        },
        address: {
          type: "string",
          nullable: true,
          example: "12 Market Street",
        },
        city: {
          type: "string",
          example: "Mumbai",
        },
        openingTime: {
          type: "string",
          example: "10:00",
        },
        closingTime: {
          type: "string",
          example: "22:00",
        },
      },
    },
    RegisterUserRequest: {
      type: "object",
      required: ["name", "email", "password"],
      properties: {
        name: {
          type: "string",
          example: "Asha Sharma",
        },
        email: {
          type: "string",
          format: "email",
          example: "asha@example.com",
        },
        password: {
          type: "string",
          minLength: 8,
          example: "securepass123",
        },
        phone: {
          type: "string",
          nullable: true,
          example: "9999999999",
        },
      },
    },
    LoginRequest: {
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
      required: [
        "id",
        "name",
        "email",
        "city",
        "openingTime",
        "closingTime",
        "createdAt",
      ],
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
        city: {
          type: "string",
          example: "Mumbai",
        },
        openingTime: {
          type: "string",
          example: "10:00",
        },
        closingTime: {
          type: "string",
          example: "22:00",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2026-07-15T12:00:00.000Z",
        },
      },
    },
    User: {
      type: "object",
      required: ["id", "name", "email", "createdAt"],
      properties: {
        id: {
          type: "string",
          example: "clx7bq7cm0000x8q2v9p4z2m1",
        },
        name: {
          type: "string",
          example: "Asha Sharma",
        },
        email: {
          type: "string",
          format: "email",
          example: "asha@example.com",
        },
        phone: {
          type: "string",
          nullable: true,
          example: "9999999999",
        },
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2026-07-15T12:00:00.000Z",
        },
      },
    },
    RestaurantAuthResponse: {
      type: "object",
      required: ["token", "role", "restaurant"],
      properties: {
        token: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        role: {
          type: "string",
          enum: ["restaurant"],
        },
        restaurant: {
          $ref: "#/components/schemas/Restaurant",
        },
      },
    },
    UserAuthResponse: {
      type: "object",
      required: ["token", "role", "user"],
      properties: {
        token: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        role: {
          type: "string",
          enum: ["user"],
        },
        user: {
          $ref: "#/components/schemas/User",
        },
      },
    },
    AvailabilityRequest: {
      type: "object",
      required: ["date", "time", "guests"],
      properties: {
        restaurantId: {
          type: "string",
          description: "Required for guest accounts. Ignored for restaurant accounts.",
          example: "clx7bp2dn0000q8q2p5w2x9m7",
        },
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
        tableCategory: {
          type: "string",
          enum: ["ANY", "PUBLIC", "COUPLE", "FAMILY", "SPECIAL"],
          example: "FAMILY",
        },
      },
    },
    AvailabilityResponse: {
      type: "object",
      required: ["available", "slots", "tables"],
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
        tables: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name", "category", "capacity"],
            properties: {
              id: {
                type: "string",
                example: "clx7bp2dn0000q8q2p5w2x9t1",
              },
              name: {
                type: "string",
                example: "Window Table 1",
              },
              category: {
                type: "string",
                enum: ["PUBLIC", "COUPLE", "FAMILY", "SPECIAL"],
                example: "FAMILY",
              },
              capacity: {
                type: "integer",
                example: 4,
              },
            },
          },
        },
      },
    },
    BookingRequest: {
      type: "object",
      required: ["tableId", "date", "time", "guests", "name", "contact"],
      properties: {
        restaurantId: {
          type: "string",
          description: "Required for guest accounts. Ignored for restaurant accounts.",
          example: "clx7bp2dn0000q8q2p5w2x9m7",
        },
        tableId: {
          type: "string",
          example: "clx7bp2dn0000q8q2p5w2x9t1",
        },
        tableCategory: {
          type: "string",
          enum: ["ANY", "PUBLIC", "COUPLE", "FAMILY", "SPECIAL"],
          example: "FAMILY",
        },
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
    UpdateReservationRequest: {
      type: "object",
      properties: {
        tableId: {
          type: "string",
          nullable: true,
        },
        date: {
          type: "string",
          format: "date",
          example: "2026-07-16",
        },
        time: {
          type: "string",
          example: "20:00",
        },
        guests: {
          type: "integer",
          minimum: 1,
          example: 5,
        },
        name: {
          type: "string",
          example: "Asha Sharma",
        },
        contact: {
          type: "string",
          example: "9999999999",
        },
      },
    },
    Reservation: {
      type: "object",
      required: [
        "id",
        "restaurantId",
        "date",
        "time",
        "guests",
        "name",
        "contact",
        "createdAt",
      ],
      properties: {
        id: {
          type: "string",
          example: "clx7bq7cm0000x8q2v9p4z2m1",
        },
        restaurantId: {
          type: "string",
          example: "clx7bp2dn0000q8q2p5w2x9m7",
        },
        userId: {
          type: "string",
          nullable: true,
          example: "clx7bp2dn0000q8q2p5w2x9u9",
        },
        tableId: {
          type: "string",
          nullable: true,
          example: "clx7bp2dn0000q8q2p5w2x9t1",
        },
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
        createdAt: {
          type: "string",
          format: "date-time",
          example: "2026-07-15T12:00:00.000Z",
        },
      },
    },
    TableRequest: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Window Table 1",
        },
        category: {
          type: "string",
          enum: ["PUBLIC", "COUPLE", "FAMILY", "SPECIAL"],
          example: "FAMILY",
        },
        capacity: {
          type: "integer",
          minimum: 1,
          example: 4,
        },
        isActive: {
          type: "boolean",
          example: true,
        },
      },
    },
    Table: {
      allOf: [
        {
          $ref: "#/components/schemas/TableRequest",
        },
        {
          type: "object",
          required: [
            "id",
            "restaurantId",
            "name",
            "category",
            "capacity",
            "isActive",
            "createdAt",
          ],
          properties: {
            id: {
              type: "string",
              example: "clx7bp2dn0000q8q2p5w2x9t1",
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
    EventSpaceRequest: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Birthday Lounge",
        },
        occasion: {
          type: "string",
          example: "Birthday",
        },
        capacity: {
          type: "integer",
          minimum: 1,
          example: 20,
        },
        price: {
          type: "integer",
          nullable: true,
          minimum: 0,
          example: 2500,
        },
        isActive: {
          type: "boolean",
          example: true,
        },
      },
    },
    EventSpace: {
      allOf: [
        {
          $ref: "#/components/schemas/EventSpaceRequest",
        },
        {
          type: "object",
          required: [
            "id",
            "restaurantId",
            "name",
            "occasion",
            "capacity",
            "isActive",
            "createdAt",
          ],
          properties: {
            id: {
              type: "string",
              example: "clx7bp2dn0000q8q2p5w2x9e1",
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
    AvailabilitySettingsRequest: {
      type: "object",
      required: ["openingTime", "closingTime"],
      properties: {
        openingTime: {
          type: "string",
          example: "10:00",
        },
        closingTime: {
          type: "string",
          example: "22:00",
        },
      },
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
} as const;
