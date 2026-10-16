import PublicLayout from "@/components/PublicLayout";

export default function SecurityPage() {
  const measures = [
    { title: "SOC 2 Type II", description: "Our infrastructure and processes are audited for security and availability." },
    { title: "Data encryption", description: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3)." },
    { title: "Row-level security", description: "Database-level tenant isolation ensures users never access another organisation's data." },
    { title: "GDPR & CCPA compliance", description: "We comply with GDPR and CCPA data protection regulations." },
    { title: "Audit logs", description: "Every workflow change is logged with who, what, and when for full traceability." },
    { title: "SSO & SAML", description: "Enterprise single sign-on via SAML 2.0 and OpenID Connect." },
  ];

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-[#1F6F8B] bg-[#E4F0F4] rounded-full border border-[#B7D9E2]">
            Security
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Built for security-first teams
          </h1>
          <p className="text-lg text-[#5B6675] max-w-2xl mx-auto leading-relaxed">
            TestHub is designed with security at every layer, from data encryption to role-based access control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {measures.map((m) => (
            <div key={m.title} className="p-6 border border-[#C9D0D8] rounded-lg bg-white">
              <h3 className="text-base font-semibold mb-3">{m.title}</h3>
              <p className="text-sm text-[#5B6675] leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
