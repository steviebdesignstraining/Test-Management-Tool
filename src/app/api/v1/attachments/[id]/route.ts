export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { storageService } from "@/lib/storage";
import { requireUser } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.res;
  try {
    const { id } = await params;
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      return error("Attachment not found", 404);
    }
    try {
      const result = await storageService.download(attachment.path);
      return new Response(result.buffer as any, {
        status: 200,
        headers: {
          "Content-Type": attachment.mimeType,
          "Content-Length": String(Buffer.from(result.buffer).length),
          "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
        },
      });
    } catch {
      return error("Attachment file is unavailable", 410);
    }
  } catch {
    return error("Attachment download failed", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (!auth.ok) return auth.res;
  try {
    const { id } = await params;
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      return error("Attachment not found", 404);
    }
    await prisma.attachment.delete({ where: { id } });
    try {
      await storageService.delete(attachment.path);
    } catch {
      // Ignore delete errors
    }
    return json({ ok: true });
  } catch {
    return error("Attachment deletion failed", 500);
  }
}
