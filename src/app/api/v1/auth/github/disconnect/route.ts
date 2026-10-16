import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-utils";
import { auditLog, getClientIp } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return error("Not authenticated", 401);
  }

  const ip = getClientIp(req);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      githubId: null,
      githubUsername: null,
      githubAccessToken: null,
      githubEmail: null,
    },
  });

  await auditLog({
    userId: user.id,
    action: "USER.GITHUB_DISCONNECT",
    entity: "User",
    entityId: user.id,
    ip,
  });

  const cookieStore = await cookies();
  cookieStore.delete("session");

  return json({ ok: true });
}
