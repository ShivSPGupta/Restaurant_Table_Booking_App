import prisma from "../lib/prisma";
import type { UserRecord, UserRepository } from "../types/user";

type PrismaUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  createdAt: Date;
};

function mapUser(user: PrismaUser): UserRecord {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };
}

function createPrismaUserRepository(): UserRepository {
  async function findByEmail(email: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? mapUser(user) : null;
  }

  async function create(user: UserRecord): Promise<UserRecord> {
    const createdUser = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        passwordHash: user.passwordHash,
        createdAt: new Date(user.createdAt),
      },
    });

    return mapUser(createdUser);
  }

  return {
    findByEmail,
    create,
  };
}

export default createPrismaUserRepository;
