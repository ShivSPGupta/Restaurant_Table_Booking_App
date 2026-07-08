export const restaurantPaths = {
  "/api/restaurants": {
    get: {
      tags: ["Restaurants"],
      summary: "List public restaurants",
      parameters: [
        {
          name: "city",
          in: "query",
          required: false,
          schema: {
            type: "string",
            example: "Mumbai",
          },
          description: "Filter restaurants by city.",
        },
        {
          name: "bookingType",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["TABLE", "EVENT_SPACE"],
            example: "EVENT_SPACE",
          },
          description:
            "Use EVENT_SPACE to return only restaurants with active event spaces.",
        },
        {
          name: "eventSpaceCategory",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: [
              "MARRIAGE",
              "BIRTHDAY_PARTY",
              "RECEPTION",
              "GENERAL_PARTY",
              "GENERAL_EVENT",
            ],
            example: "MARRIAGE",
          },
          description:
            "Required when bookingType is EVENT_SPACE. Event-space discovery must use a specific category.",
        },
      ],
      responses: {
        "200": {
          description: "Available restaurants.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Restaurant",
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
