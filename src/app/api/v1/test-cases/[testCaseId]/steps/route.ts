import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  const { testCaseId } = await params;
  const steps = await prisma.testStep.findMany({
    where: { testCaseId },
    orderBy: { position: "asc" },
  });
  return json(steps);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string }> }
) {
  try {
    const { testCaseId } = await params;
    const { action, expectedResult, data, position } = await req.json();
    const step = await prisma.testStep.create({
      data: { testCaseId, action, expectedResult, data, position },
    });
    return json(step, 201);
  } catch {
    return error("Failed to create step", 500);
  }
}
