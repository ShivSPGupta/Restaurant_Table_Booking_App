"use client";

import type { ChangeEvent, SubmitEvent } from "react";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getApiErrorMessage,
  loginRestaurant,
  loginUser,
  registerRestaurant,
  registerUser,
  type AuthResponse,
  type RestaurantAuthPayload,
} from "@/lib/api";
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  subscribeToAuthSessionChanges,
} from "@/lib/authSessionStore";
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

const accountOptions: Array<{
  type: AccountType;
  title: string;
  description: string;
}> = [
  {
    type: "restaurant",
    title: "Restaurant",
    description: "Manage bookings, tables, hours, and event spaces.",
  },
  {
    type: "user",
    title: "Guest",
    description: "Find restaurants by city and reserve your table.",
  },
];

const modeOptions: Array<{ mode: AuthMode; label: string }> = [
  { mode: "register", label: "Create account" },
  { mode: "login", label: "Sign in" },
];

export default function RestaurantAuthCard() {
  const [mode, setMode] = useState<AuthMode>("register");
  const [accountType, setAccountType] = useState<AccountType>("restaurant");
  const [formData, setFormData] =
    useState<RestaurantAuthPayload>(initialFormData);
  const authSession = useSyncExternalStore(
    subscribeToAuthSessionChanges,
    getStoredAuthSession,
    () => null
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProfile = authSession?.restaurant || authSession?.user;
  const activeRole =
    authSession?.role === "restaurant" ? "Restaurant owner" : "Guest user";

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    clearAuthSession();
    setStatusMessage("Signed out successfully.");
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
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

      saveAuthSession(response);
      setFormData(initialFormData);
      setStatusMessage(
        mode === "register"
          ? `${accountType === "restaurant" ? "Restaurant" : "Guest"} account created successfully.`
          : "Signed in successfully."
      );
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Authentication failed. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 text-[#211b18] shadow-2xl shadow-[#6d4d2d]/12 backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b6630]">
            Secure access
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            {authSession ? "Account active" : "Join the booking desk"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6f5b48]">
            {authSession
              ? "Your session is ready for booking and restaurant tools."
              : "Create an account or sign in with the role that matches your workflow."}
          </p>
        </div>

        {authSession && (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#d9c3a6] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#4a392d] transition hover:border-[#ba7b37] hover:bg-[#fff8ee]"
          >
            Logout
          </button>
        )}
      </div>

      {authSession && activeProfile ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#ead7bb] bg-white shadow-sm">
          <div className="bg-[#1f322a] px-4 py-3 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4b563]">
              {activeRole}
            </p>
            <p className="mt-1 text-lg font-black">{activeProfile.name}</p>
          </div>
          <div className="space-y-3 p-4 text-sm text-[#5c4a3a]">
            <p>{activeProfile.email}</p>
            <p className="break-all rounded-xl bg-[#f6ead8] px-3 py-2 text-xs">
              ID: {activeProfile.id}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[#dcf4df] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#255647]">
                Active session
              </span>
              {authSession.role === "restaurant" && (
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-full bg-[#1f322a] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#f4b563]"
                >
                  Open dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {accountOptions.map((option) => {
              const isActive = accountType === option.type;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleAccountTypeChange(option.type)}
                  className={`rounded-[1.35rem] border p-4 text-left transition ${
                    isActive
                      ? "border-[#255647] bg-[#1f322a] text-white shadow-lg shadow-[#1f322a]/20"
                      : "border-[#ead7bb] bg-white text-[#211b18] hover:border-[#ba7b37]"
                  }`}
                >
                  <span className="text-sm font-black">{option.title}</span>
                  <span
                    className={`mt-2 block text-xs leading-5 ${
                      isActive ? "text-white/70" : "text-[#7a6654]"
                    }`}
                  >
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-[#e0c8a8] bg-[#ead7bb]/70 p-1">
            {modeOptions.map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => handleModeChange(option.mode)}
                className={`rounded-full px-3 py-2 text-sm font-black transition ${
                  mode === option.mode
                    ? "bg-[#f4b563] text-[#211b18] shadow-sm"
                    : "text-[#6f5b48] hover:bg-white/60"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                  {accountType === "restaurant"
                    ? "Restaurant name"
                    : "Your name"}
                </span>
                <input
                  aria-label={
                    accountType === "restaurant" ? "Restaurant name" : "Your name"
                  }
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={
                    accountType === "restaurant" ? "The Green Fork" : "Asha"
                  }
                  className="auth-input"
                />
              </label>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                  Email
                </span>
                <input
                  aria-label="Email address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={
                    accountType === "restaurant"
                      ? "owner@restaurant.com"
                      : "you@example.com"
                  }
                  className="auth-input"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                  Password
                </span>
                <input
                  aria-label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="auth-input"
                />
              </label>
            </div>

            {mode === "register" && accountType === "restaurant" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                      Phone
                    </span>
                    <input
                      aria-label="Restaurant phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="auth-input"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                      City
                    </span>
                    <select
                      aria-label="Select restaurant city"
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
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                    Address
                  </span>
                  <input
                    aria-label="Restaurant address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="12 Market Street"
                    className="auth-input"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                      Opens
                    </span>
                    <input
                      aria-label="Restaurant opening time"
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#7a5230]">
                      Closes
                    </span>
                    <input
                      aria-label="Restaurant closing time"
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="auth-input"
                    />
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#f4b563] px-4 py-4 text-sm font-black text-[#211b18] shadow-lg shadow-[#9b6630]/20 transition hover:-translate-y-0.5 hover:bg-[#ffd18a] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#d8a76b]"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "register"
                  ? `Create ${accountType === "restaurant" ? "restaurant" : "guest"} account`
                  : `Sign in as ${accountType === "restaurant" ? "restaurant" : "guest"}`}
            </button>
          </form>
        </>
      )}

      {statusMessage && (
        <p className="mt-4 rounded-2xl border border-[#ead7bb] bg-white px-4 py-3 text-sm font-bold text-[#6f4b27]">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
