'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2, FileText, BarChart2, ArrowLeft } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export default function GenerateReports() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [reports, setReports] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else if (userId) {
        // Fetch user data
        setUser({
          name: 'User',
          email: 'user@example.com',
        });
        // Fetch reports
        fetchReports();
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const fetchReports = async () => {
    try {
      // This would be replaced with an actual API call to fetch user's reports
      const response = await fetch('/api/user-reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleGenerateReport = async (type: 'data' | 'stock') => {
    setIsLoading(true);
    setGenerationStatus(`Generating ${type} report...`);
    
    try {
      const response = await fetch(`/api/generate-${type}-report`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(prev => [...prev, data.filename]);
        setGenerationStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
      } else {
        setGenerationStatus(`Failed to generate ${type} report. Please try again.`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setGenerationStatus(`Failed to generate ${type} report. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            Generate Reports
          </h1>

          {/* Report Generation Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Generate New Report
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => handleGenerateReport('data')}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={isLoading}
                >
                  <FileText className="h-5 w-5" />
                  <span>Data Report</span>
                </button>
                <button
                  onClick={() => handleGenerateReport('stock')}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={isLoading}
                >
                  <BarChart2 className="h-5 w-5" />
                  <span>Stock Report</span>
                </button>
              </div>
              {generationStatus && (
                <p className={`text-sm ${generationStatus.includes('successfully') ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {generationStatus}
                </p>
              )}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Generating report...</span>
                </div>
              )}
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Your Generated Reports
            </h2>
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{report}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/reports/${report}`)}
                        className="px-3 py-1 text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/reports/charts/${report}`)}
                        className="px-3 py-1 text-green-600 hover:text-green-700"
                      >
                        Charts
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No reports generated yet. Generate a report to get started.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 