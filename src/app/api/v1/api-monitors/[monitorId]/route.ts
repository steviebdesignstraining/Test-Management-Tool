import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ monitorId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { monitorId } = await params;
    const monitor = await prisma.apiMonitor.findUnique({
      where: { id: monitorId },
      include: {
        endpoint: { select: { id: true, name: true, method: true, url: true } },
        runs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!monitor) return error("API monitor not found", 404);
    return json(monitor);
  } catch {
    return error("Failed to fetch API monitor", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ monitorId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { monitorId } = await params;
    const { name, endpointId, schedule, isEnabled, assertions } = await req.json();

    const monitor = await prisma.apiMonitor.update({
      where: { id: monitorId },
      data: {
        name,
        endpointId: endpointId || null,
        schedule,
        isEnabled,
        assertions,
      },
    });
    return json(monitor);
  } catch {
    return error("Failed to update API monitor", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ monitorId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { monitorId } = await params;
    await prisma.apiMonitor.delete({ where: { id: monitorId } });
    return json({ success: true });
  } catch {
    return error("Failed to delete API monitor", 500);
  }
}
