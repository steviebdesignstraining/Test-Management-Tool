export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string; paramId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { testCaseId, paramId } = await params;
    const parameter = await prisma.testParameter.findFirst({
      where: { id: paramId, testCaseId },
    });
    if (!parameter) return error("Parameter not found", 404);
    return json(parameter);
  } catch {
    return error("Failed to fetch parameter", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testCaseId: string; paramId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { testCaseId, paramId } = await params;
    const { name, value, description, isRequired, position } = await req.json();

    const parameter = await prisma.testParameter.update({
      where: { id: paramId, testCaseId },
      data: {
        name,
        value,
        description,
        isRequired: isRequired !== undefined ? isRequired : undefined,
        position: position !== undefined ? position : undefined,
      },
    });
    return json(parameter);
  } catch {
    return error("Failed to update parameter", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ testCaseId: string; paramId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { testCaseId, paramId } = await params;
    await prisma.testParameter.delete({
      where: { id: paramId, testCaseId },
    });
    return json({ success: true });
  } catch {
    return error("Failed to delete parameter", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
