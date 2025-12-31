// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Allows reusing the same Prisma client across hot‑module reloads in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Export a single PrismaClient instance
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Optional: log queries in development for debugging
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
