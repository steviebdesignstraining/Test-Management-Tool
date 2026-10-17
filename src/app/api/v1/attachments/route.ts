export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { storageService } from "@/lib/storage";
import { requireUser } from "@/lib/api-auth";


const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
  ".pdf", ".json", ".zip", ".md", ".csv", ".txt",
  ".log", ".xml", ".yaml", ".yml",
]);
const ALLOWED_MIME_PREFIXES = ["image/", "application/pdf", "application/json", "application/zip", "application/xml", "text/", "application/x-yaml", "application/x-gzip"];
const DANGEROUS_EXTENSIONS = new Set([".exe", ".bat", ".cmd", ".com", ".sh", ".ps1", ".vbs", ".js", ".jar", ".msi", ".scr", ".pif"]);



function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function isSafeFile(file: File): string | null {
  const ext = getExtension(file.name);
  if (DANGEROUS_EXTENSIONS.has(ext)) return `File type "${ext}" is not allowed`;
  if (!ALLOWED_EXTENSIONS.has(ext) && file.type) {
    if (!ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      return `File type "${file.type}" is not allowed`;
    }
  }
  return null;
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.res;
  try {

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
  const auth = await requireUser();
  if (!auth.ok) return auth.res;
  try {

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
    if (file.size > MAX_FILE_SIZE) {
      return error("File size exceeds 10MB limit", 413);
    }

    const fileCheck = isSafeFile(file);
    if (fileCheck) {
      return error(fileCheck, 400);
    }

    const uploaded = await storageService.upload(file);

    const attachment = await prisma.attachment.create({
      data: {
        filename: uploaded.filename,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: uploaded.size,
        path: uploaded.storagePath,
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
