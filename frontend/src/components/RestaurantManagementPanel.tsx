"use client";

import type { ChangeEvent, ReactNode, SubmitEvent } from "react";
import { useState, useSyncExternalStore } from "react";
import {
  cancelRestaurantReservation,
  createEventSpace,
  createRestaurantTable,
  getApiErrorMessage,
  getEventSpaces,
  getRestaurantReservations,
  getRestaurantTables,
  updateRestaurantReservation,
  updateRestaurantAvailability,
  updateRestaurantTable,
  type AuthResponse,
  type EventSpace,
  type EventSpaceCategory,
  type Reservation,
  type RestaurantTable,
  type TableCategory,
} from "@/lib/api";
import {
  getStoredAuthSession,
  saveAuthSession,
  subscribeToAuthSessionChanges,
} from "@/lib/authSessionStore";

const initialTableForm = {
  name: "",
  category: "PUBLIC" as TableCategory,
  capacity: "",
};

const initialSpaceForm = {
  name: "",
  category: "GENERAL_EVENT" as EventSpaceCategory,
  occasion: "General Event",
  capacity: "",
  price: "",
};

const initialHoursForm = {
  openingTime: "10:00",
  closingTime: "22:00",
};

const initialReservationEditForm = {
  tableId: "",
  date: "",
  time: "",
  guests: "",
  name: "",
  contact: "",
};

function normalizeTableName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function findDuplicateTable(
  tables: RestaurantTable[],
  tableName: string,
  currentTableId?: string
) {
  const normalizedName = normalizeTableName(tableName);

  return tables.find(
    (table) =>
      table.id !== currentTableId &&
      normalizeTableName(table.name) === normalizedName
  );
}

function isValidTableForm(tableForm: typeof initialTableForm): boolean {
  const capacity = Number(tableForm.capacity);

  return Boolean(
    normalizeTableName(tableForm.name) &&
      Number.isInteger(capacity) &&
      capacity > 0
  );
}

function formatTableCategory(category: TableCategory): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function formatEventSpaceCategory(category: EventSpaceCategory): string {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default function RestaurantManagementPanel() {
  const authSession = useSyncExternalStore(
    subscribeToAuthSessionChanges,
    getStoredAuthSession,
    () => null
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [spaces, setSpaces] = useState<EventSpace[]>([]);
  const [tableForm, setTableForm] = useState(initialTableForm);
  const [tableEditForm, setTableEditForm] = useState(initialTableForm);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [spaceForm, setSpaceForm] = useState(initialSpaceForm);
  const [hoursForm, setHoursForm] = useState(initialHoursForm);
  const [reservationEditForm, setReservationEditForm] = useState(
    initialReservationEditForm
  );
  const [editingReservationId, setEditingReservationId] = useState<
    string | null
  >(null);
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

  const handleTableChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTableForm({ ...tableForm, [event.target.name]: event.target.value });
  };

  const handleTableEditChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTableEditForm({
      ...tableEditForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleReservationEditChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setReservationEditForm({
      ...reservationEditForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleSpaceChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const nextSpaceForm = { ...spaceForm, [event.target.name]: event.target.value };

    if (event.target.name === "category") {
      nextSpaceForm.occasion = formatEventSpaceCategory(
        event.target.value as EventSpaceCategory
      );
    }

    setSpaceForm(nextSpaceForm);
  };

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHoursForm({ ...hoursForm, [event.target.name]: event.target.value });
  };

  const handleCreateTable = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (!isValidTableForm(tableForm)) {
        setStatusMessage("Table name and valid capacity are required.");
        return;
      }

      const latestTables = await getRestaurantTables();
      const duplicateTable = findDuplicateTable(latestTables, tableForm.name);

      if (duplicateTable) {
        setTables(latestTables);
        setStatusMessage("A table with this name already exists.");
        return;
      }

      await createRestaurantTable(tableForm);
      setTableForm(initialTableForm);
      setStatusMessage("Table added successfully.");
      await loadManagementData();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to add table."));
    }
  };

  const startTableEdit = (table: RestaurantTable) => {
    setEditingTableId(table.id);
    setTableEditForm({
      name: table.name,
      category: table.category,
      capacity: String(table.capacity),
    });
    setStatusMessage("");
  };

  const handleUpdateTable = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingTableId) {
      return;
    }

    try {
      if (!isValidTableForm(tableEditForm)) {
        setStatusMessage("Table name and valid capacity are required.");
        return;
      }

      const latestTables = await getRestaurantTables();
      const duplicateTable = findDuplicateTable(
        latestTables,
        tableEditForm.name,
        editingTableId
      );

      if (duplicateTable) {
        setTables(latestTables);
        setStatusMessage("A table with this name already exists.");
        return;
      }

      await updateRestaurantTable(editingTableId, tableEditForm);
      setEditingTableId(null);
      setTableEditForm(initialTableForm);
      setStatusMessage("Table updated successfully.");
      await loadManagementData();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to update table."));
    }
  };

  const handleToggleTableStatus = async (table: RestaurantTable) => {
    try {
      await updateRestaurantTable(table.id, {
        isActive: !table.isActive,
      });
      setStatusMessage(
        table.isActive ? "Table deactivated." : "Table activated."
      );
      await loadManagementData();
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Unable to update table status.")
      );
    }
  };

  const handleCreateSpace = async (event: SubmitEvent<HTMLFormElement>) => {
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

  const handleUpdateHours = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const restaurant = await updateRestaurantAvailability(hoursForm);
      const nextSession: AuthResponse = {
        ...authSession,
        restaurant,
      };
      saveAuthSession(nextSession);
      setStatusMessage("Opening hours updated successfully.");
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Unable to update opening hours.")
      );
    }
  };

  const startReservationEdit = (reservation: Reservation) => {
    setEditingReservationId(reservation.id);
    setReservationEditForm({
      tableId: reservation.tableId || "",
      date: reservation.date,
      time: reservation.time,
      guests: String(reservation.guests),
      name: reservation.name,
      contact: reservation.contact,
    });
    setStatusMessage("");
  };

  const handleUpdateReservation = async (
    event: SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingReservationId) {
      return;
    }

    try {
      await updateRestaurantReservation(
        editingReservationId,
        reservationEditForm
      );
      setEditingReservationId(null);
      setReservationEditForm(initialReservationEditForm);
      setStatusMessage("Booking updated successfully.");
      await loadManagementData();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to update booking."));
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelRestaurantReservation(reservationId);
      setStatusMessage("Booking cancelled successfully.");
      await loadManagementData();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to cancel booking."));
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-[#6d4d2d]/12 backdrop-blur-xl sm:p-7">
      <div className="flex flex-col gap-2 border-b border-[#e6dac7] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a85d29]">
            Restaurant dashboard
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#211b18]">
            Manage bookings, tables, and party spaces
          </h2>
        </div>
        <button
          type="button"
          onClick={loadManagementData}
          className="rounded-full border border-[#255647] bg-white/70 px-4 py-2 text-sm font-black text-[#255647] transition hover:bg-[#edf6f2]"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <form onSubmit={handleUpdateHours} className="space-y-3 rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-4 shadow-sm">
          <h3 className="font-bold text-[#211b18]">Opening hours</h3>
          <input
            aria-label="Opening time"
            type="time"
            name="openingTime"
            value={hoursForm.openingTime}
            onChange={handleHoursChange}
            className="booking-input"
          />
          <input
            aria-label="Closing time"
            type="time"
            name="closingTime"
            value={hoursForm.closingTime}
            onChange={handleHoursChange}
            className="booking-input"
          />
          <button className="w-full rounded-2xl bg-[#255647] px-4 py-3 text-sm font-black text-white">
            Save hours
          </button>
        </form>

        <form onSubmit={handleCreateTable} className="space-y-3 rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-4 shadow-sm">
          <h3 className="font-bold text-[#211b18]">Add table</h3>
          <input
            aria-label="Table name"
            name="name"
            value={tableForm.name}
            onChange={handleTableChange}
            placeholder="Table 1"
            required
            className="booking-input"
          />
          <select
            aria-label="Table category"
            name="category"
            value={tableForm.category}
            onChange={handleTableChange}
            className="booking-input"
          >
            <option value="PUBLIC">Public / open table</option>
            <option value="COUPLE">Couple table</option>
            <option value="FAMILY">Family table</option>
            <option value="SPECIAL">Special table</option>
          </select>
          <input
            aria-label="Table capacity"
            name="capacity"
            type="number"
            min="1"
            value={tableForm.capacity}
            onChange={handleTableChange}
            placeholder="Capacity"
            required
            className="booking-input"
          />
          <button className="w-full rounded-2xl bg-[#255647] px-4 py-3 text-sm font-black text-white">
            Add table
          </button>
        </form>

        <form onSubmit={handleCreateSpace} className="space-y-3 rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-4 shadow-sm">
          <h3 className="font-bold text-[#211b18]">Add celebration space</h3>
          <input
            aria-label="Celebration space name"
            name="name"
            value={spaceForm.name}
            onChange={handleSpaceChange}
            placeholder="Birthday lounge"
            className="booking-input"
          />
          <select
            aria-label="Select event space category"
            name="category"
            value={spaceForm.category}
            onChange={handleSpaceChange}
            className="booking-input"
          >
            <option value="MARRIAGE">Marriage</option>
            <option value="BIRTHDAY_PARTY">Birthday party</option>
            <option value="RECEPTION">Reception</option>
            <option value="GENERAL_PARTY">General party</option>
            <option value="GENERAL_EVENT">General event</option>
          </select>
          <input
            aria-label="Event space occasion label"
            name="occasion"
            value={spaceForm.occasion}
            onChange={handleSpaceChange}
            placeholder="Birthday party"
            className="booking-input"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Celebration space capacity"
              name="capacity"
              type="number"
              min="1"
              value={spaceForm.capacity}
              onChange={handleSpaceChange}
              placeholder="Capacity"
              className="booking-input"
            />
            <input
              aria-label="Celebration space price"
              name="price"
              type="number"
              min="0"
              value={spaceForm.price}
              onChange={handleSpaceChange}
              placeholder="Price"
              className="booking-input"
            />
          </div>
          <button className="w-full rounded-2xl bg-[#255647] px-4 py-3 text-sm font-black text-white">
            Add space
          </button>
        </form>
      </div>

      {statusMessage && (
        <p className="mt-4 rounded-2xl bg-[#efe4d2] px-4 py-3 text-sm font-bold text-[#5f493a]">
          {statusMessage}
        </p>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SummaryCard title="Bookings">
          {reservations.length ? (
            reservations.slice(0, 5).map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-2xl border border-[#eadbc8] bg-[#fffaf2] p-3"
              >
                {editingReservationId === reservation.id ? (
                  <form onSubmit={handleUpdateReservation} className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        aria-label="Booking guest name"
                        name="name"
                        value={reservationEditForm.name}
                        onChange={handleReservationEditChange}
                        className="booking-input"
                        placeholder="Guest name"
                      />
                      <input
                        aria-label="Booking contact number"
                        name="contact"
                        value={reservationEditForm.contact}
                        onChange={handleReservationEditChange}
                        className="booking-input"
                        placeholder="Contact"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        aria-label="Booking date"
                        name="date"
                        type="date"
                        value={reservationEditForm.date}
                        onChange={handleReservationEditChange}
                        className="booking-input"
                      />
                      <input
                        aria-label="Booking time"
                        name="time"
                        type="time"
                        value={reservationEditForm.time}
                        onChange={handleReservationEditChange}
                        className="booking-input"
                      />
                      <input
                        aria-label="Booking guest count"
                        name="guests"
                        type="number"
                        min="1"
                        value={reservationEditForm.guests}
                        onChange={handleReservationEditChange}
                        className="booking-input"
                        placeholder="Guests"
                      />
                    </div>
                    <select
                      aria-label="Assign table to booking"
                      name="tableId"
                      value={reservationEditForm.tableId}
                      onChange={handleReservationEditChange}
                      className="booking-input"
                    >
                      <option value="">No table assigned</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name} ({table.capacity} seats)
                        </option>
                      ))}
                    </select>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button className="rounded-2xl bg-[#255647] px-3 py-2 text-xs font-black text-white">
                        Save booking
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingReservationId(null)}
                        className="rounded-2xl border border-[#d8c5ad] px-3 py-2 text-xs font-black text-[#5f493a]"
                      >
                        Close
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-sm font-black text-[#211b18]">
                      {reservation.name}
                    </p>
                    <p className="mt-1 text-sm text-[#5f493a]">
                      {reservation.guests} guests - {reservation.date} at{" "}
                      {reservation.time}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => startReservationEdit(reservation)}
                        className="rounded-2xl border border-[#255647] px-3 py-2 text-xs font-black text-[#255647]"
                      >
                        Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="rounded-2xl bg-[#8f352d] px-3 py-2 text-xs font-black text-white"
                      >
                        Cancel booking
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#8b765f]">No bookings yet.</p>
          )}
        </SummaryCard>

        <SummaryCard title="Tables">
          {tables.length ? (
            tables.map((table) => (
              <div
                key={table.id}
                className="rounded-2xl border border-[#eadbc8] bg-[#fffaf2] p-3"
              >
                {editingTableId === table.id ? (
                  <form onSubmit={handleUpdateTable} className="space-y-2">
                    <input
                      aria-label="Edit table name"
                      name="name"
                      value={tableEditForm.name}
                      onChange={handleTableEditChange}
                      className="booking-input"
                      placeholder="Table name"
                      required
                    />
                    <select
                      aria-label="Edit table category"
                      name="category"
                      value={tableEditForm.category}
                      onChange={handleTableEditChange}
                      className="booking-input"
                    >
                      <option value="PUBLIC">Public / open table</option>
                      <option value="COUPLE">Couple table</option>
                      <option value="FAMILY">Family table</option>
                      <option value="SPECIAL">Special table</option>
                    </select>
                    <input
                      aria-label="Edit table capacity"
                      name="capacity"
                      type="number"
                      min="1"
                      value={tableEditForm.capacity}
                      onChange={handleTableEditChange}
                      className="booking-input"
                      placeholder="Capacity"
                      required
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button className="rounded-2xl bg-[#255647] px-3 py-2 text-xs font-black text-white">
                        Save table
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTableId(null)}
                        className="rounded-2xl border border-[#d8c5ad] px-3 py-2 text-xs font-black text-[#5f493a]"
                      >
                        Close
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#211b18]">
                          {table.name}
                        </p>
                        <p className="mt-1 text-sm text-[#5f493a]">
                          {table.capacity} seats
                        </p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#a85d29]">
                          {formatTableCategory(table.category)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] ${
                          table.isActive
                            ? "bg-[#dcf4df] text-[#255647]"
                            : "bg-[#f1d8d5] text-[#8f352d]"
                        }`}
                      >
                        {table.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => startTableEdit(table)}
                        className="rounded-2xl border border-[#255647] px-3 py-2 text-xs font-black text-[#255647]"
                      >
                        Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleTableStatus(table)}
                        className="rounded-2xl bg-[#1f322a] px-3 py-2 text-xs font-black text-white"
                      >
                        {table.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-[#8b765f]">No tables added.</p>
          )}
        </SummaryCard>

        <SummaryCard title="Celebration spaces">
          {spaces.length ? (
            spaces.map((space) => (
              <p key={space.id} className="text-sm text-[#5f493a]">
                {space.name} - {formatEventSpaceCategory(space.category)} -{" "}
                {space.capacity} guests
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
    <div className="space-y-2 rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-4 shadow-sm">
      <h3 className="font-bold text-[#211b18]">{title}</h3>
      {children}
    </div>
  );
}
