export const healthPaths = {
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
} as const;
