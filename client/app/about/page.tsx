'use client';

import { useTheme } from '@/context/ThemeContext';
import Header from '@/components/Header';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function About() {
  const { isDarkMode } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            About Us
          </h1>

          <div className="space-y-12">
            <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We are dedicated to revolutionizing financial document analysis through advanced AI technology. Our platform aims to make financial data more accessible, understandable, and actionable for both individuals and organizations.
              </p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Meet the Developers
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src="/images/lucky.jpg"
                      alt="Lucky"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Lucky
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Full Stack Developer
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Specializing in AI integration and backend development
                  </p>
                </div>

                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src="/images/tanishk.jpg"
                      alt="Tanishk"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Tanishk
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Frontend Developer
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Expert in React and modern web technologies
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Our Technology Stack
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Next.js</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">React Framework</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">TypeScript</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type Safety</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Tailwind CSS</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Styling</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Clerk</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Authentication</p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Get in Touch
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We'd love to hear from you! Whether you have questions about our platform or need assistance, our team is here to help.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/contact"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="/documentation"
                  className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  View Documentation
                </a>
                <a
                  href="/dashboard"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 