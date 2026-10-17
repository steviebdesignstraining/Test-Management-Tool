export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const { executionId } = await params;
  const execution = await prisma.testExecution.findUnique({
    where: { id: executionId },
    include: { stepResults: true },
  });
  if (!execution) return error("Execution not found", 404);
  return json(execution);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ executionId: string }> }
) {
  try {
    const body = await req.json();
    const { executionId } = await params;
    const execution = await prisma.testExecution.update({
      where: { id: executionId },
      data: body,
    });
    return json(execution);
  } catch {
    return error("Failed to update execution", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
