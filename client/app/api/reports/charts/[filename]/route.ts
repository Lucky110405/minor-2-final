import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

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

    // Here you would typically generate or fetch chart data based on the report
    // For now, we'll return sample data
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Sample Data',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error serving chart data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 