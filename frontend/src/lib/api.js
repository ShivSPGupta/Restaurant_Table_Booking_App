import axios from "axios";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function checkAvailability({ date, time }) {
  const response = await apiClient.post("/api/check-availability", {
    date,
    time,
  });

  return response.data;
}

export async function bookTable(reservation) {
  const response = await apiClient.post("/api/book-table", reservation);
  return response.data;
}

export function getApiErrorMessage(error, fallbackMessage) {
  return error.response?.data?.error || fallbackMessage;
}
