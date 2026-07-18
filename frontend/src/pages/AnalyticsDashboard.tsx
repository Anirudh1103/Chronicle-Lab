import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Tv,
  Clock,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import api from '../api/client';
import { cn } from '../utils/cn';

interface TrafficData {
  date: string;
  count: number;
}

interface TopPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  dislikes: number;
  shares?: number;
  category?: { name: string };
}

interface OverviewMetrics {
  totalViews: number;
  totalSubscribers: number;
  totalFeedback: number;
  totalPosts: number;
  trafficChart: TrafficData[];
  topPosts: TopPost[];
}

interface SecurityMetrics {
  successLogs: number;
  failureLogs: number;
  mfaSetupLogs: number;
  activeBlocks: number;
  recentLogs: any[];
}

interface DemographicsMetrics {
  browsers: { name: string; count: number }[];
  os: { name: string; count: number }[];
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'user' | 'login'>('user');

  // Query: User Analytics Overview
  const { data: overview, isLoading: isOverviewLoading } = useQuery<OverviewMetrics>({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const { data } = await api.get('analytics/overview');
      return data;
    }
  });

  // Query: Login Analytics & Audits
  const { data: security, isLoading: isSecurityLoading } = useQuery<SecurityMetrics>({
    queryKey: ['analytics-security'],
    queryFn: async () => {
      const { data } = await api.get('analytics/login');
      return data;
    }
  });

  // Query: Browser/OS demographics
  const { data: demographics, isLoading: isDemographicsLoading } = useQuery<DemographicsMetrics>({
    queryKey: ['analytics-demographics'],
    queryFn: async () => {
      const { data } = await api.get('analytics/demographics');
      return data;
    }
  });

  const isLoading = isOverviewLoading || isSecurityLoading || isDemographicsLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-20 bg-muted rounded-3xl w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-32 bg-muted rounded-3xl" />
        </div>
        <div className="h-80 bg-muted rounded-3xl w-full" />
      </div>
    );
  }

  // Calculate percentages helper
  const renderDemographicsBars = (items: { name: string; count: number }[]) => {
    const total = items.reduce((acc, curr) => acc + curr.count, 0) || 1;
    return (
      <div className="space-y-4">
        {items.map((item, idx) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>{item.name}</span>
                <span>{pct}% ({item.count} views)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary animate-pulse" size={36} /> Chronicle Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Monitor system-wide article traffic trends and security access metrics.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] self-start border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab('user')}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'user'
                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={cn(
              "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'login'
                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Login Analytics
          </button>
        </div>
      </div>

      {activeTab === 'user' ? (
        /* ================== USER ANALYTICS TAB ================== */
        <div className="space-y-8">
          {/* Card Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Eye size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Page Views</p>
                <h3 className="text-3xl font-black mt-1">{overview?.totalViews || 0}</h3>
              </div>
            </div>

            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500"><Users size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscribers</p>
                <h3 className="text-3xl font-black mt-1">{overview?.totalSubscribers || 0}</h3>
              </div>
            </div>

            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500"><FileText size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Posts</p>
                <h3 className="text-3xl font-black mt-1">{overview?.totalPosts || 0}</h3>
              </div>
            </div>

            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500"><MessageSquare size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Feedback received</p>
                <h3 className="text-3xl font-black mt-1">{overview?.totalFeedback || 0}</h3>
              </div>
            </div>
          </div>

          {/* Daily Traffic Chart */}
          <div className="glass p-8 rounded-[3rem] border-white/5 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tight">Daily Traffic Trend</h3>
                <p className="text-xs text-muted-foreground mt-1">Reader hits tracked over the last 30 days.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
                <TrendingUp size={16} /> 30-Day History
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="w-full h-64 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-end justify-between relative overflow-hidden">
              {overview && overview.trafficChart.length > 0 ? (
                <>
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none opacity-5">
                    <div className="border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-b border-white" />
                    <div className="border-b border-white" />
                  </div>

                  {/* SVG Line / Bar Graphic */}
                  <div className="w-full h-full flex items-end gap-2 pt-8">
                    {(() => {
                      const maxCount = Math.max(1, ...overview.trafficChart.map(c => c.count));
                      return overview.trafficChart.map((d, index) => {
                        const hPercent = (d.count / maxCount) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Hover tooltip card */}
                            <div className="absolute bottom-[calc(100%+5px)] scale-0 group-hover:scale-100 bg-slate-950 text-[10px] text-white px-2 py-1 rounded-md font-mono z-20 pointer-events-none shadow-md border border-white/10 transition-transform origin-bottom duration-150">
                              {d.count} views ({d.date.slice(5)})
                            </div>
                            {/* Visual Bar */}
                            <div
                              style={{ height: `${Math.max(4, hPercent)}%` }}
                              className={cn(
                                "w-full rounded-t-sm transition-all duration-500",
                                d.count > 0 ? "bg-primary hover:bg-primary/80 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "bg-white/5"
                              )}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              ) : (
                <div className="m-auto text-muted-foreground text-xs italic">No traffic recorded in this scope window.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Posts List */}
            <div className="glass p-8 rounded-[3rem] border-white/5 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black tracking-tight">Top Performing Stories</h3>
                <p className="text-xs text-muted-foreground mt-1">Most popular articles matching reader interest.</p>
              </div>

              <div className="space-y-4">
                {overview && overview.topPosts.length > 0 ? (
                  overview.topPosts.map((post, idx) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 dark:bg-slate-950/20 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm truncate">{post.title}</h4>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                            {post.category?.name || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right shrink-0 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1">
                          <span>{post.views}</span>
                          <Eye size={12} />
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                          <span className="text-emerald-500">{post.likes} 👍</span>
                          <span className="text-red-500">{post.dislikes || 0} 👎</span>
                        </div>
                        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                          <span>{post.shares || 0} 🗣️</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-muted-foreground text-xs italic">No matching records.</div>
                )}
              </div>
            </div>

            {/* Demographics breakdown */}
            <div className="glass p-8 rounded-[3rem] border-white/5 shadow-2xl space-y-8">
              <div>
                <h3 className="text-xl font-black tracking-tight">Reader Demographics</h3>
                <p className="text-xs text-muted-foreground mt-1">Breakdown of browser systems and client environments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Browsers */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black flex items-center gap-2 text-slate-350 dark:text-slate-200">
                    <Globe size={16} className="text-primary" /> Top Browsers
                  </h4>
                  {demographics && demographics.browsers.length > 0 ? (
                    renderDemographicsBars(demographics.browsers)
                  ) : (
                    <div className="text-xs italic text-muted-foreground">No browser logs.</div>
                  )}
                </div>

                {/* Operating systems */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black flex items-center gap-2 text-slate-350 dark:text-slate-200">
                    <Tv size={16} className="text-primary" /> Environments (OS)
                  </h4>
                  {demographics && demographics.os.length > 0 ? (
                    renderDemographicsBars(demographics.os)
                  ) : (
                    <div className="text-xs italic text-muted-foreground">No OS logs.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================== LOGIN ANALYTICS TAB ================== */
        <div className="space-y-8">
          {/* Audit Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500"><CheckCircle2 size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Success Logins</p>
                <h3 className="text-3xl font-black mt-1">{security?.successLogs || 0}</h3>
              </div>
            </div>

            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-red-500/10 rounded-2xl text-red-500"><XCircle size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Failed Attempts</p>
                <h3 className="text-3xl font-black mt-1">{security?.failureLogs || 0}</h3>
              </div>
            </div>

            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl border-red-500/20">
              <div className="p-4 bg-red-600/10 rounded-2xl text-red-600"><ShieldAlert size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Blocks</p>
                <h3 className="text-3xl font-black mt-1">{security?.activeBlocks || 0}</h3>
              </div>
            </div>

            <div className="glass p-6 rounded-[2.5rem] border-white/5 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-2xl">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">MFA Activations</p>
                <h3 className="text-3xl font-black mt-1">{security?.mfaSetupLogs || 0}</h3>
              </div>
            </div>
          </div>

          {/* Audit logs alert flags */}
          {(security && (security.failureLogs > 25 || security.activeBlocks > 0)) && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
              <ShieldAlert size={20} />
              <span>
                {security.activeBlocks > 0
                  ? `Critical: ${security.activeBlocks} IP(s) currently locked due to brute-force detection. Review audit trail.`
                  : "Warning: Multiple authentication failures detected in audit logs. Review gate logs below for potential brute-force trails."}
              </span>
            </div>
          )}

          {/* Detailed Auditing Log Trail */}
          <div className="glass rounded-[3rem] border-white/5 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Clock size={18} className="text-primary" /> Active Login Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Real-time gate logging history. All session authorizations are listed below.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 border-b border-white/5">
                    <th className="p-4 font-black uppercase tracking-wider">Timestamp</th>
                    <th className="p-4 font-black uppercase tracking-wider">Identity (Email)</th>
                    <th className="p-4 font-black uppercase tracking-wider">Status</th>
                    <th className="p-4 font-black uppercase tracking-wider">IP Address</th>
                    <th className="p-4 font-black uppercase tracking-wider">OS</th>
                    <th className="p-4 font-black uppercase tracking-wider">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {security && security.recentLogs.length > 0 ? (
                    security.recentLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 text-slate-350 font-bold font-mono">{log.email}</td>
                        <td className="p-4 font-black">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px]",
                            log.event.includes('SUCCESS') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10'
                          )}>
                            {log.event}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 font-mono">
                          {log.ipAddress === '::1' || log.ipAddress === '127.0.0.1' ? '127.0.0.1 (Localhost)' : (log.ipAddress || 'unknown')}
                        </td>
                        <td className="p-4 text-slate-400 font-medium">{log.os || 'unknown'}</td>
                        <td className="p-4 text-slate-400 font-medium">{log.browser || 'unknown'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground italic font-medium">
                        No login events recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
