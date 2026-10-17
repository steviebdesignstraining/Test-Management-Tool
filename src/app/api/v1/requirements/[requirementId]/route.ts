export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  const { requirementId } = await params;
  const requirement = await prisma.requirement.findUnique({
    where: { id: requirementId },
    include: { project: true, owner: true, testCases: { include: { testCase: true } }, acceptanceCriteria: { orderBy: { position: "asc" } } },
  });
  if (!requirement) return error("Requirement not found", 404);
  return json(requirement);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  try {
    const { requirementId } = await params;
    const body = await req.json();
    const requirement = await prisma.requirement.update({
      where: { id: requirementId },
      data: body,
      include: { project: true, owner: true },
    });
    return json(requirement);
  } catch {
    return error("Failed to update requirement", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ requirementId: string }> }
) {
  const { requirementId } = await params;
  await prisma.requirement.delete({ where: { id: requirementId } });
  return json({ ok: true });
}

export async function generateStaticParams() {
  return [];
}
