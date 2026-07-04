"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Book" },
  { href: "/auth", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="mb-5 rounded-[1.7rem] border border-white/65 bg-white/65 px-3 py-3 shadow-lg shadow-[#6d4d2d]/10 backdrop-blur-xl sm:rounded-full sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-[#1f322a] text-sm font-black text-[#f4b563] shadow-lg shadow-[#1f322a]/20">
            RT
          </div>
          <div>
            <p className="text-sm font-black leading-none tracking-[-0.02em]">
              ReserveTable
            </p>
            <p className="mt-1 text-xs font-semibold text-[#7b6755]">
              Restaurant booking OS
            </p>
          </div>
        </Link>

        <nav className="grid grid-cols-3 gap-1 rounded-full border border-[#e1ceb5] bg-[#f8efe2]/80 p-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-center text-xs font-black uppercase tracking-[0.12em] transition sm:px-4 ${
                  isActive
                    ? "bg-[#1f322a] text-[#f4b563] shadow-sm"
                    : "text-[#6f5b48] hover:bg-white/75 hover:text-[#255647]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
