import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  try {
    const { requirementId } = await params;
    const { testCaseId } = await _req.json();
    if (!testCaseId) {
      return error("testCaseId is required", 400);
    }

    const link = await prisma.requirementTestCase.create({
      data: { requirementId, testCaseId },
      include: { testCase: true },
    });
    return json(link, 201);
  } catch {
    return error("Failed to link test case", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  try {
    const { requirementId } = await params;
    const { searchParams } = new URL(_req.url);
    const testCaseId = searchParams.get("testCaseId");
    if (!testCaseId) {
      return error("testCaseId is required", 400);
    }

    await prisma.requirementTestCase.delete({
      where: { requirementId_testCaseId: { requirementId, testCaseId } },
    });
    return json({ ok: true });
  } catch {
    return error("Failed to unlink test case", 500);
  }
}
