import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    const collection = await prisma.apiCollection.findUnique({
      where: { id: collectionId },
      include: {
        endpoints: { orderBy: { name: "asc" } },
        monitors: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!collection) return error("API collection not found", 404);
    return json(collection);
  } catch {
    return error("Failed to fetch API collection", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    const { name, description, source, externalId, externalUrl } = await req.json();

    const collection = await prisma.apiCollection.update({
      where: { id: collectionId },
      data: {
        name,
        description,
        source,
        externalId,
        externalUrl,
      },
    });
    return json(collection);
  } catch {
    return error("Failed to update API collection", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ collectionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { collectionId } = await params;
    await prisma.apiCollection.delete({
      where: { id: collectionId },
    });
    return json({ success: true });
  } catch {
    return error("Failed to delete API collection", 500);
  }
}
