import SettingsForm from "./SettingsForm";
import PageHeader from "@/components/PageHeader";
import { getCurrentUser } from "@/lib/auth-utils";
import { getUserSettings } from "@/app/actions";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div>
        <PageHeader breadcrumb="Settings" title="Settings" description="Please sign in to view settings." />
      </div>
    );
  }

   const settings = await getUserSettings(user.id);

  return (
    <SettingsForm
      userId={user.id}
      settings={{
        userId: settings.userId,
        aiEnabled: settings.aiEnabled,
        autoComplete: settings.autoComplete,
        confidenceThreshold: settings.confidenceThreshold,
        retentionDays: settings.retentionDays,
        minPassRate: settings.minPassRate,
        blockOnCriticalFailures: settings.blockOnCriticalFailures,
        aiProvider: settings.aiProvider,
        aiModel: settings.aiModel,
        integrationConfigs: settings.integrationConfigs as Record<string, unknown> | null,
      }}
    />
  );
}
