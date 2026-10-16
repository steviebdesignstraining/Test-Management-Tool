import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ stepResultId: string }> }
) {
  try {
    const { stepResultId } = await params;
    const { status, actualResult } = await req.json();
    const stepResult = await prisma.testStepResult.update({
      where: { id: stepResultId },
      data: { status, actualResult: actualResult ?? null },
    });
    return json(stepResult);
  } catch {
    return error("Failed to update step result", 500);
  }
}
