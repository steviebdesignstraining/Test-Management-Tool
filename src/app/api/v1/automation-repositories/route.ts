import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const where = projectId ? { projectId } : {};

  const items = await prisma.$queryRawUnsafe(
    `SELECT * FROM "public"."AutomationRepository" WHERE ${projectId ? '"projectId" = $1' : "true"} LIMIT 50`,
    projectId
  );
  return json(items);
}

export async function POST() {
  return json({ message: "Automation repository registration endpoint" }, 201);
}
