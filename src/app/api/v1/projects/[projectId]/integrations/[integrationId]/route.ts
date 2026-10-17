export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; integrationId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId, integrationId } = await params;
    const integration = await prisma.thirdPartyIntegration.findFirst({
      where: { id: integrationId, projectId },
    });
    if (!integration) return error("Integration not found", 404);
    return json(integration);
  } catch {
    return error("Failed to fetch integration", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; integrationId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId, integrationId } = await params;
    const { type, name, config, isEnabled } = await req.json();

    const integration = await prisma.thirdPartyIntegration.update({
      where: { id: integrationId, projectId },
      data: { type, name, config, isEnabled },
    });
    return json(integration);
  } catch {
    return error("Failed to update integration", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; integrationId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId, integrationId } = await params;
    await prisma.thirdPartyIntegration.delete({
      where: { id: integrationId, projectId },
    });
    return json({ success: true });
  } catch {
    return error("Failed to delete integration", 500);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; integrationId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { projectId, integrationId } = await params;
    const integration = await prisma.thirdPartyIntegration.findFirst({
      where: { id: integrationId, projectId },
    });
    if (!integration) return error("Integration not found", 404);

    if (integration.type === "POSTMAN") {
      await syncPostmanCollection(integration);
    }

    const updated = await prisma.thirdPartyIntegration.update({
      where: { id: integrationId, projectId },
      data: { lastSyncedAt: new Date() },
    });
    return json(updated);
  } catch {
    return error("Failed to sync integration", 500);
  }
}

async function syncPostmanCollection(integration: any) {
  const config = integration.config as any;
  const apiKey = config.apiKey;
  const collectionId = config.collectionId;
  if (!apiKey || !collectionId) return;

  // Fetch Postman collection via API
  const res = await fetch(`https://api.getpostman.com/collections/${collectionId}`, {
    headers: { "X-Api-Key": apiKey },
  });
  if (!res.ok) return;

  const data = await res.json();
  const collection = data.collection;

  // Update integration config with synced data
  await prisma.thirdPartyIntegration.update({
    where: { id: integration.id },
    data: {
      config: {
        ...config,
        syncedAt: new Date().toISOString(),
        itemCount: collection.item?.length ?? 0,
      },
    },
  });
}

export async function generateStaticParams() {
  return [];
}
