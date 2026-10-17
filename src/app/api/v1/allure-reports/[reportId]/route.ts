export const revalidate = 0;
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { reportId } = await params;
    const report = await prisma.allureReport.findUnique({
      where: { id: reportId },
      include: { ciRun: true },
    });
    if (!report) return error("Allure report not found", 404);
    return json(report);
  } catch {
    return error("Failed to fetch Allure report", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { reportId } = await params;
    const { name, url, totalTests, passedTests, failedTests, brokenTests, skippedTests, duration, resultsJson } = await req.json();

    const report = await prisma.allureReport.update({
      where: { id: reportId },
      data: { name, url, totalTests, passedTests, failedTests, brokenTests, skippedTests, duration, resultsJson },
    });
    return json(report);
  } catch {
    return error("Failed to update Allure report", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { reportId } = await params;
    await prisma.allureReport.delete({ where: { id: reportId } });
    return json({ success: true });
  } catch {
    return error("Failed to delete Allure report", 500);
  }
}

export async function generateStaticParams() {
  return [];
}
