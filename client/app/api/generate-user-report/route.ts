import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data from request
    const formData = await req.formData();
    
    // Add user_id to the form data
    formData.append('user_id', userId);
    
    // Forward to Flask backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/generate-user-financial-report`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${errorText}`);
      return NextResponse.json(
        { error: `Failed to generate report: Server responded with ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Check if report was successfully generated by backend
    if (data.success && data.report_path) {
      // Extract filename from the path
      const filename = data.report_path.split('/').pop();
      
      console.log(`Report successfully generated by backend: ${data.report_path}`);
      
      return NextResponse.json({
        success: true,
        filename,
        report_path: data.report_path,
        message: 'Report generated successfully'
      });
    } else {
      console.error('Backend did not return success or report_path');
      return NextResponse.json({
        success: false,
        error: 'Report generation failed on the server'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in generate-user-report API:', error);
    return NextResponse.json(
      { error: 'Failed to generate report due to an unexpected error' },
      { status: 500 }
    );
  }
}