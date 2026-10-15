"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function TopBar() {
  const router = useRouter();

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#C9D0D8] bg-white px-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <select
            className="border border-[#C9D0D8] rounded px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1F6F8B] outline-none"
            defaultValue="Checkout Web"
            onChange={(e) => router.push(`/projects/${e.target.value.toLowerCase().replace(" ", "-")}`)}
          >
            <option>Checkout Web</option>
            <option>Mobile API</option>
            <option>Design System</option>
          </select>
        </div>
        <div className="relative w-64">
          <input type="text" placeholder="Search…" className="input w-full pr-9" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded p-1.5 text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]" aria-label="Notifications">
          <span className="sr-only">Notifications</span>
          <BellIcon />
        </button>
        <div className="flex items-center gap-2 border-l border-[#C9D0D8] pl-3">
          <span className="text-xs font-medium text-[#1B2430]">Alex Rivera</span>
          <button className="rounded p-1 text-[#5B6675] hover:bg-[#EDF0F3] hover:text-[#1B2430]" aria-label="Profile menu">
            <span className="sr-only">Profile menu</span>
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
