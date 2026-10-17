export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return error("Not authenticated", 401);
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!settings) {
    const created = await prisma.userSettings.create({
      data: { userId: user.id },
    });
    return json({ settings: created });
  }

  return json({ settings });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return error("Not authenticated", 401);
  }

  try {
    const body = await req.json();

    const data: Record<string, unknown> = {};

    if (body.aiEnabled !== undefined) data.aiEnabled = Boolean(body.aiEnabled);
    if (body.autoComplete !== undefined) data.autoComplete = String(body.autoComplete);
    if (body.confidenceThreshold !== undefined)
      data.confidenceThreshold = Math.max(0, Math.min(100, Number(body.confidenceThreshold)));
    if (body.retentionDays !== undefined)
      data.retentionDays = Math.max(1, Number(body.retentionDays));
    if (body.minPassRate !== undefined)
      data.minPassRate = Math.max(0, Math.min(100, Number(body.minPassRate)));
    if (body.blockOnCriticalFailures !== undefined)
      data.blockOnCriticalFailures = Boolean(body.blockOnCriticalFailures);

    const updated = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    return json({ settings: updated });
  } catch (err) {
    console.error("Settings update error:", err);
    return error("Failed to update settings", 500);
  }
}
