import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    ensureUploadDir();
    const attachments = await prisma.attachment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { uploadedBy: { select: { id: true, email: true, name: true } } },
    });
    return json(attachments);
  } catch {
    return error("Failed to load attachments", 500);
  }
}

export async function POST(req: Request) {
  try {
    ensureUploadDir();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const testCaseId = (formData.get("testCaseId") as string) || undefined;
    const uploadedById = (formData.get("uploadedById") as string) || undefined;

    if (!file) {
      return error("No file provided", 400);
    }
    if (!uploadedById) {
      return error("uploadedById is required", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`;
    const path = join(UPLOAD_DIR, filename);
    writeFileSync(path, buffer);

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: buffer.length,
        path,
        uploadedById,
        testCaseId: testCaseId ?? null,
      },
      include: { uploadedBy: { select: { id: true, email: true, name: true } } },
    });

    return json(attachment, 201);
  } catch {
    return error("Attachment upload failed", 500);
  }
}
