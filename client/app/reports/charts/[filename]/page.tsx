'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2 } from 'lucide-react';

export default function ReportCharts() {
  const { filename } = useParams();
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else if (filename) {
        // Fetch chart data
        fetch(`/api/reports/charts/${filename}`)
          .then(response => response.json())
          .then(data => {
            setChartData(data);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error fetching chart data:', error);
            setIsLoading(false);
          });
      }
    }
  }, [filename, isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={null} />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Charts: {filename}
            </h1>
            <div className="space-y-8">
              {chartData && (
                <>
                  {/* Add your chart components here */}
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Chart visualization will be displayed here
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 