export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { runId } = await params;
    const run = await prisma.apiMonitorRun.findUnique({
      where: { id: runId },
      include: {
        results: { include: { endpoint: true } },
        monitor: { select: { id: true, name: true } },
      },
    });
    if (!run) return error("Monitor run not found", 404);
    return json(run);
  } catch {
    return error("Failed to fetch monitor run", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
