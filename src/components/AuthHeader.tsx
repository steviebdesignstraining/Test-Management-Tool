import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="border-b border-[#C9D0D8] bg-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/features" className="text-[#5B6675] hover:text-[#1B2430]">
            Features
          </Link>
          <Link href="/integrations" className="text-[#5B6675] hover:text-[#1B2430]">
            Integrations
          </Link>
          <Link href="/security" className="text-[#5B6675] hover:text-[#1B2430]">
            Security
          </Link>
          <Link href="/docs" className="text-[#5B6675] hover:text-[#1B2430]">
            Docs
          </Link>
        </nav>
      </div>
    </header>
  );
}
