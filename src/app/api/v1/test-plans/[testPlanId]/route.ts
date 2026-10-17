export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testPlanId: string }> }
) {
  const { testPlanId } = await params;
  const plan = await prisma.testPlan.findUnique({
    where: { id: testPlanId },
    include: { suites: { include: { cases: { include: { testCase: true } } } } },
  });
  if (!plan) return error("Test plan not found", 404);
  return json(plan);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testPlanId: string }> }
) {
  try {
    const body = await req.json();
    const { testPlanId } = await params;
    const plan = await prisma.testPlan.update({ where: { id: testPlanId }, data: body });
    return json(plan);
  } catch {
    return error("Failed to update test plan", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ testPlanId: string }> }
) {
  const { testPlanId } = await params;
  await prisma.testPlan.delete({ where: { id: testPlanId } });
  return json({ ok: true });
}
