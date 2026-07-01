import axios, { AxiosError } from "axios";

export type ReservationPayload = {
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
