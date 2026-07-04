"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  createEventSpace,
  createRestaurantTable,
  getApiErrorMessage,
  getEventSpaces,
  getRestaurantReservations,
  getRestaurantTables,
  updateRestaurantAvailability,
  type AuthResponse,
  type EventSpace,
  type Reservation,
  type RestaurantTable,
} from "@/lib/api";

const initialTableForm = {
  name: "",
  capacity: "",
};

const initialSpaceForm = {
  name: "",
  occasion: "Birthday",
  capacity: "",
  price: "",
};

const initialHoursForm = {
  openingTime: "10:00",
  closingTime: "22:00",
};

export default function RestaurantManagementPanel() {
  const [authSession, setAuthSession] = useState<AuthResponse | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedSession = window.localStorage.getItem("restaurant-auth-session");
    return storedSession ? (JSON.parse(storedSession) as AuthResponse) : null;
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [spaces, setSpaces] = useState<EventSpace[]>([]);
  const [tableForm, setTableForm] = useState(initialTableForm);
  const [spaceForm, setSpaceForm] = useState(initialSpaceForm);
  const [hoursForm, setHoursForm] = useState(() => {
    if (typeof window === "undefined") {
      return initialHoursForm;
    }

    const storedSession = window.localStorage.getItem("restaurant-auth-session");

    if (!storedSession) {
      return initialHoursForm;
    }

    const session = JSON.parse(storedSession) as AuthResponse;
    return {
      openingTime: session.restaurant?.openingTime || "10:00",
      closingTime: session.restaurant?.closingTime || "22:00",
    };
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadManagementData() {
    setIsLoading(true);
    try {
      const [reservationData, tableData, spaceData] = await Promise.all([
        getRestaurantReservations(),
        getRestaurantTables(),
        getEventSpaces(),
      ]);
      setReservations(reservationData);
      setTables(tableData);
      setSpaces(spaceData);
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Unable to load restaurant dashboard.")
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (authSession?.role !== "restaurant") {
    return null;
  }

  const handleTableChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTableForm({ ...tableForm, [event.target.name]: event.target.value });
  };

  const handleSpaceChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSpaceForm({ ...spaceForm, [event.target.name]: event.target.value });
  };

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHoursForm({ ...hoursForm, [event.target.name]: event.target.value });
  };

  const handleCreateTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createRestaurantTable(tableForm);
      setTableForm(initialTableForm);
      setStatusMessage("Table added successfully.");
      await loadManagementData();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to add table."));
    }
  };

  const handleCreateSpace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createEventSpace(spaceForm);
      setSpaceForm(initialSpaceForm);
      setStatusMessage("Celebration space added successfully.");
      await loadManagementData();
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Unable to add celebration space.")
      );
    }
  };

  const handleUpdateHours = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const restaurant = await updateRestaurantAvailability(hoursForm);
      const nextSession = {
        ...authSession,
        restaurant,
      };
      window.localStorage.setItem(
        "restaurant-auth-session",
        JSON.stringify(nextSession)
      );
      setAuthSession(nextSession);
      setStatusMessage("Opening hours updated successfully.");
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Unable to update opening hours.")
      );
    }
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-[#ded3c1] bg-[#fffaf2] p-5 shadow-xl shadow-[#6d4d2d]/10 sm:p-7">
      <div className="flex flex-col gap-2 border-b border-[#e6dac7] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a85d29]">
            Restaurant dashboard
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#211b18]">
            Manage bookings, tables, and party spaces
          </h2>
        </div>
        <button
          type="button"
          onClick={loadManagementData}
          className="rounded-lg border border-[#255647] px-4 py-2 text-sm font-bold text-[#255647] transition hover:bg-[#edf6f2]"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <form onSubmit={handleUpdateHours} className="space-y-3 rounded-2xl border border-[#e6dac7] bg-white p-4">
          <h3 className="font-bold text-[#211b18]">Opening hours</h3>
          <input
            type="time"
            name="openingTime"
            value={hoursForm.openingTime}
            onChange={handleHoursChange}
            className="booking-input"
          />
          <input
            type="time"
            name="closingTime"
            value={hoursForm.closingTime}
            onChange={handleHoursChange}
            className="booking-input"
          />
          <button className="w-full rounded-lg bg-[#255647] px-4 py-3 text-sm font-bold text-white">
            Save hours
          </button>
        </form>

        <form onSubmit={handleCreateTable} className="space-y-3 rounded-2xl border border-[#e6dac7] bg-white p-4">
          <h3 className="font-bold text-[#211b18]">Add table</h3>
          <input
            name="name"
            value={tableForm.name}
            onChange={handleTableChange}
            placeholder="Table 1"
            className="booking-input"
          />
          <input
            name="capacity"
            type="number"
            min="1"
            value={tableForm.capacity}
            onChange={handleTableChange}
            placeholder="Capacity"
            className="booking-input"
          />
          <button className="w-full rounded-lg bg-[#255647] px-4 py-3 text-sm font-bold text-white">
            Add table
          </button>
        </form>

        <form onSubmit={handleCreateSpace} className="space-y-3 rounded-2xl border border-[#e6dac7] bg-white p-4">
          <h3 className="font-bold text-[#211b18]">Add celebration space</h3>
          <input
            name="name"
            value={spaceForm.name}
            onChange={handleSpaceChange}
            placeholder="Birthday lounge"
            className="booking-input"
          />
          <select
            name="occasion"
            value={spaceForm.occasion}
            onChange={handleSpaceChange}
            className="booking-input"
          >
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Corporate</option>
            <option>Private Dining</option>
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="capacity"
              type="number"
              min="1"
              value={spaceForm.capacity}
              onChange={handleSpaceChange}
              placeholder="Capacity"
              className="booking-input"
            />
            <input
              name="price"
              type="number"
              min="0"
              value={spaceForm.price}
              onChange={handleSpaceChange}
              placeholder="Price"
              className="booking-input"
            />
          </div>
          <button className="w-full rounded-lg bg-[#255647] px-4 py-3 text-sm font-bold text-white">
            Add space
          </button>
        </form>
      </div>

      {statusMessage && (
        <p className="mt-4 rounded-lg bg-[#efe4d2] px-4 py-3 text-sm font-semibold text-[#5f493a]">
          {statusMessage}
        </p>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SummaryCard title="Bookings">
          {reservations.length ? (
            reservations.slice(0, 5).map((reservation) => (
              <p key={reservation.id} className="text-sm text-[#5f493a]">
                {reservation.name} - {reservation.guests} guests -{" "}
                {reservation.date} at {reservation.time}
              </p>
            ))
          ) : (
            <p className="text-sm text-[#8b765f]">No bookings yet.</p>
          )}
        </SummaryCard>

        <SummaryCard title="Tables">
          {tables.length ? (
            tables.map((table) => (
              <p key={table.id} className="text-sm text-[#5f493a]">
                {table.name} - {table.capacity} seats
              </p>
            ))
          ) : (
            <p className="text-sm text-[#8b765f]">No tables added.</p>
          )}
        </SummaryCard>

        <SummaryCard title="Celebration spaces">
          {spaces.length ? (
            spaces.map((space) => (
              <p key={space.id} className="text-sm text-[#5f493a]">
                {space.name} - {space.occasion} - {space.capacity} guests
              </p>
            ))
          ) : (
            <p className="text-sm text-[#8b765f]">No spaces added.</p>
          )}
        </SummaryCard>
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-[#e6dac7] bg-white p-4">
      <h3 className="font-bold text-[#211b18]">{title}</h3>
      {children}
    </div>
  );
}
