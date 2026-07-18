import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Calendar, Mail, User, Smile } from 'lucide-react';
import api from '../api/client';
import { cn } from '../utils/cn';

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  createdAt: string;
}

export function FeedbackManager() {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const { data: feedbacks = [], isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const { data } = await api.get('auth/feedback');
      return data;
    }
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <MessageSquare className="text-primary" size={36} /> User Feedback
        </h1>
        <p className="text-muted-foreground mt-2">
          Review comments, suggestions, and feedback submitted by readers. Click a row to view full details.
        </p>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 border-b border-white/5">
                <th className="p-6 font-black uppercase tracking-wider">User</th>
                <th className="p-6 font-black uppercase tracking-wider">Email</th>
                <th className="p-6 font-black uppercase tracking-wider">Type</th>
                <th className="p-6 font-black uppercase tracking-wider">Feedback Message</th>
                <th className="p-6 font-black uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse border-b border-white/5 last:border-0">
                    <td colSpan={5} className="p-8 h-16 bg-slate-50/20 dark:bg-slate-900/10" />
                  </tr>
                ))
              ) : feedbacks.length > 0 ? (
                feedbacks.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFeedback(item)}
                    className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-55 dark:hover:bg-white/5 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    <td className="p-6 font-bold flex items-center gap-2">
                      <User size={14} className="text-slate-400 dark:text-slate-500" />
                      {item.name}
                    </td>
                    <td className="p-6 text-slate-600 dark:text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} />
                        {item.email}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                        item.type === 'love' || item.type === 'like'
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                      )}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-6 text-slate-700 dark:text-slate-350 max-w-lg truncate leading-relaxed">
                      {item.message}
                    </td>
                    <td className="p-6 text-slate-550 dark:text-slate-400 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground italic font-medium">
                    No feedback entries found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Feedback Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-2xl w-full p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl relative space-y-6 text-slate-800 dark:text-slate-100">
            <button
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-850 dark:hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 text-primary border-b border-slate-150 dark:border-white/5 pb-4">
              <MessageSquare size={24} />
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">Feedback Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">From</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{selectedFeedback.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Email</span>
                <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                  <a href={`mailto:${selectedFeedback.email}`} className="hover:text-primary transition-colors">
                    {selectedFeedback.email}
                  </a>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Feedback Type</span>
                <div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border",
                    selectedFeedback.type === 'love' || selectedFeedback.type === 'like'
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/10"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/10"
                  )}>
                    {selectedFeedback.type}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Submitted</span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-350">
                  {new Date(selectedFeedback.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-150 dark:border-white/5 pt-4">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">Message</span>
              <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed text-sm max-h-72 overflow-y-auto font-medium shadow-inner">
                {selectedFeedback.message}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
