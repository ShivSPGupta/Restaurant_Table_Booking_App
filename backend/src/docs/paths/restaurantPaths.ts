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
