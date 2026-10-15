import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to count the number of users
    const userCount = await prisma.user.count();
    return NextResponse.json({ message: 'Database connection successful', userCount });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
