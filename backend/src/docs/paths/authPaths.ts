import { errorResponse } from "../responses";

export const authPaths = {
  "/api/auth/restaurant/register": {
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
                $ref: "#/components/schemas/RestaurantAuthResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "409": errorResponse,
      },
    },
  },
  "/api/auth/restaurant/login": {
    post: {
      tags: ["Auth"],
      summary: "Login to a restaurant account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest",
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
                $ref: "#/components/schemas/RestaurantAuthResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "401": errorResponse,
      },
    },
  },
  "/api/auth/user/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a guest account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RegisterUserRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Guest account created successfully.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserAuthResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "409": errorResponse,
      },
    },
  },
  "/api/auth/user/login": {
    post: {
      tags: ["Auth"],
      summary: "Login to a guest account",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Guest login successful.",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserAuthResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "401": errorResponse,
      },
    },
  },
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register a restaurant account (legacy alias)",
      deprecated: true,
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
                $ref: "#/components/schemas/RestaurantAuthResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "409": errorResponse,
      },
    },
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login to a restaurant account (legacy alias)",
      deprecated: true,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest",
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
                $ref: "#/components/schemas/RestaurantAuthResponse",
              },
            },
          },
        },
        "400": errorResponse,
        "401": errorResponse,
      },
    },
  },
} as const;
