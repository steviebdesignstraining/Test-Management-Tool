"use client";

import Link from "next/link";

const features = [
  {
    title: "Role-based permissions",
    description: "Owner, Admin, QA Lead, Tester, Developer, and Read-only roles keep the right people in control.",
  },
  {
    title: "Tenant isolation",
    description: "Users never access another organisation's records — every project is scoped to its workspace.",
  },
  {
    title: "Audit history",
    description: "Every important workflow change is logged so you always know who did what and when.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-full flex flex-col bg-[#F5F7F9] text-[#1B2430]">
      <header className="border-b border-[#C9D0D8] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-[#5B6675] hover:text-[#1B2430]">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-1.5">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[#1F6F8B] bg-[#E4F0F4] rounded-full border border-[#B7D9E2]">
            Test management platform
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            One source of truth for test evidence
          </h1>
          <p className="text-lg md:text-xl text-[#5B6675] mb-10 max-w-2xl mx-auto leading-relaxed">
            TestHub brings manual testing, automation, CI/CD results, defects and AI insights into one
            workspace. Built for individual testers and QA teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in" className="btn-primary px-8 py-3 text-base">
              Sign in
            </Link>
            <Link href="/register" className="btn-outline px-8 py-3 text-base border-[#C9D0D8] bg-white">
              Create account
            </Link>
          </div>
        </section>

        <section className="bg-white border-y border-[#C9D0D8] py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-10 text-center">Everything you need to ship quality</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div key={f.title} className="p-6 border border-[#C9D0D8] rounded-lg bg-[#F9FAFB]">
                  <h3 className="text-base font-semibold mb-3">{f.title}</h3>
                  <p className="text-sm text-[#5B6675] leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to centralize your test evidence?</h2>
          <p className="text-[#5B6675] mb-8 max-w-xl mx-auto">
            Join teams that track requirements, test cases, plans, runs and defects in one place.
          </p>
          <Link href="/register" className="btn-primary px-8 py-3 text-base inline-block">
            Create your account
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#C9D0D8] bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5B6675]">
          <span>TestHub. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/sign-in" className="hover:text-[#1B2430]">Sign in</Link>
            <Link href="/register" className="hover:text-[#1B2430]">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
