import AppHeader from "@/components/AppHeader";
import BookingForm from "@/components/BookingForm";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#efe7dc] text-[#1d1713]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(245,181,99,0.34),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(37,86,71,0.18),transparent_30%),linear-gradient(135deg,#f8f1e8,#e7d5bf)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(31,50,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(31,50,42,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <section className="relative mx-auto min-h-screen w-full max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader />

        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[2.2rem] bg-[#1f322a] p-5 text-white shadow-2xl shadow-[#1f322a]/25 sm:p-7 lg:sticky lg:top-5">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_40%),radial-gradient(circle_at_88%_10%,rgba(244,181,99,0.28),transparent_30%),radial-gradient(circle_at_5%_92%,rgba(255,255,255,0.1),transparent_25%)]" />
            <div className="absolute right-5 top-5 hidden rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#f4d7a6] backdrop-blur sm:block">
              Guest booking
            </div>

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b563]">
                Open table desk
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-5xl xl:text-6xl">
                Reserve the right table before the dinner rush.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
                Discover restaurants by city, check availability, and confirm a
                booking from one focused guest flow.
              </p>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <Metric value="15+" label="Cities" />
                <Metric value="2m" label="Booking" />
                <Metric value="Live" label="Status" />
              </div>

              <div className="mt-5 rounded-[1.6rem] border border-white/15 bg-[#111f1a]/45 p-4 backdrop-blur">
                <p className="text-sm font-black text-[#f4d7a6]">
                  Restaurant owner?
                </p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Use the login page to create a restaurant account, then open
                  the dashboard to manage tables, hours, and bookings.
                </p>
              </div>
            </div>
          </div>

          <BookingForm />
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/55">
        {label}
      </p>
    </div>
  );
}
