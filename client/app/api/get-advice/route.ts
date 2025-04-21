import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { query, documentId } = body;

    if (!query || !documentId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Here you would typically:
    // 1. Fetch the document content
    // 2. Process it with your AI model
    // 3. Generate advice based on the query and document content

    // For now, we'll return a simulated response
    const advice = {
      summary: "Based on your financial documents, here's my advice...",
      recommendations: [
        "Consider diversifying your investment portfolio",
        "Review your monthly expenses",
        "Look into tax optimization strategies"
      ],
      risks: [
        "Market volatility may affect your investments",
        "Current interest rates might impact your savings"
      ],
      nextSteps: [
        "Schedule a review of your investment strategy",
        "Update your budget plan",
        "Consult with a financial advisor"
      ]
    };

    return NextResponse.json(advice);
  } catch (error) {
    console.error('Error in get-advice:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 