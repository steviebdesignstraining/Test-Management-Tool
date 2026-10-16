import Link from "next/link";

const navItems = [
  { name: "Features", href: "/features" },
  { name: "Integrations", href: "/integrations" },
  { name: "Security", href: "/security" },
  { name: "Docs", href: "/docs" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-[#F5F7F9] text-[#1B2430]">
      <header className="border-b border-[#C9D0D8] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-[#5B6675] hover:text-[#1B2430]">
                {item.name}
              </Link>
            ))}
            <Link href="/sign-in" className="text-[#5B6675] hover:text-[#1B2430]">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary px-4 py-1.5 text-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#C9D0D8] bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5B6675]">
          <span>TestHub. All rights reserved.</span>
          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#1B2430]">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
