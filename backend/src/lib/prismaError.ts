type PrismaLikeError = {
  code?: string;
  clientVersion?: string;
  meta?: Record<string, unknown>;
};

export function getPrismaErrorDetails(error: unknown): PrismaLikeError | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "clientVersion" in error &&
    "code" in error
  ) {
    const prismaError = error as PrismaLikeError;
    return {
      code: prismaError.code,
      clientVersion: prismaError.clientVersion,
      meta: prismaError.meta,
    };
  }

  return null;
}

export function getPrismaErrorMessage(error: unknown): string | null {
  const details = getPrismaErrorDetails(error);

  if (!details) {
    return null;
  }

  if (details.code === "P2021") {
    return "Database table is missing. Run `npm run db:push` and redeploy the backend.";
  }

  if (details.code === "P2022") {
    return "Database column is missing. Run `npm run db:push` after the latest Prisma schema change.";
  }

  if (details.code === "P1001") {
    return "Cannot reach Supabase database. Check POSTGRES_PRISMA_URL in Vercel.";
  }

  return `Database request failed with Prisma code ${details.code}. Check Supabase connection variables and schema sync.`;
}
