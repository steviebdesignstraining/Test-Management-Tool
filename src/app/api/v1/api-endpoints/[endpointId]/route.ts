export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ endpointId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { endpointId } = await params;
    const endpoint = await prisma.apiEndpoint.findUnique({
      where: { id: endpointId },
      include: { collection: { select: { id: true, name: true, projectId: true } } },
    });
    if (!endpoint) return error("API endpoint not found", 404);
    return json(endpoint);
  } catch {
    return error("Failed to fetch API endpoint", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ endpointId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { endpointId } = await params;
    const { name, method, url, headers, queryParams, body, authType, authConfig, timeout, expectedStatusCode } = await req.json();

    const endpoint = await prisma.apiEndpoint.update({
      where: { id: endpointId },
      data: {
        name,
        method,
        url,
        headers,
        queryParams,
        body,
        authType,
        authConfig,
        timeout,
        expectedStatusCode,
      },
    });
    return json(endpoint);
  } catch {
    return error("Failed to update API endpoint", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ endpointId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { endpointId } = await params;
    await prisma.apiEndpoint.delete({ where: { id: endpointId } });
    return json({ success: true });
  } catch {
    return error("Failed to delete API endpoint", 500);
  }
}
