import axios, { AxiosError } from "axios";

export type ReservationPayload = {
  restaurantId?: string;
  date: string;
  time: string;
  guests: string;
  name: string;
  contact: string;
};

export type Reservation = {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  createdAt: string;
};

export type AvailabilityResponse = {
  available: boolean;
  slots: string[];
};

export type RestaurantAuthPayload = {
  name?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  role: "restaurant" | "user";
  restaurant?: Restaurant;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    createdAt: string;
  };
};

type ApiErrorResponse = {
  error?: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const storedSession = window.localStorage.getItem("restaurant-auth-session");

  if (!storedSession) {
    return config;
  }

  const session = JSON.parse(storedSession) as AuthResponse;

  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export async function checkAvailability({
  date,
  time,
}: Pick<ReservationPayload, "date" | "time">): Promise<AvailabilityResponse> {
  const response = await apiClient.post<AvailabilityResponse>(
    "/api/check-availability",
    {
      date,
      time,
    }
  );

  return response.data;
}

export async function bookTable(
  reservation: ReservationPayload
): Promise<Reservation> {
  const response = await apiClient.post<Reservation>(
    "/api/book-table",
    reservation
  );
  return response.data;
}

export async function registerRestaurant(
  restaurant: RestaurantAuthPayload
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    restaurant
  );
  return response.data;
}

export async function registerUser(
  user: RestaurantAuthPayload
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/auth/user/register", user);
  return response.data;
}

export async function loginRestaurant({
  email,
  password,
}: RestaurantAuthPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

export async function loginUser({
  email,
  password,
}: RestaurantAuthPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/auth/user/login", {
    email,
    password,
  });
  return response.data;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return `Cannot reach booking API at ${apiBaseUrl}. Make sure the backend is running and CORS allows this frontend port.`;
    }

    return (
      (error.response.data as ApiErrorResponse | undefined)?.error ||
      fallbackMessage
    );
  }

  return fallbackMessage;
}
