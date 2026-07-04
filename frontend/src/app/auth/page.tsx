import AppHeader from "@/components/AppHeader";
import RestaurantAuthCard from "@/components/RestaurantAuthCard";

export default function AuthPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#efe7dc] text-[#1d1713]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(245,181,99,0.34),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(37,86,71,0.18),transparent_30%),linear-gradient(135deg,#f8f1e8,#e7d5bf)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(31,50,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(31,50,42,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <section className="relative mx-auto min-h-screen w-full max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader />

        <div className="grid gap-5 xl:grid-cols-[0.5fr_1.5fr] xl:items-start">
          <aside className="overflow-hidden rounded-[2rem] bg-[#1f322a] p-6 text-white shadow-2xl shadow-[#1f322a]/25 sm:p-7 xl:sticky xl:top-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b563]">
              Account access
            </p>
            <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl xl:text-6xl">
              Login or register by role.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Guests book tables in seconds. Restaurants unlock a private
              dashboard for reservations, tables, celebration spaces, and
              opening hours.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <RolePill label="Guest booking" />
              <RolePill label="Restaurant dashboard" />
            </div>
          </aside>

          <div className="grid gap-5">
            <RestaurantAuthCard />

            <div className="grid gap-5 lg:grid-cols-2">
              <RolePanel
                title="Guest flow"
                description="Create a guest account, browse restaurants by Indian city, and confirm a table booking with availability checks."
              />
              <RolePanel
                title="Restaurant flow"
                description="Create a restaurant account and manage bookings, tables, event spaces, and hours from the dashboard."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function RolePill({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-[#f4d7a6] backdrop-blur">
      {label}
    </div>
  );
}

function RolePanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-[#6d4d2d]/12 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a85d29]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#6f5b48]">{description}</p>
    </div>
  );
}
