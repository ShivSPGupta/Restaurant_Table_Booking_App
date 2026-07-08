export const errorResponse = {
  description: "Request failed.",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
} as const;

export const unauthorizedResponse = {
  description: "Login is required.",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
} as const;
