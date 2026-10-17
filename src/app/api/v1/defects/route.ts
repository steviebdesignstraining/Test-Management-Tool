export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { withAuth, requireProjectAccess } from "@/lib/session";
import { sanitizeInput } from "@/lib/validation";

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    if (!projectId) {
      return error("projectId query parameter is required", 400);
    }
    await requireProjectAccess(user.id, projectId);

    const where = { testCase: { projectId } };

    const [items, total] = await Promise.all([
      prisma.defect.findMany({
        skip,
        take: pageSize,
        where,
        include: { testCase: true, testExecution: true },
      }),
      prisma.defect.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    try {
      const { title, description, testCaseId, reporterId, severity, priority, externalTicketId, externalTicketUrl, projectId } = await req.json();
      if (!title) {
        return error("Title is required", 400);
      }
      if (!projectId) {
        return error("projectId is required", 400);
      }

      await requireProjectAccess(user.id, projectId);

      const effectiveReporterId = reporterId || user.id;
      if (effectiveReporterId !== user.id) {
        await requireProjectAccess(effectiveReporterId, projectId);
      }

      if (testCaseId) {
        const testCase = await prisma.testCase.findUnique({
          where: { id: testCaseId },
          select: { id: true, projectId: true },
        });
        if (!testCase || testCase.projectId !== projectId) {
          return error("testCaseId does not belong to the specified project", 400);
        }
      }

      const defect = await prisma.defect.create({
        data: {
          title: sanitizeInput(String(title)),
          description: description ? sanitizeInput(String(description)) : null,
          testCaseId: testCaseId || null,
          reporterId: effectiveReporterId,
          severity: severity || "MEDIUM",
          priority: priority || "MEDIUM",
          externalTicketId: externalTicketId ? sanitizeInput(String(externalTicketId)) : null,
          externalTicketUrl: externalTicketUrl ? sanitizeInput(String(externalTicketUrl)) : null,
        },
      });
      return json(defect, 201);
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to create defect";
      if (status >= 500) console.error("POST /defects error:", err);
      return error(message, status);
    }
  });
}