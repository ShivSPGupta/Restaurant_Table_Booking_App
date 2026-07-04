"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import {
  getApiErrorMessage,
  loginRestaurant,
  loginUser,
  registerRestaurant,
  registerUser,
  type AuthResponse,
  type RestaurantAuthPayload,
} from "@/lib/api";
import { indiaCities } from "@/lib/indiaCities";

const initialFormData: RestaurantAuthPayload = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "Mumbai",
  openingTime: "10:00",
  closingTime: "22:00",
};

type AuthMode = "register" | "login";
type AccountType = "restaurant" | "user";

export default function RestaurantAuthCard() {
  const [mode, setMode] = useState<AuthMode>("register");
  const [accountType, setAccountType] = useState<AccountType>("restaurant");
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStatusMessage("");
  };

  const handleAccountTypeChange = (nextAccountType: AccountType) => {
    setAccountType(nextAccountType);
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
          ? accountType === "restaurant"
            ? await registerRestaurant(formData)
            : await registerUser(formData)
          : accountType === "restaurant"
            ? await loginRestaurant(formData)
            : await loginUser(formData);

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
    <div className="rounded-2xl border border-white/15 bg-white/[0.13] p-4 shadow-xl shadow-black/10 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#f4d7a6]">
            Restaurant access
          </p>
          <p className="mt-1 text-sm leading-5 text-white/70">
            Login as a guest user or restaurant owner.
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
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#f4b563]/30 bg-[#f4b563]/15 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#f4d7a6]">
            {authSession.restaurant?.name || authSession.user?.name}
          </p>
            <p className="mt-1 text-sm text-white/70">
              {authSession.restaurant?.email || authSession.user?.email}
            </p>
            <p className="mt-2 break-all text-xs text-white/55">
              ID: {authSession.restaurant?.id || authSession.user?.id}
            </p>
          </div>
          <span className="rounded-full bg-[#f4b563] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#211b18]">
            Active
          </span>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-black/15 p-1">
            <button
              type="button"
              onClick={() => handleAccountTypeChange("restaurant")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                accountType === "restaurant"
                  ? "bg-white text-[#1f322a]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              Restaurant
            </button>
            <button
              type="button"
              onClick={() => handleAccountTypeChange("user")}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                accountType === "user"
                  ? "bg-white text-[#1f322a]"
                  : "text-white/70 hover:bg-white/10"
              }`}
            >
              User
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-black/15 p-1">
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
                placeholder={accountType === "restaurant" ? "Restaurant name" : "Your name"}
                className="auth-input"
              />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
            {mode === "register" && accountType === "restaurant" && (
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
            {mode === "register" && accountType === "restaurant" && (
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="auth-input"
              >
                {indiaCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
            {mode === "register" && accountType === "restaurant" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className="auth-input"
                />
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
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
                  ? `Create ${accountType} account`
                  : `Login as ${accountType}`}
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
