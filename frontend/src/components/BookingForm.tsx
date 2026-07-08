"use client";

import type { ChangeEvent, ReactNode, SubmitEvent } from "react";
import { useEffect, useState } from "react";
import {
  bookTable,
  checkAvailability,
  getRestaurants,
  getApiErrorMessage,
  type EventSpace,
  type Restaurant,
  type RestaurantTable,
  type Reservation,
  type ReservationPayload,
} from "@/lib/api";
import { indiaCities } from "@/lib/indiaCities";

const initialFormData: ReservationPayload = {
  city: "Mumbai",
  restaurantId: "",
  tableId: "",
  eventSpaceId: "",
  bookingType: "TABLE",
  tableCategory: "PUBLIC",
  eventSpaceCategory: "GENERAL_EVENT",
  date: "",
  time: "",
  endTime: "",
  guests: "",
  name: "",
  contact: "",
};

type StatusKind = "success" | "warning" | null;

export default function BookingForm() {
  const [formData, setFormData] = useState<ReservationPayload>(initialFormData);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availableTables, setAvailableTables] = useState<
    Pick<RestaurantTable, "id" | "name" | "category" | "capacity">[]
  >([]);
  const [availableEventSpaces, setAvailableEventSpaces] = useState<
    Pick<EventSpace, "id" | "name" | "category" | "capacity" | "price">[]
  >([]);
  const [bookingSummary, setBookingSummary] = useState<Reservation | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusKind, setStatusKind] = useState<StatusKind>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurants() {
      try {
        const cityRestaurants = await getRestaurants(formData.city, {
          bookingType: formData.bookingType,
          eventSpaceCategory: formData.eventSpaceCategory,
        });

        if (isMounted) {
          setRestaurants(cityRestaurants);
          setFormData((currentFormData) => ({
            ...currentFormData,
            restaurantId: cityRestaurants[0]?.id || "",
            tableId: "",
            eventSpaceId: "",
          }));
        }
      } catch {
        if (isMounted) {
          setRestaurants([]);
          setFormData((currentFormData) => ({
            ...currentFormData,
            restaurantId: "",
            tableId: "",
            eventSpaceId: "",
          }));
        }
      }
    }

    loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, [formData.city, formData.bookingType, formData.eventSpaceCategory]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const nextFormData = {
      ...formData,
      [event.target.name]: event.target.value,
    };

    if (
      ["restaurantId", "date", "time", "endTime", "guests", "tableCategory"].includes(
        event.target.name
      ) ||
      ["bookingType", "eventSpaceCategory"].includes(event.target.name)
    ) {
      nextFormData.tableId = "";
      nextFormData.eventSpaceId = "";
      setAvailableSlots([]);
      setAvailableTables([]);
      setAvailableEventSpaces([]);
    }

    setFormData(nextFormData);
  };

  const handleCheckAvailability = async () => {
    if (
      !formData.restaurantId ||
      !formData.date ||
      !formData.time ||
      !formData.guests ||
      (formData.bookingType === "EVENT_SPACE" && !formData.endTime)
    ) {
      setStatusMessage("Choose a city, restaurant, date, time, and guests first.");
      setStatusKind("warning");
      setAvailableSlots([]);
      setAvailableTables([]);
      return;
    }

    setIsChecking(true);
    try {
      const availability = await checkAvailability({
        restaurantId: formData.restaurantId,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        guests: formData.guests,
        tableCategory: formData.tableCategory,
        bookingType: formData.bookingType,
        eventSpaceCategory: formData.eventSpaceCategory,
      });

      if (availability.available) {
        setStatusMessage(
          formData.bookingType === "EVENT_SPACE"
            ? "Matching event spaces are available for this slot."
            : "Matching tables are available for this slot."
        );
        setStatusKind("success");
        setAvailableSlots(availability.slots);
        setAvailableTables(availability.tables);
        setAvailableEventSpaces(availability.eventSpaces);
        setFormData((currentFormData) => ({
          ...currentFormData,
          tableId: availability.tables[0]?.id || "",
          eventSpaceId: availability.eventSpaces[0]?.id || "",
        }));
      } else {
        setStatusMessage("No matching space is available for this guest count and time.");
        setStatusKind("warning");
        setAvailableSlots([]);
        setAvailableTables([]);
        setAvailableEventSpaces([]);
      }
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(
          error,
          "Error checking availability. Please try again."
        )
      );
      setStatusKind("warning");
    } finally {
      setIsChecking(false);
    }
  };

  const handleBooking = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsBooking(true);

    try {
      if (formData.bookingType === "EVENT_SPACE" && !formData.eventSpaceId) {
        setStatusMessage("Check availability and choose an available event space first.");
        setStatusKind("warning");
        return;
      }

      if (formData.bookingType !== "EVENT_SPACE" && !formData.tableId) {
        setStatusMessage("Check availability and choose an available table first.");
        setStatusKind("warning");
        return;
      }

      const reservation = await bookTable(formData);
      setBookingSummary(reservation);
      setStatusMessage("");
      setStatusKind(null);
      setAvailableSlots([]);
      setAvailableTables([]);
      setAvailableEventSpaces([]);
      setFormData(initialFormData);
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Error booking table. Please try again.")
      );
      setStatusKind("warning");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="w-full rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-[#6d4d2d]/12 backdrop-blur-xl sm:p-7">
      <div className="flex flex-col gap-3 border-b border-[#e6dac7] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a85d29]">
            New reservation
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#211b18]">
            Book a table
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f5b48]">
            Login is required to check availability and book. Guest accounts can
            track booking history from the dashboard.
          </p>
        </div>
        <div className="rounded-full border border-[#e0c8a8] bg-[#f4b563]/25 px-4 py-2 text-sm font-bold text-[#5f493a]">
          <span className="text-[#211b18]">Service:</span> Dinner
        </div>
      </div>

      <form onSubmit={handleBooking} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" htmlFor="city">
            <select
              id="city"
              aria-label="Select city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="booking-input"
            >
              {indiaCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Restaurant" htmlFor="restaurantId">
            <select
              id="restaurantId"
              aria-label="Select restaurant"
              name="restaurantId"
              value={formData.restaurantId}
              onChange={handleChange}
              required
              className="booking-input"
            >
              <option value="">
                {restaurants.length
                  ? "Select restaurant"
                  : formData.bookingType === "EVENT_SPACE"
                    ? "No restaurants with this event space"
                    : "No restaurants yet"}
              </option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} ({restaurant.openingTime}-{restaurant.closingTime})
                  {formData.bookingType === "EVENT_SPACE" &&
                  restaurant.eventSpaceCategories?.length
                    ? ` - ${restaurant.eventSpaceCategories
                        .map(formatEventSpaceCategory)
                        .join(", ")}`
                    : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Date" htmlFor="date">
            <input
              id="date"
              aria-label="Reservation date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="booking-input"
            />
          </Field>
          <Field label="Time" htmlFor="time">
            <input
              id="time"
              aria-label="Reservation time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="booking-input"
            />
          </Field>
          {formData.bookingType === "EVENT_SPACE" && (
            <Field label="End time" htmlFor="endTime">
              <input
                id="endTime"
                aria-label="Event end time"
                type="time"
                name="endTime"
                value={formData.endTime || ""}
                onChange={handleChange}
                required
                className="booking-input"
              />
            </Field>
          )}
          <Field label="Guests" htmlFor="guests">
            <input
              id="guests"
              aria-label="Number of guests"
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
              min="1"
              className="booking-input"
            />
          </Field>
        </div>

        <Field label="Booking type" htmlFor="bookingType">
          <select
            id="bookingType"
            aria-label="Select booking type"
            name="bookingType"
            value={formData.bookingType || "TABLE"}
            onChange={handleChange}
            className="booking-input"
          >
            <option value="TABLE">Table booking</option>
            <option value="EVENT_SPACE">Event space booking</option>
          </select>
        </Field>

        {formData.bookingType === "EVENT_SPACE" ? (
          <Field label="Event category" htmlFor="eventSpaceCategory">
            <select
              id="eventSpaceCategory"
              aria-label="Select event space category"
              name="eventSpaceCategory"
              value={formData.eventSpaceCategory || "GENERAL_EVENT"}
              onChange={handleChange}
              className="booking-input"
            >
              <option value="MARRIAGE">Marriage</option>
              <option value="BIRTHDAY_PARTY">Birthday party</option>
              <option value="RECEPTION">Reception</option>
              <option value="GENERAL_PARTY">General party</option>
              <option value="GENERAL_EVENT">General event</option>
            </select>
          </Field>
        ) : (
          <Field label="Table type" htmlFor="tableCategory">
          <select
            id="tableCategory"
            aria-label="Select table type"
            name="tableCategory"
            value={formData.tableCategory || "PUBLIC"}
            onChange={handleChange}
            className="booking-input"
          >
            <option value="PUBLIC">Public / open table</option>
            <option value="COUPLE">Couple table</option>
            <option value="FAMILY">Family table</option>
            <option value="SPECIAL">Special table</option>
          </select>
          </Field>
        )}

        {availableTables.length > 0 && formData.bookingType !== "EVENT_SPACE" && (
          <Field label="Available table" htmlFor="tableId">
            <select
              id="tableId"
              aria-label="Select available table"
              name="tableId"
              value={formData.tableId || ""}
              onChange={handleChange}
              required
              className="booking-input"
            >
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} - {formatTableCategory(table.category)} (
                  {table.capacity} seats)
                </option>
              ))}
            </select>
          </Field>
        )}

        {availableEventSpaces.length > 0 &&
          formData.bookingType === "EVENT_SPACE" && (
            <Field label="Available event space" htmlFor="eventSpaceId">
              <select
                id="eventSpaceId"
                aria-label="Select available event space"
                name="eventSpaceId"
                value={formData.eventSpaceId || ""}
                onChange={handleChange}
                required
                className="booking-input"
              >
                {availableEventSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name} - {formatEventSpaceCategory(space.category)} (
                    {space.capacity} guests)
                  </option>
                ))}
              </select>
            </Field>
          )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guest name" htmlFor="name">
            <input
              id="name"
              aria-label="Guest name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Aarav Mehta"
              className="booking-input"
            />
          </Field>
          <Field label="Contact number" htmlFor="contact">
            <input
              id="contact"
              aria-label="Contact number"
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              placeholder="+91 98765 43210"
              className="booking-input"
            />
          </Field>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={isChecking || isBooking}
            className="rounded-2xl border border-[#255647] bg-white/85 px-4 py-4 text-sm font-black text-[#255647] transition hover:-translate-y-0.5 hover:bg-[#edf6f2] disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-[#b8c9c1] disabled:text-[#8ca099]"
          >
            {isChecking ? "Checking..." : "Check Availability"}
          </button>
          <button
            type="submit"
            disabled={isBooking || isChecking}
            className="rounded-2xl bg-[#255647] px-4 py-4 text-sm font-black text-white shadow-lg shadow-[#255647]/25 transition hover:-translate-y-0.5 hover:bg-[#1f473c] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#92aaa1]"
          >
            {isBooking ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </form>

      {statusMessage && (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-bold ${
            statusKind === "success"
              ? "border-[#b7d7c2] bg-[#edf8f0] text-[#255647]"
              : "border-[#edd1aa] bg-[#fff5e5] text-[#81521f]"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {availableSlots.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#d9cbb7] bg-white/85 p-4">
          <h3 className="text-base font-bold text-[#211b18]">
            Available Slots
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableSlots.map((slot) => (
              <span
                key={slot}
                className="rounded-full bg-[#255647] px-3 py-2 text-sm font-black text-white"
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
      )}

      {bookingSummary && (
        <div className="mt-5 rounded-2xl border border-[#b7d7c2] bg-[#edf8f0] p-4">
          <h3 className="text-base font-bold text-[#255647]">
            Booking Confirmed
          </h3>
          <p className="mt-2 text-sm text-[#34423c]">
            Thank you, {bookingSummary.name}. Your reservation for{" "}
            <span className="font-semibold">{bookingSummary.guests}</span>{" "}
            guests on <span className="font-semibold">{bookingSummary.date}</span>{" "}
            at{" "}
            <span className="font-semibold">
              {bookingSummary.time}
              {bookingSummary.endTime ? `-${bookingSummary.endTime}` : ""}
            </span>{" "}
            is confirmed.
          </p>
        </div>
      )}
    </div>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-[#5f493a]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function formatTableCategory(category: RestaurantTable["category"]): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function formatEventSpaceCategory(category: EventSpace["category"]): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
