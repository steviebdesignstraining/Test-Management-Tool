import { prisma } from "@/lib/prisma";
import { json, error } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { createSession, generateToken, rateLimit, auditLog, getClientIp } from "@/lib/auth";
import { sendEmail, verificationEmailHtml, verificationEmailText } from "@/lib/email";
import { sanitizeInput, validateEmail, validatePassword, FIELD_LIMITS } from "@/lib/validation";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`register:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 });
  if (!limit.allowed) {
    return error("Too many requests. Try again later.", 429);
  }

  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return error("Email and password are required", 400);
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid && emailCheck.error) {
      return error(emailCheck.error, 400);
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid && passwordCheck.error) {
      return error(passwordCheck.error, 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: sanitizeInput(String(email)).toLowerCase() } });
    if (existing) {
      return error("User already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: sanitizeInput(String(email)).toLowerCase().slice(0, FIELD_LIMITS.email),
        name: name ? sanitizeInput(String(name)).slice(0, FIELD_LIMITS.title) : undefined,
        passwordHash,
      },
    });

    const token = await createSession(user.id, user.role);

    const verification = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: generateToken(),
        expires: new Date(Date.now() + VERIFY_TTL_MS),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your email address",
      html: verificationEmailHtml(verification.token, baseUrl),
      text: verificationEmailText(verification.token, baseUrl),
    });

    await auditLog({
      userId: user.id,
      action: "USER.REGISTER",
      entity: "User",
      entityId: user.id,
      metadata: { email: sanitizeInput(String(email)), emailSent: emailResult.ok },
      ip,
    });

    return json(
      {
        user: { id: user.id, email: user.email, name: user.name },
        emailVerified: false,
        verificationSent: emailResult.ok,
        emailError: emailResult.ok ? undefined : emailResult.error,
        sessionToken: token,
      },
      201,
    );
  } catch (err) {
    console.error("Register error:", err);
    return error("Registration failed", 500);
  }
}
