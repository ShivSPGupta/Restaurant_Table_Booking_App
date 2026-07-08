"use client";

import type { ChangeEvent, SubmitEvent } from "react";
import { useState, useSyncExternalStore } from "react";
import {
  cancelMyReservation,
  getApiErrorMessage,
  getMyReservations,
  updateMyReservation,
  type Reservation,
} from "@/lib/api";
import {
  getStoredAuthSession,
  subscribeToAuthSessionChanges,
} from "@/lib/authSessionStore";

const initialReservationEditForm = {
  date: "",
  time: "",
  guests: "",
  name: "",
  contact: "",
};

export default function UserDashboardPanel() {
  const authSession = useSyncExternalStore(
    subscribeToAuthSessionChanges,
    getStoredAuthSession,
    () => null
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState<
    string | null
  >(null);
  const [reservationEditForm, setReservationEditForm] = useState(
    initialReservationEditForm
  );

  if (authSession?.role !== "user") {
    return null;
  }

  async function loadReservations() {
    setIsLoading(true);
    try {
      const reservationData = await getMyReservations();
      setReservations(reservationData);
      setStatusMessage("");
    } catch (error) {
      setStatusMessage(
        getApiErrorMessage(error, "Unable to load your reservations.")
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleReservationEditChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setReservationEditForm({
      ...reservationEditForm,
      [event.target.name]: event.target.value,
    });
  };

  const startReservationEdit = (reservation: Reservation) => {
    setEditingReservationId(reservation.id);
    setReservationEditForm({
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
      await updateMyReservation(editingReservationId, reservationEditForm);
      setEditingReservationId(null);
      setReservationEditForm(initialReservationEditForm);
      setStatusMessage("Booking updated successfully.");
      await loadReservations();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to update booking."));
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await cancelMyReservation(reservationId);
      setEditingReservationId(null);
      setStatusMessage("Booking cancelled successfully.");
      await loadReservations();
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error, "Unable to cancel booking."));
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-[#6d4d2d]/12 backdrop-blur-xl sm:p-7">
      <div className="flex flex-col gap-3 border-b border-[#e6dac7] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a85d29]">
            Guest dashboard
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#211b18]">
            Your table bookings
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f5b48]">
            Track reservations linked to your guest account. New bookings from
            the booking page will appear here.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReservations}
          className="rounded-full border border-[#255647] bg-white/70 px-4 py-2 text-sm font-black text-[#255647] transition hover:bg-[#edf6f2]"
        >
          {isLoading ? "Loading..." : "Refresh bookings"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <StatCard label="Total bookings" value={String(reservations.length)} />
        <StatCard
          label="Upcoming"
          value={String(
            reservations.filter((reservation) => reservation.date >= today())
              .length
          )}
        />
        <StatCard
          label="Guest profile"
          value={authSession.user?.name || "Guest"}
        />
      </div>

      {statusMessage && (
        <p className="mt-4 rounded-2xl bg-[#efe4d2] px-4 py-3 text-sm font-bold text-[#5f493a]">
          {statusMessage}
        </p>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {reservations.length ? (
          reservations.map((reservation) => (
            <article
              key={reservation.id}
              className="rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-4 shadow-sm"
            >
              {editingReservationId === reservation.id ? (
                <form onSubmit={handleUpdateReservation} className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      aria-label="Booking guest name"
                      name="name"
                      value={reservationEditForm.name}
                      onChange={handleReservationEditChange}
                      className="booking-input"
                      placeholder="Guest name"
                      required
                    />
                    <input
                      aria-label="Booking contact number"
                      name="contact"
                      value={reservationEditForm.contact}
                      onChange={handleReservationEditChange}
                      className="booking-input"
                      placeholder="Contact"
                      required
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
                      required
                    />
                    <input
                      aria-label="Booking time"
                      name="time"
                      type="time"
                      value={reservationEditForm.time}
                      onChange={handleReservationEditChange}
                      className="booking-input"
                      required
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
                      required
                    />
                  </div>
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
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-[#211b18]">
                        {reservation.name}
                      </p>
                      <p className="mt-1 text-sm text-[#5f493a]">
                        {reservation.guests} guests
                      </p>
                    </div>
                    <span className="rounded-full bg-[#dcf4df] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#255647]">
                      Booked
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 rounded-2xl bg-[#fffaf2] p-3 text-sm text-[#5f493a] sm:grid-cols-2">
                    <p>
                      <span className="font-black text-[#211b18]">Date:</span>{" "}
                      {reservation.date}
                    </p>
                    <p>
                      <span className="font-black text-[#211b18]">Time:</span>{" "}
                      {reservation.time}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-black text-[#211b18]">Contact:</span>{" "}
                      {reservation.contact}
                    </p>
                  </div>
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
            </article>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-5 text-sm font-bold text-[#8b765f] lg:col-span-2">
            No reservations loaded yet. Click refresh after creating a booking.
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#e6dac7] bg-white/80 p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a85d29]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-[-0.03em] text-[#211b18]">
        {value}
      </p>
    </div>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
