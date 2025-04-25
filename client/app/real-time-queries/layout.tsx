'use client';

import { useTheme } from '@/context/ThemeContext';

export default function RealTimeQueriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 