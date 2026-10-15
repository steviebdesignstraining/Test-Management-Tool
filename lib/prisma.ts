import { PrismaClient } from '@prisma/orm-postgres/orm-client';
import { contract } from '../src/prisma/contract';

export const prisma = new PrismaClient({
  contract,
});
