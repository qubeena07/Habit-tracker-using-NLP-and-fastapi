'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchHabits, parseHabit } from '@/lib/api';
import { HabitRecord } from '@/types';
import { Activity, Apple, Dumbbell, Send, LogOut, Loader2, Sparkles, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitRecord[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

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
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        router.push('/login');
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
    try {
      const newHabit = await parseHabit(inputText);
      setHabits([newHabit, ...habits]);
      setInputText('');
      toast.success('Activity logged successfully!');
    } catch (err) {
      toast.error('Could not parse activity. Please try rephrasing your input.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('Logged out successfully');
    router.push('/login');
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes('diet')) return <Apple className="w-5 h-5 text-emerald-600" />;
    if (category.toLowerCase().includes('fitness')) return <Dumbbell className="w-5 h-5 text-indigo-600" />;
    return <Activity className="w-5 h-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">OnTrack AI</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 pb-20">
        {/* Input Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 transition-shadow focus-within:shadow-md focus-within:border-blue-300">
          <div className="p-1">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Log your activity (e.g., 'Ran 5 miles' or 'Ate 2 eggs')..."
                className="flex-1 px-5 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-lg"
                disabled={submitLoading}
              />
              <button
                type="submit"
                disabled={submitLoading || !inputText.trim()}
                className="m-1 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all flex items-center gap-2"
              >
                {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="hidden sm:inline">Log</span>
              </button>
            </form>
          </div>
        </section>

        {/* Timeline/List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <span className="text-sm text-slate-500 font-medium">{habits.length} total entries</span>
          </div>
          
          {habits.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="text-slate-900 font-semibold mb-2">Your dashboard is empty</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Start typing naturally in the input above. The AI will automatically categorize and extract the details.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const isDiet = habit.parsed_category.toLowerCase().includes('diet');
                const categoryLabel = habit.parsed_category.split('-')[0].trim();
                const itemsStr = habit.parsed_category.includes('-') ? habit.parsed_category.split('-')[1].trim() : '';

                return (
                  <div key={habit.id} className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isDiet ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                        {getCategoryIcon(habit.parsed_category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isDiet ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {categoryLabel}
                          </span>
                        </div>
                        <p className="text-slate-900 font-medium leading-tight mb-1">
                          {itemsStr || habit.user_input}
                        </p>
                        <p className="text-slate-400 text-xs font-mono truncate max-w-[200px] sm:max-w-xs">
                          Input: "{habit.user_input}"
                        </p>
                      </div>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-100">
                      <span className="block text-2xl font-black text-slate-800 tracking-tight">{habit.quantity}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Qty</span>
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