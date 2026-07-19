import React, { useState, useEffect } from 'react';
import { usePerformanceStore } from '../../store/performanceStore';
import { analyzeBottlenecks } from '../../utils/bottleneckDetector';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Gauge, Database, Image as ImageIcon, AlertTriangle, Terminal, X, ChevronUp, Zap, Clock, ShieldAlert } from 'lucide-react';

export function PerformancePanel() {
  const {
    isDeveloperMode,
    currentRoute,
    pageReadyTime,
    fcp,
    lcp,
    tti,
    requests,
    images,
    recommendations,
    logs,
  } = usePerformanceStore();

  // Only render if Developer Mode is enabled by Admin (default OFF)
  if (!isDeveloperMode) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'db' | 'images' | 'bottlenecks' | 'logs'>('overview');

  useEffect(() => {
    analyzeBottlenecks();
  }, [requests, images]);

  // Aggregate stats
  const totalDbTime = requests.reduce((acc, r) => acc + (r.dbDuration || 0), 0);
  const totalBackendTime = requests.reduce((acc, r) => acc + (r.backendDuration || 0), 0);
  const totalLatency = requests.reduce((acc, r) => acc + (r.networkLatency || 0), 0);
  const slowQueries = requests.filter((r) => r.dbDuration > 500);
  const slowApis = requests.filter((r) => r.totalDuration > 1000);
  const largeImages = images.filter((i) => i.isOver1MB);

  // Overall speed color badge
  const getSpeedBadge = (ms: number) => {
    if (ms === 0) return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Measuring...' };
    if (ms < 800) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '🟢 EXCELLENT' };
    if (ms < 1500) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: '🟡 ATTENTION' };
    if (ms < 3000) return { bg: 'bg-orange-500/20', text: 'text-orange-400', label: '🟠 SLOW' };
    return { bg: 'bg-rose-500/20', text: 'text-rose-400', label: '🔴 CRITICAL' };
  };

  const badgeStatus = getSpeedBadge(pageReadyTime || (requests.length > 0 ? requests[0].totalDuration : 0));

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs select-none">
      {/* Floating Collapsible Trigger Pill */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl glass border border-white/10 shadow-2xl backdrop-blur-xl hover:scale-105 transition-all ${badgeStatus.bg}`}
        >
          <Gauge size={16} className={badgeStatus.text} />
          <span className="font-bold text-white tracking-tight">{currentRoute}</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${badgeStatus.text}`}>
            {pageReadyTime ? `${pageReadyTime}ms` : 'Perf HUD'}
          </span>
          {recommendations.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-rose-500 text-white font-black text-[10px] rounded-full animate-pulse">
              {recommendations.length}
            </span>
          )}
          <ChevronUp size={14} className="text-slate-400" />
        </motion.button>
      )}

      {/* Expanded Performance Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[90vw] max-w-4xl h-[550px] glass bg-slate-950/95 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl text-slate-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    Chronicle Lab Performance Diagnostics
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${badgeStatus.bg} ${badgeStatus.text}`}>
                      {badgeStatus.label}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Route: {currentRoute}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-slate-900/30 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Gauge },
                { id: 'requests', label: `API (${requests.length})`, icon: Clock },
                { id: 'db', label: `DB Query (${totalDbTime}ms)`, icon: Database },
                { id: 'images', label: `Images (${images.length})`, icon: ImageIcon },
                { id: 'bottlenecks', label: `Fixes (${recommendations.length})`, icon: AlertTriangle, badge: recommendations.length },
                { id: 'logs', label: `Console (${logs.length})`, icon: Terminal },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {tab.badge ? (
                      <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] rounded-full">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Page Ready</span>
                      <span className="text-xl font-extrabold text-white">{pageReadyTime ? `${pageReadyTime} ms` : 'N/A'}</span>
                    </div>
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Network Latency</span>
                      <span className="text-xl font-extrabold text-sky-400">{totalLatency} ms</span>
                    </div>
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">DB Execution</span>
                      <span className="text-xl font-extrabold text-emerald-400">{totalDbTime} ms</span>
                    </div>
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Web Vitals FCP</span>
                      <span className="text-xl font-extrabold text-purple-400">{fcp ? `${fcp} ms` : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Latency & Processing Breakdown */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Execution Stage Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Database Queries</span>
                        <span className="text-emerald-400 font-bold">{totalDbTime} ms</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (totalDbTime / (pageReadyTime || 1000)) * 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] pt-2">
                        <span className="text-slate-400">Network Round-trip Latency</span>
                        <span className="text-sky-400 font-bold">{totalLatency} ms</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (totalLatency / (pageReadyTime || 1000)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {slowQueries.length > 0 && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h5 className="font-bold text-rose-300 text-xs">Slow Query Warning (&gt;500ms)</h5>
                        <p className="text-[11px] text-rose-200/80">
                          {slowQueries.length} database operation(s) exceeded the 500ms execution limit. Check DB tab for details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REQUESTS */}
              {activeTab === 'requests' && (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-primary/20 text-primary font-black text-[10px] rounded-md">
                            {req.method}
                          </span>
                          <span className="font-bold text-white text-xs truncate">{req.url}</span>
                          <span className="text-[10px] text-slate-500">[{req.id}]</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex gap-4">
                          <span>Total: <strong className="text-white">{req.totalDuration}ms</strong></span>
                          <span>DB: <strong className="text-emerald-400">{req.dbDuration}ms</strong></span>
                          <span>Net: <strong className="text-sky-400">{req.networkLatency}ms</strong></span>
                          <span>Payload: <strong className="text-slate-300">{(req.payloadSize / 1024).toFixed(1)} KB</strong></span>
                        </div>
                      </div>

                      {req.isDuplicate && (
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[9px] font-bold">
                          DUPLICATE
                        </span>
                      )}
                    </div>
                  ))}

                  {requests.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No API requests recorded for current route.</div>
                  )}
                </div>
              )}

              {/* TAB 3: DATABASE */}
              {activeTab === 'db' && (
                <div className="space-y-3">
                  {requests.flatMap(r => r.dbDuration > 0 ? [{ id: r.id, url: r.url, dbDuration: r.dbDuration }] : []).map((db, idx) => (
                    <div key={idx} className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs">{db.url}</p>
                        <p className="text-[10px] text-slate-400">Request ID: {db.id}</p>
                      </div>
                      <span className={`font-black text-sm ${db.dbDuration > 500 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        {db.dbDuration} ms
                      </span>
                    </div>
                  ))}

                  {requests.every(r => r.dbDuration === 0) && (
                    <div className="text-center py-12 text-slate-500">No DB operations executed on current route.</div>
                  )}
                </div>
              )}

              {/* TAB 4: IMAGES */}
              {activeTab === 'images' && (
                <div className="space-y-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3 truncate">
                        <span className="px-2 py-1 bg-black/50 text-emerald-400 text-[10px] font-black rounded-md uppercase">
                          {img.format}
                        </span>
                        <span className="text-xs text-white truncate">{img.src.split('/').pop()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-slate-400">{(img.size / 1024).toFixed(1)} KB</span>
                        <span className="text-sky-400 font-bold">{img.duration} ms</span>
                      </div>
                    </div>
                  ))}

                  {images.length === 0 && (
                    <div className="text-center py-12 text-slate-500">No images recorded on current page.</div>
                  )}
                </div>
              )}

              {/* TAB 5: BOTTLENECKS & RECOMMENDATIONS */}
              {activeTab === 'bottlenecks' && (
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                      <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200/90 leading-relaxed">{rec}</p>
                    </div>
                  ))}

                  {recommendations.length === 0 && (
                    <div className="text-center py-12 text-emerald-400 font-bold">
                      🎉 No bottlenecks detected! Your application performance is optimal.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="text-[11px] font-mono flex items-start gap-2 py-1 border-b border-white/5">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span
                        className={`font-bold uppercase text-[9px] px-1.5 py-0.2 rounded ${
                          log.type === 'ERROR'
                            ? 'bg-rose-500/20 text-rose-400'
                            : log.type === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-slate-200">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
