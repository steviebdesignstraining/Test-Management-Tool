import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!verification) {
    return error("Invalid verification token", 404);
  }
  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: verification.id } });
    return error("Verification token has expired", 410);
  }

  const user = await prisma.user.findUnique({ where: { email: verification.identifier } });
  if (!user) {
    return error("Account not found", 404);
  }
  if (user.emailVerified) {
    await prisma.verificationToken.delete({ where: { id: verification.id } });
    return json({ message: "Email already verified." });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { id: verification.id } });

  return json({ message: "Email verified successfully. You can sign in." });
}
