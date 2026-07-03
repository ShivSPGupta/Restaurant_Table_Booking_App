import BookingForm from "@/components/BookingForm";
import RestaurantAuthCard from "@/components/RestaurantAuthCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,#fff7e9,transparent_34%),linear-gradient(135deg,#f5f0e8,#eadbc7)] text-[#211b18]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#1f322a] p-5 text-white shadow-2xl shadow-black/15 sm:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(244,181,99,0.22),transparent_30%)]" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b563]">
              Open table desk
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              Reserve the right table before the dinner rush.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
              A focused booking screen for guests, hosts, and small restaurant
              teams to confirm table availability with less back-and-forth.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/15 py-4">
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

            <div className="mt-5 grid gap-4 xl:grid-cols-[0.76fr_1.24fr] xl:items-start">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold text-[#f4d7a6]">
                  Tonight&apos;s note
                </p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Peak seating starts around 7:30 PM. Check availability first
                  for faster confirmation.
                </p>
              </div>
              <RestaurantAuthCard />
            </div>
          </div>
        </div>

        <BookingForm />
      </section>
    </main>
  );
}
