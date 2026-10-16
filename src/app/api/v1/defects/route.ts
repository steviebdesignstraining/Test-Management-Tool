import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput } from "@/lib/validation";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const where = projectId ? { testCase: { projectId } } : {};

  const [items, total] = await Promise.all([
    prisma.defect.findMany({ skip, take: pageSize, where, include: { testCase: true, testExecution: true } }),
    prisma.defect.count({ where }),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const { title, description, testCaseId, reporterId, severity, priority, externalTicketId, externalTicketUrl } = await req.json();
    if (!title || !reporterId) return error("Title and reporterId required", 400);

    const defect = await prisma.defect.create({
      data: {
        title: sanitizeInput(String(title)),
        description: description ? sanitizeInput(String(description)) : undefined,
        testCaseId,
        reporterId,
        severity,
        priority,
        externalTicketId: externalTicketId ? sanitizeInput(String(externalTicketId)) : null,
        externalTicketUrl: externalTicketUrl ? sanitizeInput(String(externalTicketUrl)) : null,
      },
    });
    return json(defect, 201);
  } catch {
    return error("Failed to create defect", 500);
  }
}
