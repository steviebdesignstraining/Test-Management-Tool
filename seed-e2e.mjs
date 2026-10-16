import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  let org = await prisma.organisation.findFirst();
  if (!org) {
    org = await prisma.organisation.create({ data: { name: "Acme Corp" } });
  }
  console.log("Organisation:", org.id);

  let user = await prisma.user.findUnique({
    where: { email: "tester@example.com" },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "tester@example.com",
        name: "Test Tester",
        emailVerified: new Date(),
        passwordHash:
          "$2b$10$zXLY1YlMu6gHfEmgQtaeUuKUT/IevbnzJdIr79ttwQNogscKg7xbS",
      },
    });
    console.log("Created test user: tester@example.com / testpass123 (verified)");
  } else if (!user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
    console.log("Verified existing test user: tester@example.com");
  } else {
    console.log("Test user already exists:", user.id);
  }

  let alice = await prisma.user.findUnique({
    where: { email: "alice@example.com" },
  });
  if (!alice) {
    alice = await prisma.user.create({
      data: {
        email: "alice@example.com",
        name: "Alice Rivera",
        emailVerified: new Date(),
        passwordHash:
          "$2b$10$zXLY1YlMu6gHfEmgQtaeUuKUT/IevbnzJdIr79ttwQNogscKg7xbS",
      },
    });
    console.log("Created alice@example.com (verified)");
  } else if (!alice.emailVerified) {
    await prisma.user.update({
      where: { id: alice.id },
      data: { emailVerified: new Date() },
    });
    console.log("Verified existing alice@example.com");
  } else {
    console.log("Alice already exists:", alice.id);
  }

  let proj = await prisma.project.findFirst({ where: { name: "Checkout Web" } });
  if (!proj) {
    proj = await prisma.project.create({
      data: {
        name: "Checkout Web",
        description: "Primary web app",
        organisationId: org.id,
      },
    });
  }
  console.log("Project:", proj.id);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
