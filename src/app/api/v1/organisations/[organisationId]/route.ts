import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  const { organisationId } = await params;
  const org = await prisma.organisation.findUnique({
    where: { id: organisationId },
  });
  if (!org) return error("Organisation not found", 404);
  return json(org);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  try {
    const body = await req.json();
    const { organisationId } = await params;
    const org = await prisma.organisation.update({
      where: { id: organisationId },
      data: body,
    });
    return json(org);
  } catch {
    return error("Failed to update organisation", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  const { organisationId } = await params;
  await prisma.organisation.delete({ where: { id: organisationId } });
  return json({ ok: true });
}
