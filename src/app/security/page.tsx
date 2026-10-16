import PublicContentPage from "@/components/PublicContentPage";
import { ShieldIcon, LockIcon, UsersIcon, GlobeIcon, ClipboardIcon, KeyIcon } from "@/components/icons";

const measures = [
  { title: "SOC 2 Type II", description: "Our infrastructure and processes are audited for security and availability.", icon: <ShieldIcon className="text-[#1F6F8B]" /> },
  { title: "Data encryption", description: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3).", icon: <LockIcon className="text-[#1F6F8B]" /> },
  { title: "Tenant isolation", description: "Database-level isolation ensures users never access another organisation's data.", icon: <UsersIcon className="text-[#1F6F8B]" /> },
  { title: "GDPR & CCPA compliance", description: "We comply with GDPR and CCPA data protection regulations.", icon: <GlobeIcon className="text-[#1F6F8B]" /> },
  { title: "Audit logs", description: "Every workflow change is logged with who, what, and when for full traceability.", icon: <ClipboardIcon className="text-[#1F6F8B]" /> },
  { title: "SSO & SAML", description: "Enterprise single sign-on via SAML 2.0 and OpenID Connect.", icon: <KeyIcon className="text-[#1F6F8B]" /> },
];

export default function SecurityPage() {
  return (
    <PublicContentPage
      badge="Security"
      title="Built for security-first teams"
      subtitle="TestHub is designed with security at every layer, from data encryption to role-based access control."
      items={measures}
    />
  );
}
