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

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `data-report-${timestamp}.pdf`;

    // Create a sample PDF report (you would replace this with your actual report generation logic)
    const reportContent = `Data Report generated at ${new Date().toISOString()}`;
    
    // Save the report
    const path = join(process.cwd(), 'public', 'reports', filename);
    await writeFile(path, reportContent);

    return NextResponse.json({ 
      success: true, 
      filename,
      message: 'Data report generated successfully' 
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 