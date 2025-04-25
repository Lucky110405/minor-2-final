'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Loader2, TrendingUp, Newspaper, HelpCircle } from 'lucide-react';

interface StockData {
  symbol: string;
  current_price: number;
  previous_close: number;
  day_high: number;
  day_low: number;
  volume: number;
  timestamp: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  published_at: string;
}

interface FAQAnswer {
  question: string;
  answer: string;
  category: string;
}

export default function RealTimeQueries() {
  const { isDarkMode } = useTheme();
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState<FAQAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStockData = async (symbol: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/stock/${symbol}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/news?query=finance&limit=5');
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setNews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFAQ = async (question: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/faq?question=${encodeURIComponent(question)}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFaqAnswer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQ answer');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Real-Time Market Insights
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Get instant access to stock prices, market news, and financial FAQs
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 ${isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} rounded-md`}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stock Price Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stock Prices</h2>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <button
              onClick={() => fetchStockData(selectedSymbol)}
              disabled={!selectedSymbol || isLoading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Get Stock Data'}
            </button>
            {stockData && (
              <div className="mt-4 space-y-2">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Current Price: ${stockData.current_price}
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Previous Close: ${stockData.previous_close}
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Day High: ${stockData.day_high}
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Day Low: ${stockData.day_low}
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Volume: {stockData.volume.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Market News Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center mb-4">
              <Newspaper className="h-6 w-6 text-green-500 mr-2" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Market News</h2>
            </div>
            <button
              onClick={fetchNews}
              disabled={isLoading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Refresh News'}
            </button>
            <div className="space-y-4">
              {news.map((article, index) => (
                <div key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{article.title}</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2`}>{article.description}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Read more
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Financial FAQs</h2>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Ask a financial question"
                className={`w-full px-4 py-2 rounded-md border ${
                  isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <button
              onClick={() => fetchFAQ(faqQuestion)}
              disabled={!faqQuestion || isLoading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Get Answer'}
            </button>
            {faqAnswer && (
              <div className="mt-4">
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">Q: </span>
                  {faqAnswer.question}
                </p>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  <span className="font-medium">A: </span>
                  {faqAnswer.answer}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  Category: {faqAnswer.category}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 