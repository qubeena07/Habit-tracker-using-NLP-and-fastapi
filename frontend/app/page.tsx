'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchHabits, parseHabit } from '@/lib/api';
import { HabitRecord } from '@/types';
import { Activity, Apple, Dumbbell, Send, LogOut, Loader2, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchHabits();
        setHabits(data.sort((a, b) => b.id - a.id));
      } catch (err) {
        setNotification({ type: 'error', msg: 'Failed to load habits. Please log in again.' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSubmitLoading(true);
    setNotification(null);
    try {
      const newHabit = await parseHabit(inputText);
      setHabits([newHabit, ...habits]);
      setInputText('');
      setNotification({ type: 'success', msg: 'Habit logged successfully!' });
      setTimeout(() => setNotification(null), 3000); // Clear toast after 3s
    } catch (err) {
      setNotification({ type: 'error', msg: 'Could not parse habit. Try rephrasing!' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('diet')) return <Apple className="w-5 h-5 text-emerald-500" />;
    if (category.toLowerCase().includes('fitness')) return <Dumbbell className="w-5 h-5 text-indigo-500" />;
    return <Activity className="w-5 h-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            OnTrack AI
          </h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </nav>

      <main className="max-w-3xl mx-auto mt-10 px-4 pb-20">
        {/* Notification Toast */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm transition-all ${
            notification.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            <Activity className="w-5 h-5" />
            <p className="font-medium text-sm">{notification.msg}</p>
          </div>
        )}

        {/* Input Section */}
        <section className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-10 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., Ran 5 miles and ate 3 eggs..."
              className="flex-1 px-5 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400"
              disabled={submitLoading}
            />
            <button
              type="submit"
              disabled={submitLoading || !inputText.trim()}
              className="m-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline">Log Entry</span>
            </button>
          </form>
        </section>

        {/* Data Display Section */}
        <section>
          <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
            Recent Activity
          </h3>
          
          {habits.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-slate-700 font-semibold mb-2">No habits logged yet</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">Use natural language to tell the AI what you did today. We'll handle the parsing.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const isDiet = habit.parsed_category.toLowerCase().includes('diet');
                const categoryLabel = habit.parsed_category.split('-')[0].trim();
                const itemsStr = habit.parsed_category.includes('-') ? habit.parsed_category.split('-')[1].trim() : '';

                return (
                  <div key={habit.id} className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isDiet ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                        {getCategoryIcon(habit.parsed_category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isDiet ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {categoryLabel}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium">{itemsStr || habit.user_input}</p>
                        <p className="text-slate-400 text-xs mt-1 font-mono">"{habit.user_input}"</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-black text-slate-700">{habit.quantity}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Qty</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}