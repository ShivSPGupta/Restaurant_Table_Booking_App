import BookingForm from "@/components/BookingForm";
import RestaurantAuthCard from "@/components/RestaurantAuthCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#211b18]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div className="relative overflow-hidden rounded-lg bg-[#1f322a] p-6 text-white shadow-2xl shadow-black/15 sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(244,181,99,0.22),transparent_30%)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b563]">
              Open table desk
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
              Reserve the right table before the dinner rush.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/78">
              A focused booking screen for guests, hosts, and small restaurant
              teams to confirm table availability with less back-and-forth.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 border-y border-white/15 py-5">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                  Tables
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">2 min</p>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                  Booking
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold">Live</p>
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                  Status
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-white/15 bg-white/10 p-4">
              <p className="text-sm font-semibold text-[#f4d7a6]">
                Tonight&apos;s note
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Peak seating starts around 7:30 PM. Check availability first
                for faster confirmation.
              </p>
            </div>

            <div className="mt-5">
              <RestaurantAuthCard />
            </div>
          </div>
        </div>

        <BookingForm />
      </section>
    </main>
  );
}
