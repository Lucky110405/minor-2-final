import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { userId } = getAuth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    
    // Save the file
    const path = join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      filename,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 