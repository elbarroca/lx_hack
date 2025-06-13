// This file creates a singleton instance of the Prisma client
// to prevent multiple connections from being created in serverless environments.
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
} 