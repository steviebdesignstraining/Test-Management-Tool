import PageHeader from "@/components/PageHeader";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Account / Profile"
        title="Profile"
        description="Manage your profile, password, sessions, and API tokens."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Profile Information</h2>
        <p className="text-sm text-[#5B6675]">Update your profile details here.</p>
      </div>
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Password</h2>
        <p className="text-sm text-[#5B6675]">Change your password.</p>
      </div>
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">Active Sessions</h2>
        <p className="text-sm text-[#5B6675]">View and manage active sessions.</p>
      </div>
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <h2 className="text-sm font-semibold text-[#1B2430] mb-4">API Tokens</h2>
        <p className="text-sm text-[#5B6675]">Create and manage API tokens.</p>
      </div>
    </div>
  );
}
