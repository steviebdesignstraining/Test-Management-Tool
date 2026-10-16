import Link from "next/link";

interface ContentItem {
  title: string;
  description: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PublicContentPageProps {
  badge: string;
  title: string;
  subtitle: string;
  items: ContentItem[];
}

export default function PublicContentPage({ badge, title, subtitle, items }: PublicContentPageProps) {
  return (
    <div className="min-h-full flex flex-col bg-[#F5F7F9] text-[#1B2430]">
      <header className="border-b border-[#C9D0D8] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-[#1F6F8B]">TestHub</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/features" className="text-[#5B6675] hover:text-[#1B2430]">Features</Link>
            <Link href="/integrations" className="text-[#5B6675] hover:text-[#1B2430]">Integrations</Link>
            <Link href="/security" className="text-[#5B6675] hover:text-[#1B2430]">Security</Link>
            <Link href="/docs" className="text-[#5B6675] hover:text-[#1B2430]">Docs</Link>
            <Link href="/sign-in" className="text-[#5B6675] hover:text-[#1B2430] border border-[#C9D0D8] rounded px-3 py-1.5">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-1.5">Get started</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[#1F6F8B] bg-[#E4F0F4] rounded-full border border-[#B7D9E2]">
              {badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{title}</h1>
            <p className="text-lg text-[#5B6675] max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              item.href ? (
                <Link key={item.title} href={item.href} className="block p-6 border border-[#C9D0D8] rounded-lg bg-white hover:bg-[#F9FAFB] transition-colors">
                  {item.icon && <div className="mb-4 w-8 h-8">{item.icon}</div>}
                  <h3 className="text-base font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-[#5B6675] leading-relaxed">{item.description}</p>
                </Link>
              ) : (
                <div key={item.title} className="p-6 border border-[#C9D0D8] rounded-lg bg-white">
                  {item.icon && <div className="mb-4 w-8 h-8">{item.icon}</div>}
                  <h3 className="text-base font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-[#5B6675] leading-relaxed">{item.description}</p>
                </div>
              )
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#C9D0D8] bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#5B6675]">
          <span>TestHub. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/features" className="hover:text-[#1B2430]">Features</Link>
            <Link href="/integrations" className="hover:text-[#1B2430]">Integrations</Link>
            <Link href="/security" className="hover:text-[#1B2430]">Security</Link>
            <Link href="/docs" className="hover:text-[#1B2430]">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
