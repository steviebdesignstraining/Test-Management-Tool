import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

async function getUserFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) {
    return error("Not authenticated", 401);
  }
  return json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function PATCH(req: Request) {
  const user = await getUserFromRequest();
  if (!user) {
    return error("Not authenticated", 401);
  }
  const { name } = await req.json();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });
  return json({
    user: { id: updated.id, email: updated.email, name: updated.name },
  });
}
