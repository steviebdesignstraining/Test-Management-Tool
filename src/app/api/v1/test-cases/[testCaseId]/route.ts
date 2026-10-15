import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  const { testCaseId } = await params;
  const testCase = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    include: { steps: { orderBy: { position: "asc" } }, executions: true },
  });
  if (!testCase) return error("Test case not found", 404);
  return json(testCase);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  try {
    const body = await req.json();
    const { testCaseId } = await params;
    const testCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data: body,
    });
    return json(testCase);
  } catch {
    return error("Failed to update test case", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  const { testCaseId } = await params;
  await prisma.testCase.delete({ where: { id: testCaseId } });
  return json({ ok: true });
}
