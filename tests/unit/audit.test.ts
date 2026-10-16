import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/auth";

describe("auditLog (database-backed)", () => {
  let actorId: string;

  beforeAll(async () => {
    // Use an existing test user; create one deterministically if missing.
    let user = await prisma.user.findFirst({ where: { email: "audit-unit@example.com" } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "audit-unit@example.com",
          name: "Audit Unit",
          passwordHash: "x",
        },
      });
    }
    actorId = user.id;
  });

  afterAll(async () => {
    // Clean up audit log records created by this test suite.
    await prisma.auditLog.deleteMany({
      where: { action: "UNIT.TEST_ACTION" },
    });
    await prisma.user.deleteMany({
      where: { email: "audit-unit@example.com" },
    });
    await prisma.$disconnect();
  });

  it("writes an audit record with the provided fields", async () => {
    await auditLog({
      userId: actorId,
      action: "UNIT.TEST_ACTION",
      entity: "TestEntity",
      entityId: "entity-123",
      metadata: { key: "value", count: 5 },
      ip: "127.0.0.1",
      userAgent: "vitest/1.0",
    });

    const record = await prisma.auditLog.findFirst({
      where: { action: "UNIT.TEST_ACTION", userId: actorId },
      orderBy: { createdAt: "desc" },
    });

    expect(record).not.toBeNull();
    expect(record?.action).toBe("UNIT.TEST_ACTION");
    expect(record?.entity).toBe("TestEntity");
    expect(record?.entityId).toBe("entity-123");
    expect(record?.userId).toBe(actorId);
    expect(record?.ip).toBe("127.0.0.1");
    expect(record?.userAgent).toBe("vitest/1.0");
    expect(record?.metadata).toMatchObject({ key: "value", count: 5 });
  });

  it("does not break the caller when the DB write fails", async () => {
    // auditLog swallows errors; calling it with a bad userId still resolves.
    await expect(
      auditLog({
        action: "UNIT.TEST_ACTION",
        userId: "does-not-exist",
      }),
    ).resolves.toBeUndefined();
  });
});
