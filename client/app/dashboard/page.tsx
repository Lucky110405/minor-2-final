'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";
import Header from '@/components/Header';
import { Loader2 } from "lucide-react";

type AccountType = 'user' | 'organization';

interface AccountOption {
  type: AccountType;
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  path: string;
}

const accountOptions: AccountOption[] = [
  {
    type: 'user',
    title: 'User Account',
    description: 'Perfect for individual users managing personal finances',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    path: '/user-dashboard'
  },
  {
    type: 'organization',
    title: 'Organization Account',
    description: 'Ideal for businesses and teams managing collective finances',
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
    path: '/org-dashboard'
  }
];

export default function DashboardDetail() {
  const router = useRouter();
  const { isLoaded, userId, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else if (userId) {
        // Fetch user data here
        setUser({
          name: 'User', // Replace with actual user data
          email: 'user@example.com', // Replace with actual user data
        });
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const handleAccountSelect = async (path: string) => {
    setIsLoading(true);
    try {
      await router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
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
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Choose your account type
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Select the type of account that best suits your needs
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {accountOptions.map((option) => (
              <button 
                key={option.type}
                className={`
                  p-6 rounded-lg ${option.color} ${option.hoverColor} transition-all
                  transform hover:scale-105 text-white text-left
                  flex flex-col space-y-2 disabled:opacity-50
                `}
                onClick={() => handleAccountSelect(option.path)}
                disabled={isLoading}
              >
                <span className="text-xl font-semibold">{option.title}</span>
                <span className="text-sm opacity-90">{option.description}</span>
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}