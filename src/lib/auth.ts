import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// In-memory rate limiter (per identifier): { key: { count, resetAt } }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function createSession(
  userId: string,
  role?: string,
  keepSignedIn = false,
) {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: keepSignedIn ? SESSION_MAX_AGE : undefined,
    path: "/",
  });
  return token;
}

export function generateToken() {
  return randomBytes(32).toString("hex");
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  identifier: string,
  { limit = 5, windowMs = 60 * 1000 }: { limit?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export interface AuditLogInput {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function auditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch {
    // Audit logging must never break the primary request.
  }
}

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return undefined;
}

export { JWT_SECRET, SESSION_MAX_AGE };
