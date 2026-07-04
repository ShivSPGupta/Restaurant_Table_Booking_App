import axios, { AxiosError } from "axios";

export type ReservationPayload = {
  city?: string;
  restaurantId?: string;
  tableId?: string;
  date: string;
  time: string;
  guests: string;
  name: string;
  contact: string;
};

export type Reservation = {
  id: string;
  restaurantId: string;
  userId?: string | null;
  tableId?: string | null;
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  createdAt: string;
};

export type RestaurantTable = {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
};

export type EventSpace = {
  id: string;
  restaurantId: string;
  name: string;
  occasion: string;
  capacity: number;
  price?: number | null;
  isActive: boolean;
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
  city?: string;
  openingTime?: string;
  closingTime?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city: string;
  openingTime: string;
  closingTime: string;
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
  restaurantId,
  date,
  time,
}: Pick<ReservationPayload, "restaurantId" | "date" | "time">): Promise<AvailabilityResponse> {
  const response = await apiClient.post<AvailabilityResponse>(
    "/api/check-availability",
    {
      restaurantId,
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

export async function getRestaurants(city?: string): Promise<Restaurant[]> {
  const response = await apiClient.get<Restaurant[]>("/api/restaurants", {
    params: city ? { city } : undefined,
  });
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

export async function getRestaurantReservations(): Promise<Reservation[]> {
  const response = await apiClient.get<Reservation[]>("/api/restaurant/reservations");
  return response.data;
}

export async function getMyReservations(): Promise<Reservation[]> {
  const response = await apiClient.get<Reservation[]>("/api/reservations");
  return response.data;
}

export async function updateRestaurantReservation(
  reservationId: string,
  payload: Partial<
    Pick<ReservationPayload, "tableId" | "date" | "time" | "guests" | "name" | "contact">
  >
): Promise<Reservation> {
  const response = await apiClient.patch<Reservation>(
    `/api/restaurant/reservations/${reservationId}`,
    payload
  );
  return response.data;
}

export async function cancelRestaurantReservation(
  reservationId: string
): Promise<void> {
  await apiClient.delete(`/api/restaurant/reservations/${reservationId}`);
}

export async function getRestaurantTables(): Promise<RestaurantTable[]> {
  const response = await apiClient.get<RestaurantTable[]>("/api/restaurant/tables");
  return response.data;
}

export async function createRestaurantTable(payload: {
  name: string;
  capacity: string;
}): Promise<RestaurantTable> {
  const response = await apiClient.post<RestaurantTable>(
    "/api/restaurant/tables",
    payload
  );
  return response.data;
}

export async function updateRestaurantTable(
  tableId: string,
  payload: {
    name?: string;
    capacity?: string;
    isActive?: boolean;
  }
): Promise<RestaurantTable> {
  const response = await apiClient.patch<RestaurantTable>(
    `/api/restaurant/tables/${tableId}`,
    payload
  );
  return response.data;
}

export async function getEventSpaces(): Promise<EventSpace[]> {
  const response = await apiClient.get<EventSpace[]>("/api/restaurant/event-spaces");
  return response.data;
}

export async function createEventSpace(payload: {
  name: string;
  occasion: string;
  capacity: string;
  price: string;
}): Promise<EventSpace> {
  const response = await apiClient.post<EventSpace>(
    "/api/restaurant/event-spaces",
    payload
  );
  return response.data;
}

export async function updateRestaurantAvailability(payload: {
  openingTime: string;
  closingTime: string;
}): Promise<Restaurant> {
  const response = await apiClient.patch<Restaurant>(
    "/api/restaurant/availability",
    payload
  );
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
