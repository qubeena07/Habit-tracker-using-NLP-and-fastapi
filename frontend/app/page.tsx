// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchHabits, parseHabit } from '@/lib/api';
import { HabitRecord } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Protect the route and load initial data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchHabits();
        // Sort habits so the newest appear at the top
        setHabits(data.sort((a, b) => b.id - a.id));
      } catch (err) {
        console.error(err);
        setError('Failed to load habits. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // 2. Handle the NLP text submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSubmitLoading(true);
    try {
      const newHabit = await parseHabit(inputText);
      // Add the new parsed habit to the top of the UI list instantly
      setHabits([newHabit, ...habits]);
      setInputText(''); // Clear the input field
    } catch (err) {
      console.error(err);
      alert('Failed to process habit. Ensure your text makes sense!');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">NLP Habit Tracker</h1>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-3xl mx-auto mt-10 px-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}

        {/* The NLP Input Section */}
        <section className="bg-white p-6 rounded-xl shadow-md mb-10">
          <h2 className="text-lg font-semibold mb-2">Log your activity naturally</h2>
          <p className="text-sm text-gray-500 mb-4">
            Try typing: "Ate 3 eggs and a bowl of oats" or "Ran for 5 miles"
          </p>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What did you do today?"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading}
            />
            <button
              type="submit"
              disabled={submitLoading || !inputText.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {submitLoading ? 'Parsing...' : 'Log It'}
            </button>
          </form>
        </section>

        {/* The Parsed Data Display Section */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Your Structured Habits</h3>
          {habits.length === 0 ? (
            <p className="text-gray-500 italic">No habits logged yet. Start typing above!</p>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => (
                <div key={habit.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                      {habit.parsed_category.split('-')[0]} {/* Shows just 'Diet/Nutrition' or 'Fitness' */}
                    </span>
                    <p className="text-lg font-medium text-gray-800">
                      {habit.parsed_category.includes('-') ? habit.parsed_category.split('-')[1].trim() : habit.parsed_category}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Original input: "{habit.user_input}"
                    </p>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                    <span className="block text-2xl font-bold text-blue-700">{habit.quantity}</span>
                    <span className="text-xs text-blue-500 uppercase font-semibold">Qty</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}