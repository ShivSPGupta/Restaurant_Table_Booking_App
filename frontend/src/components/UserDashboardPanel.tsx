"use client";

import { useState, useSyncExternalStore } from "react";
import {
  getApiErrorMessage,
  getMyReservations,
  type Reservation,
} from "@/lib/api";
import {
  getStoredAuthSession,
  subscribeToAuthSessionChanges,
} from "@/lib/authSessionStore";

export default function UserDashboardPanel() {
  const authSession = useSyncExternalStore(
    subscribeToAuthSessionChanges,
    getStoredAuthSession,
    () => null
  );
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
