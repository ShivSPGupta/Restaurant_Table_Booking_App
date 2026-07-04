import fs from "fs";
import path from "path";
import type { UserRecord, UserRepository } from "../types/user";

function createFileUserRepository(dataDir: string): UserRepository {
  const usersFile = path.join(dataDir, "users.json");

  function ensureStorage(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, "[]", "utf8");
    }
  }

  function findAll(): UserRecord[] {
    ensureStorage();

    try {
      const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
      return Array.isArray(users) ? users : [];
    } catch {
      return [];
    }
  }

  function saveAll(users: UserRecord[]): void {
    ensureStorage();
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
  }

  function findByEmail(email: string): UserRecord | undefined {
    return findAll().find((user) => user.email === email);
  }

  function create(user: UserRecord): UserRecord {
    const users = findAll();
    users.push(user);
    saveAll(users);
    return user;
  }

  return {
    findByEmail,
    create,
  };
}

export default createFileUserRepository;
