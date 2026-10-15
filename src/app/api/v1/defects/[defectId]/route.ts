import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";


export async function GET(
  _req: Request,
  { params }: { params: Promise<{ defectId: string }> }
) {
  const { defectId } = await params;
  const defect = await prisma.defect.findUnique({ where: { id: defectId } });
  if (!defect) return error("Defect not found", 404);
  return json(defect);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ defectId: string }> }
) {
  try {
    const body = await req.json();
    const { defectId } = await params;
    const defect = await prisma.defect.update({ where: { id: defectId }, data: body });
    return json(defect);
  } catch {
    return error("Failed to update defect", 500);
  }
}
