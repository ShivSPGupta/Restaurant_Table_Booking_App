import AppHeader from "@/components/AppHeader";
import RestaurantAuthCard from "@/components/RestaurantAuthCard";
import RestaurantManagementPanel from "@/components/RestaurantManagementPanel";
import UserDashboardPanel from "@/components/UserDashboardPanel";

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#efe7dc] text-[#1d1713]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(245,181,99,0.34),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(37,86,71,0.18),transparent_30%),linear-gradient(135deg,#f8f1e8,#e7d5bf)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(31,50,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(31,50,42,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <section className="relative mx-auto min-h-screen w-full max-w-[96rem] px-4 py-5 sm:px-6 lg:px-8">
        <AppHeader />

        <div className="mb-5 rounded-[2rem] bg-[#1f322a] p-6 text-white shadow-2xl shadow-[#1f322a]/25">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4b563]">
            Account workspace
          </p>
          <h1 className="mt-3 text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
            Your dashboard changes by role.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70">
            Guests see their own reservations. Restaurants manage bookings,
            tables, event spaces, and opening hours from a separate workspace.
          </p>
        </div>

        <div className="grid gap-5">
          <RestaurantAuthCard />
          <UserDashboardPanel />
          <RestaurantManagementPanel />
        </div>
      </section>
    </main>
  );
}
