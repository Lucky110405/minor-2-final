import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { filename } = params;
    const path = join(process.cwd(), 'public', 'reports', filename);

    try {
      const content = await readFile(path, 'utf-8');
      return new NextResponse(content);
    } catch (error) {
      return new NextResponse('Report not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 