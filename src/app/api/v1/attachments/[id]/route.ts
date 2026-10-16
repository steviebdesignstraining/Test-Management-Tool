import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { existsSync, readFileSync, statSync, unlinkSync } from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      return error("Attachment not found", 404);
    }
    if (!existsSync(attachment.path)) {
      return error("Attachment file is unavailable", 410);
    }

    const stat = statSync(attachment.path);
    const buffer = readFileSync(attachment.path);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(stat.size),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
      },
    });
  } catch {
    return error("Attachment download failed", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      return error("Attachment not found", 404);
    }
    await prisma.attachment.delete({ where: { id } });
    if (existsSync(attachment.path)) {
      unlinkSync(attachment.path);
    }
    return json({ ok: true });
  } catch {
    return error("Attachment deletion failed", 500);
  }
}
