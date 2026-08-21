import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "test@levelup.com";
  const password = "test1234";
  const name = "Test User";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", email);
    return;
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: new Date(),
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      type: "credentials",
      provider: "email",
      providerAccountId: email,
      access_token: hashedPassword,
    },
  });

  console.log("Created test user:");
  console.log("  Email:", email);
  console.log("  Password:", password);
  console.log("  User ID:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
