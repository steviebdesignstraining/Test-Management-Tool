import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-900">
      <header className="sticky top-0 z-20 bg-white border-b border-zinc-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-indigo-600">TestFlow</span>
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Test Management Platform</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-indigo-600 font-medium">Dashboard</Link>
            <Link href="/projects" className="text-zinc-600 hover:text-indigo-600 font-medium">Projects</Link>
            <Link href="/test-cases" className="text-zinc-600 hover:text-indigo-600 font-medium">Test Cases</Link>
            <Link href="/test-plans" className="text-zinc-600 hover:text-indigo-600 font-medium">Test Plans</Link>
            <Link href="/executions" className="text-zinc-600 hover:text-indigo-600 font-medium">Executions</Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700">Sign in</button>
          </div>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome to TestFlow</h1>
            <p className="mt-2 text-zinc-600">
              A professional test management platform for manual and automated
              testing, CI/CD analytics, defect tracking, and AI-assisted quality insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Test Cases",
                description: "Create, version, and execute manual test cases with step-by-step tracking.",
                icon: "📋",
                href: "/test-cases",
              },
              {
                title: "Test Plans",
                description: "Group test cases into suites and plan execution cycles for releases.",
                icon: "📅",
                href: "/test-plans",
              },
              {
                title: "Executions",
                description: "Record pass/fail/blocked results and track step-level outcomes.",
                icon: "▶️",
                href: "/executions",
              },
              {
                title: "Defects",
                description: "Track bugs, link them to test cases and executions.",
                icon: "🐛",
                href: "/defects",
              },
              {
                title: "Automation",
                description: "Map manual cases to Playwright, Cypress, and WebdriverIO scripts.",
                icon: "🤖",
                href: "/automation",
              },
              {
                title: "CI/CD",
                description: "Ingest GitHub Actions runs and visualize pipeline results.",
                icon: "⚙️",
                href: "/ci",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group block p-6 rounded-xl bg-white border border-zinc-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-600 line-clamp-2">{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 border-t border-zinc-200 pt-8">
            <h2 className="text-xl font-semibold mb-4">Get Started</h2>
            <ul className="space-y-2 text-zinc-600 max-w-md">
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Set up your database connection in <code className="bg-zinc-100 px-1 py-0.5 rounded">.env.local</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Run <code className="bg-zinc-100 px-1 py-0.5 rounded">npm run dev</code> to start the app
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span>
                Create your first project and test case
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-zinc-500">
          <span>TestFlow Test Management Platform</span>
          <span>Built with Next.js, TypeScript, Tailwind CSS &amp; Neon Postgres</span>
        </div>
      </footer>
    </div>
  );
}
