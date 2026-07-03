"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import {
  getApiErrorMessage,
  loginRestaurant,
  registerRestaurant,
  type AuthResponse,
  type RestaurantAuthPayload,
} from "@/lib/api";

const initialFormData: RestaurantAuthPayload = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

type AuthMode = "register" | "login";

export default function RestaurantAuthCard() {
  const [mode, setMode] = useState<AuthMode>("register");
  const [formData, setFormData] =
    useState<RestaurantAuthPayload>(initialFormData);
  const [authSession, setAuthSession] = useState<AuthResponse | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedSession = window.localStorage.getItem("restaurant-auth-session");

    return storedSession ? (JSON.parse(storedSession) as AuthResponse) : null;
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStatusMessage("");
  };

  const handleLogout = () => {
    window.localStorage.removeItem("restaurant-auth-session");
    setAuthSession(null);
    setStatusMessage("Logged out from restaurant account.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const response =
        mode === "register"
          ? await registerRestaurant(formData)
          : await loginRestaurant(formData);

      window.localStorage.setItem(
        "restaurant-auth-session",
        JSON.stringify(response)
      );
      setAuthSession(response);
      setFormData(initialFormData);
      setStatusMessage(
        mode === "register"
          ? "Restaurant account created successfully."
          : "Logged in successfully."
      );
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Restaurant authentication failed.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f4d7a6]">
            Restaurant access
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Register or login as a restaurant owner for admin-ready booking
            workflows.
          </p>
        </div>
        {authSession && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/25 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/10"
          >
            Logout
          </button>
        )}
      </div>

      {authSession ? (
        <div className="mt-4 rounded-lg border border-[#f4b563]/30 bg-[#f4b563]/15 p-4">
          <p className="text-sm font-bold text-[#f4d7a6]">
            {authSession.restaurant.name}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {authSession.restaurant.email}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-black/15 p-1">
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-[#f4b563] text-[#211b18]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-[#f4b563] text-[#211b18]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === "register" && (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Restaurant name"
                className="auth-input"
              />
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="owner@restaurant.com"
              className="auth-input"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Password"
              className="auth-input"
            />
            {mode === "register" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="auth-input"
                />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="auth-input"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#f4b563] px-4 py-3 text-sm font-bold text-[#211b18] shadow-lg shadow-black/10 transition hover:bg-[#ffd18a] disabled:cursor-not-allowed disabled:bg-[#d8a76b]"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "register"
                  ? "Create restaurant account"
                  : "Login to restaurant"}
            </button>
          </form>
        </>
      )}

      {statusMessage && (
        <p className="mt-3 text-sm font-medium text-[#f4d7a6]">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
