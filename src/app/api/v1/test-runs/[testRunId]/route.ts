export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ testRunId: string }> }
) {
  const { testRunId } = await params;
  const run = await prisma.testExecution.findUnique({ where: { id: testRunId } });
  if (!run) return error("Test run not found", 404);
  return json(run);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ testRunId: string }> }
) {
  try {
    const body = await req.json();
    const { testRunId } = await params;
    const run = await prisma.testExecution.update({ where: { id: testRunId }, data: body });
    return json(run);
  } catch {
    return error("Failed to update test run", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
