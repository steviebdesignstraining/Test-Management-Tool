import PageHeader from "@/components/PageHeader";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Notifications"
        title="Notifications Center"
        description="Manage your notifications and subscriptions."
      />
      <div className="bg-white border border-[#C9D0D8] rounded p-6">
        <p className="text-sm text-[#5B6675]">Notifications center coming soon.</p>
      </div>
    </div>
  );
}
