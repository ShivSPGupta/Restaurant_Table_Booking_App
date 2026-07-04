export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
};

export type UserRecord = User & {
  passwordHash: string;
};

export type RegisterUserRequest = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
};

export type UserRepository = {
  findByEmail: (
    email: string
  ) => Promise<UserRecord | null | undefined> | UserRecord | null | undefined;
  create: (user: UserRecord) => Promise<UserRecord> | UserRecord;
};
