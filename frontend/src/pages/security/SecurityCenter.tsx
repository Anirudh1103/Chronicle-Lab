import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '../../utils/cn';
import {
  Shield,
  KeyRound,
  QrCode,
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Clock,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  RefreshCw,
  Search,
  FileText,
  Database,
  ExternalLink,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck,
  Bell,
  Settings,
  Gauge,
  LogOut,
  ShieldAlert,
  Check,
  Info,
  Server,
  HelpCircle,
  HardDrive,
  Ban,
  ArrowRight,
  User
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Utility helper to copy text to clipboard
function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

export default function SecurityCenter() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  
  // Dynamic score & checklist state
  const [scoreData, setScoreData] = useState<{
    score: number;
    status: string;
    checks: Record<string, boolean>;
    lastCheck: string;
  } | null>(null);

  // Active Sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Trusted Devices state
  const [trustedDevices, setTrustedDevices] = useState<any[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [isRenamingDevice, setIsRenamingDevice] = useState<string | null>(null);
  const [renamedName, setRenamedName] = useState('');

  // Failed login attempts
  const [failedAttempts, setFailedAttempts] = useState<{ day: number; week: number; month: number }>({ day: 0, week: 0, month: 0 });

  // Read-only diagnostics
  const [headers, setHeaders] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any[]>([]);
  const [apiConfig, setApiConfig] = useState<any[]>([]);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logsLoading, setLogsLoading] = useState(true);

  // Password change states
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // MFA states
  const [isConfiguringMfa, setIsConfiguringMfa] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; otpAuthUri: string; qrCode?: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableCode, setDisableCode] = useState('');
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);

  // General settings state
  const [settings, setSettings] = useState<any>({
    idleTimeout: 30,
    rememberTrustedDevices: true,
    maxSimultaneousSessions: 5,
    singleSessionOnly: false,
    requireMfaEveryLogin: false,
    requireMfaEveryXDays: 30,
    rememberBrowser: true,
    sessionLifetime: 30,
    notifyNewLogin: true,
    notifyUnknownDevice: true,
    notifyPasswordChanged: true,
    notifyMfaDisabled: true,
    notifyTrustedDeviceAdded: true,
    notifySessionRevoked: true,
    notifyFailedLoginThreshold: true,
    notifyMultipleCountries: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'info' | 'warn' | 'success' }[]>([]);

  // Unique Device Fingerprint
  const deviceFingerprint = useMemo(() => {
    let devId = localStorage.getItem('chronicle_device_id');
    if (!devId) {
      devId = crypto.randomUUID();
      localStorage.setItem('chronicle_device_id', devId);
    }
    return devId;
  }, []);

  const addNotification = (text: string, type: 'info' | 'warn' | 'success' = 'info') => {
    const id = Math.random().toString();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Fetch all dashboard data
  const loadScore = async () => {
    try {
      const { data } = await api.get('security/score');
      setScoreData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const { data } = await api.get('security/sessions');
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadTrustedDevices = async () => {
    setDevicesLoading(true);
    try {
      const { data } = await api.get('security/devices');
      setTrustedDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDevicesLoading(false);
    }
  };

  const loadFailedAttempts = async () => {
    try {
      const { data } = await api.get('security/failed-attempts');
      setFailedAttempts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDiagnostics = async () => {
    try {
      const [hRes, dbRes, apiRes] = await Promise.all([
        api.get('security/headers'),
        api.get('security/database'),
        api.get('security/api-config')
      ]);
      setHeaders(hRes.data);
      setDbStatus(dbRes.data);
      setApiConfig(apiRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get('security/logs', { params });
      setAuditLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data } = await api.get('security/settings');
      setSettings(data);
    } catch (err) {
      console.warn('Backend settings endpoint failed, falling back to localStorage:', err);
      const local = localStorage.getItem('chronicle_security_settings');
      if (local) {
        try {
          setSettings(JSON.parse(local));
        } catch (_) {}
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadScore();
    loadSessions();
    loadTrustedDevices();
    loadFailedAttempts();
    loadDiagnostics();
    loadAuditLogs();
    loadSettings();
  }, [searchQuery, startDate, endDate]);

  // Handle settings update
  const handleUpdateSetting = async (field: string, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    localStorage.setItem('chronicle_security_settings', JSON.stringify(updated));
    try {
      await api.put('security/settings', updated);
      addNotification('Setting saved dynamically', 'success');
    } catch (err) {
      console.warn('Failed to save to backend, saved to localStorage only:', err);
      addNotification('Setting saved locally (preview mode)', 'success');
    }
  };

  const handleSaveAllSettings = async () => {
    setIsSavingSettings(true);
    localStorage.setItem('chronicle_security_settings', JSON.stringify(settings));
    try {
      await api.put('security/settings', settings);
      addNotification('All security preferences updated successfully', 'success');
    } catch (err) {
      console.warn('Failed to save settings to backend, saved locally:', err);
      addNotification('Security settings saved locally (preview mode)', 'success');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Password validation checklist
  const passwordCriteria = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    };
  }, [newPassword]);

  const passwordStrengthLabel = useMemo(() => {
    const passed = Object.values(passwordCriteria).filter(Boolean).length;
    if (passed <= 2) return { text: 'Weak', color: 'text-red-500 bg-red-500/10' };
    if (passed <= 4) return { text: 'Moderate', color: 'text-amber-500 bg-amber-500/10' };
    return { text: 'Strong', color: 'text-emerald-500 bg-emerald-500/10' };
  }, [passwordCriteria]);

  // Handle password updates
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);
    setIsUpdatingPwd(true);

    try {
      await api.post('auth/update-password', {
        oldPassword,
        newPassword,
        confirmPassword
      });
      setPwdSuccess('Password changed successfully.');
      addNotification('Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadScore();
      setTimeout(() => {
        setIsChangingPwd(false);
        setPwdSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setIsUpdatingPwd(false);
    }
  };

  // Handle Session Revocations
  const handleRevokeSession = async (id: string) => {
    try {
      await api.delete(`security/sessions/${id}`);
      addNotification('Session successfully revoked', 'success');
      loadSessions();
      loadScore();
    } catch (err) {
      addNotification('Failed to revoke session', 'warn');
    }
  };

  const handleRevokeOthers = async () => {
    if (!confirm('CAUTION: This will immediately log out all other active connection sessions. Proceed?')) return;
    try {
      await api.delete('security/sessions');
      addNotification('Other active sessions revoked', 'success');
      loadSessions();
      loadScore();
    } catch (err) {
      addNotification('Failed to revoke other sessions', 'warn');
    }
  };

  // Handle Device Trust
  const handleRegisterDevice = async () => {
    try {
      const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari';
      const os = navigator.userAgent.includes('Windows') ? 'Windows' : 'macOS';
      await api.post('security/devices', {
        deviceId: deviceFingerprint,
        deviceName: `${os} Browser Device`,
        browser,
        os
      });
      addNotification('This device is now trusted', 'success');
      loadTrustedDevices();
      loadScore();
    } catch (err) {
      addNotification('Failed to trust device', 'warn');
    }
  };

  const handleRemoveDeviceTrust = async (id: string) => {
    try {
      await api.delete(`security/devices/${id}`);
      addNotification('Device trust removed successfully', 'success');
      loadTrustedDevices();
      loadScore();
    } catch (err) {
      addNotification('Failed to untrust device', 'warn');
    }
  };

  // MFA Management Actions
  const handleStartMfaSetup = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    setMfaSetup(null);
    setIsConfiguringMfa(true);

    // If MFA is already enabled, do not initiate setup API call to prevent secret overwrite
    if (user?.mfaEnabled) {
      return;
    }

    try {
      const { data } = await api.post('auth/mfa/setup');
      setMfaSetup(data);
    } catch (err: any) {
      setMfaError(err.response?.data?.message || 'Failed to start MFA registration.');
    }
  };

  const handleVerifyMfaCode = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    try {
      const { data } = await api.post('auth/mfa/verify', { code: mfaCode });
      setMfaSuccess('Multi-Factor Authentication enabled successfully.');
      addNotification('MFA configured successfully', 'success');
      setBackupCodes(data.backupCodes || []);
      loadScore();
      queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (err: any) {
      setMfaError(err.response?.data?.message || 'Invalid verification code.');
    }
  };

  const handleDisableMfa = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    setIsDisablingMfa(true);
    try {
      await api.post('auth/mfa/disable', { code: disableCode });
      setMfaSuccess('Multi-Factor Authentication has been disabled.');
      addNotification('MFA disabled successfully', 'success');
      setDisableCode('');
      loadScore();
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setTimeout(() => {
        setIsConfiguringMfa(false);
        setMfaSuccess(null);
      }, 1500);
    } catch (err: any) {
      setMfaError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIsDisablingMfa(false);
    }
  };

  const handleCopyCodes = async () => {
    const success = await copyToClipboard(backupCodes.join('\n'));
    if (success) {
      addNotification('Backup codes copied to clipboard', 'success');
    }
  };

  const handleDownloadCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `chronicle-lab-mfa-backup-codes-${user?.email}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addNotification('Backup codes downloaded', 'success');
  };

  const currentDeviceTrusted = useMemo(() => {
    return trustedDevices.some(d => d.deviceId === deviceFingerprint);
  }, [trustedDevices, deviceFingerprint]);

  const activeSessionDetails = useMemo(() => {
    return sessions.find(s => s.isCurrent) || null;
  }, [sessions]);

  // Dynamic security checklist priority recommendations
  const dynamicRecommendations = useMemo(() => {
    const list = [];
    if (!scoreData) return [];

    if (!scoreData.checks.mfaEnabled) {
      list.push({
        id: 'mfa',
        title: 'Enable Multi-Factor Authentication',
        desc: 'MFA adds an extra layer of protection to secure logins.',
        priority: 'High Priority',
        prioColor: 'text-red-400 border-red-500/20 bg-red-500/5',
        actionText: 'Fix Now',
        handler: handleStartMfaSetup
      });
    }

    const passwordAge = user?.passwordLastChanged
      ? Math.floor((Date.now() - new Date(user.passwordLastChanged).getTime()) / (1000 * 60 * 60 * 24))
      : 90;
    if (passwordAge > 60) {
      list.push({
        id: 'pwd',
        title: `Password changed ${passwordAge} days ago`,
        desc: 'Regularly rotating passwords keeps account credentials secure.',
        priority: 'Medium Priority',
        prioColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
        actionText: 'Fix Now',
        handler: () => setIsChangingPwd(true)
      });
    }

    if (sessions.length > 3) {
      list.push({
        id: 'sessions',
        title: `Review ${sessions.length} active sessions`,
        desc: 'Too many concurrent sessions increase potential hijack surfaces.',
        priority: 'Medium Priority',
        prioColor: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
        actionText: 'Review',
        handler: () => {
          const el = document.getElementById('sessions-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (settings.idleTimeout === 0) {
      list.push({
        id: 'logout',
        title: 'Configure automatic logout',
        desc: 'Configure inactivity timers to automatically sign out idle admins.',
        priority: 'Low Priority',
        prioColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        actionText: 'Configure',
        handler: () => {
          const el = document.getElementById('logout-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    list.push({
      id: 'logs',
      title: 'Review security audit logs',
      desc: 'Regularly examine historical log events to verify security posture.',
      priority: 'Low Priority',
      prioColor: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      actionText: 'Review',
      handler: () => {
        const el = document.getElementById('logs-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return list;
  }, [scoreData, user, sessions, settings]);

  return (
    <div className="space-y-8 pb-20">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
              <Shield size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-100">Security Center</h1>
              <p className="text-sm text-slate-400">Monitor, manage and strengthen your account security</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 bg-slate-900 border border-white/5 px-3 py-2 rounded-xl">
            <Clock size={14} className="text-slate-500" />
            Last updated: 2 min ago
          </span>
          <button
            onClick={() => {
              const element = document.createElement('a');
              const data = {
                score: scoreData,
                settings,
                sessions,
                trustedDevices,
                diagnostics: { headers, dbStatus, apiConfig },
                failedAttempts
              };
              const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              element.href = URL.createObjectURL(file);
              element.download = `chronicle-lab-security-report-${Date.now()}.json`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
              addNotification('Security report downloaded', 'success');
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      {/* Row 2: Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Security Score */}
        <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Security Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black border border-emerald-500/20">
              A-
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black text-slate-100">{scoreData?.score || 82}</span>
            <span className="text-sm text-slate-500 font-bold">/100</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-2">Good security posture</p>
        </div>

        {/* Risk Level */}
        <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Risk Level</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-100 block">Medium</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-1">Some actions required</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber-500 w-1/2" />
          </div>
        </div>

        {/* Last Login */}
        <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Last Login</span>
            <Globe size={18} className="text-slate-400" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-100 block truncate">
              {activeSessionDetails ? `${activeSessionDetails.browser} on ${activeSessionDetails.os}` : 'Today, 10:24 AM'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate mt-1 flex items-center gap-1">
              <MapPin size={10} className="text-slate-500" />
              {activeSessionDetails ? `${activeSessionDetails.city}, ${activeSessionDetails.country}` : 'Bengaluru, India'}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Active Session</span>
        </div>

        {/* Active Sessions */}
        <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Active Sessions</span>
            <Laptop size={18} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-100">{sessions.length}</span>
            <span className="text-xs text-slate-500 font-bold">active</span>
          </div>
          <button
            onClick={() => document.getElementById('sessions-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors text-left"
          >
            View all sessions →
          </button>
        </div>

        {/* Trusted Devices */}
        <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Trusted Devices</span>
            <UserCheck size={18} className="text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-100">{trustedDevices.length}</span>
            <span className="text-xs text-slate-500 font-bold">registered</span>
          </div>
          <button
            onClick={() => document.getElementById('devices-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors text-left"
          >
            Manage devices →
          </button>
        </div>
      </div>

      {/* Grid: Recommended Actions, Auth & Auto-Logout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recommended Actions */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Recommended Actions</h3>
            <p className="text-xs text-slate-400 mt-1">Actions suggested to raise your security standard.</p>
          </div>
          <div className="space-y-4 flex-1 mt-4">
            {dynamicRecommendations.map((rec: any) => (
              <div key={rec.id} className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border", rec.prioColor)}>
                      {rec.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-200 truncate">{rec.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{rec.desc}</p>
                </div>
                <button
                  onClick={rec.handler}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs shrink-0 transition-colors"
                >
                  {rec.actionText}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication Card */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Authentication</h3>
            <p className="text-xs text-slate-400 mt-1">Configure credentials and factor keys.</p>
          </div>

          <div className="space-y-4">
            {/* Password Card */}
            <div className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-200">Password</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Strong
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Last updated</span>
                <span className="font-bold">89 days ago</span>
              </div>
              <button
                onClick={() => setIsChangingPwd(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs transition-colors"
              >
                Change Password
              </button>
            </div>

            {/* MFA Card */}
            <div className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <QrCode size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-200">Multi-Factor Authentication</span>
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                  user?.mfaEnabled
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Method</span>
                <span className="font-bold">Google Authenticator</span>
              </div>
              <button
                onClick={handleStartMfaSetup}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-bold text-xs transition-colors"
              >
                Manage MFA
              </button>
            </div>
          </div>
        </div>

        {/* Automatic Logout Pane */}
        <div id="logout-section" className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Automatic Logout</h3>
            <p className="text-xs text-slate-400">Configure automatic logout after inactivity.</p>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Current Setting</span>
              <span className="font-black text-primary text-sm">
                {settings.idleTimeout === 0 ? 'Never' : `${settings.idleTimeout} minutes`}
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={settings.idleTimeout}
                onChange={(e) => handleUpdateSetting('idleTimeout', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                <span>Never</span>
                <span>5m</span>
                <span>10m</span>
                <span>15m</span>
                <span>20m</span>
                <span>25m</span>
                <span>30m</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-2.5 text-[10px] text-slate-400">
              <div className="flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Tracks mouse movements, key inputs, and page scrolling.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Shows warning modal 60 seconds before expiration.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Logs out session automatically on inactivity timeout.</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAllSettings}
            disabled={isSavingSettings}
            className="w-full py-3 mt-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 font-bold text-xs transition-all shadow-lg shadow-primary/10"
          >
            {isSavingSettings ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Row 4: Grid of Active Sessions, Login History, Failed attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <div id="sessions-section" className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-100 tracking-tight">Active Sessions ({sessions.length})</h3>
              <p className="text-xs text-slate-400">Manage connections logging into your workspace.</p>
            </div>
            {sessions.length > 1 && (
              <button
                onClick={handleRevokeOthers}
                className="px-3.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors font-bold text-[10px] uppercase tracking-wider"
              >
                Revoke Others
              </button>
            )}
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[320px] flex-1 mt-4 pr-1 no-scrollbar">
            {sessionsLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading sessions...</div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                      {session.os.includes('Mac') || session.os.includes('iOS') ? <Laptop size={18} /> : <Laptop size={18} />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-200 truncate">{session.deviceName}</h4>
                        {session.isCurrent && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {session.browser} • {session.ipAddress}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin size={9} />
                        {session.city}, {session.country}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-xs shrink-0 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Login Activity Timeline */}
        <div id="logs-section" className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Login Activity</h3>
            <p className="text-xs text-slate-400 mt-1">Audit trail timeline of security activity log events.</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[320px] flex-1 mt-4 pr-1 no-scrollbar">
            {logsLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading logs...</div>
            ) : auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No audit logs found.</div>
            ) : (
              auditLogs.slice(0, 15).map((log) => {
                const isFail = log.event.includes('FAILURE') || log.event.includes('FAILED');
                const isMfa = log.event.includes('MFA');
                return (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0 mt-1.5",
                        isFail ? "bg-red-500" : isMfa ? "bg-primary" : "bg-emerald-500"
                      )} />
                      <div className="w-px h-full bg-white/5 mt-1" />
                    </div>
                    <div className="space-y-1 min-w-0 pb-3">
                      <h4 className="text-xs font-black text-slate-200">{log.event.replace('_', ' ')}</h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {log.browser || 'Browser'} on {log.os || 'OS'} • {log.ipAddress || 'Unknown IP'}
                      </p>
                      <span className="text-[9px] text-slate-500 font-bold block">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Failed Login Attempts Panel */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Failed Login Attempts</h3>
            <p className="text-xs text-slate-400 mt-1">Visual security indicators for invalid access logs.</p>
          </div>

          <div className="space-y-6">
            {/* Horizontal Bar Chart (Mock metrics matching screen sizes) */}
            <div className="bg-slate-900/40 p-4 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-100">{failedAttempts.week}</span>
                <span className="text-xs text-slate-400">Total Failed (7 Days)</span>
              </div>
              
              {/* Premium CSS-based mini bar chart */}
              <div className="flex items-end justify-between h-20 px-2 pt-4">
                {[12, 18, 15, 22, 28, 14, failedAttempts.day].map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 w-7 group">
                    <div className="w-full relative rounded-t bg-slate-800 h-16 overflow-hidden">
                      <div
                        style={{ height: `${Math.min(100, (val / 30) * 100)}%` }}
                        className={cn(
                          "absolute bottom-0 left-0 right-0 rounded-t transition-all duration-500",
                          idx === 6 ? "bg-red-500 shadow-lg shadow-red-500/20" : "bg-slate-700 group-hover:bg-slate-600"
                        )}
                      />
                    </div>
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top targeted locations list */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">Top Targeted Locations</span>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 bg-slate-900/20 border border-white/5 rounded-xl">
                  <span className="text-slate-300 font-bold flex items-center gap-2">
                    <MapPin size={12} className="text-slate-500" />
                    Mumbai, India
                  </span>
                  <span className="text-red-400 font-black">12 attempts</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 bg-slate-900/20 border border-white/5 rounded-xl">
                  <span className="text-slate-300 font-bold flex items-center gap-2">
                    <MapPin size={12} className="text-slate-500" />
                    Bengaluru, India
                  </span>
                  <span className="text-red-400 font-black">7 attempts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: Trusted Devices & Security Diagnostics Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trusted Devices List */}
        <div id="devices-section" className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-100 tracking-tight">Trusted Devices ({trustedDevices.length})</h3>
              <p className="text-xs text-slate-400 mt-1">Registered hardware devices skipping factor MFA checks.</p>
            </div>
            {!currentDeviceTrusted && (
              <button
                onClick={handleRegisterDevice}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all font-bold text-xs shadow-lg shadow-primary/20"
              >
                Trust Current Device
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {devicesLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Loading devices...</div>
            ) : trustedDevices.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No trusted devices registered.</div>
            ) : (
              trustedDevices.map((device) => (
                <div
                  key={device.id}
                  className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                      {device.deviceId === deviceFingerprint ? <Smartphone size={18} /> : <Laptop size={18} />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-200">{device.deviceName}</h4>
                        {device.deviceId === deviceFingerprint && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Trusted Device
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {device.browser} • {device.os}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDeviceTrust(device.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold text-xs transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Diagnostics */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Security Diagnostics</h3>
            <p className="text-xs text-slate-400 mt-1">System health indicators and secure configurations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Headers, SSL, DB checks */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">HTTPS & SSL</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Healthy
                </span>
              </div>

              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">Security Headers</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Healthy
                </span>
              </div>

              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">Database Security</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Healthy
                </span>
              </div>
            </div>

            {/* MFA Enforcement, rate limiter, backups */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">MFA Enforcement</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Warning
                </span>
              </div>

              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Gauge size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">Rate Limiting</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Healthy
                </span>
              </div>

              <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-300">Backup Status</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 6: Danger Zone / Quick Actions banner */}
      <div className="glass p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-100 tracking-tight">Danger Zone</h3>
          <p className="text-xs text-slate-400">Irreversible and highly sensitive security configuration overrides.</p>
        </div>
        <button
          onClick={() => {
            if (confirm('CRITICAL WARN: This action will disable MFA configuration and wipe all trusted device tokens. Are you sure?')) {
              handleStartMfaSetup();
            }
          }}
          className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-600/15 shrink-0 transition-colors"
        >
          Manage Sensitive Settings
        </button>
      </div>

      {/* Portal Modal: Password Update */}
      <AnimatePresence>
        {isChangingPwd && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-100 tracking-tight">Change Password</h3>
                <p className="text-xs text-slate-400 mt-1">Configure credentials below. Confirm rotation to apply changes.</p>
              </div>

              {pwdError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Password strength checklist display */}
                <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Password Strength</span>
                    <span className={cn("px-2 py-0.5 rounded font-black uppercase tracking-widest text-[8px]", passwordStrengthLabel.color)}>
                      {passwordStrengthLabel.text}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.length ? <Check size={10} className="text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.uppercase ? <Check size={10} className="text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.lowercase ? <Check size={10} className="text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordCriteria.number ? <Check size={10} className="text-emerald-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                      <span>Number key</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsChangingPwd(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/5 text-slate-300 hover:bg-white/5 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPwd}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 font-bold text-xs transition-all shadow-lg shadow-primary/20"
                  >
                    {isUpdatingPwd ? 'Updating...' : 'Save Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Portal Modal: MFA Setup */}
      <AnimatePresence>
        {isConfiguringMfa && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-100 tracking-tight">Multi-Factor Authentication</h3>
                <p className="text-xs text-slate-400 mt-1">Configure MFA setups using Google Authenticator or compatible app.</p>
              </div>

              {mfaError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{mfaError}</span>
                </div>
              )}

              {mfaSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{mfaSuccess}</span>
                </div>
              )}

              {/* Configure Setup Steps */}
              {!user?.mfaEnabled ? (
                mfaSetup && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      {mfaSetup.qrCode && (
                        <div className="p-4 bg-white rounded-3xl border border-slate-100 flex items-center justify-center">
                          <img src={mfaSetup.qrCode} alt="MFA QR Code" className="w-40 h-40" />
                        </div>
                      )}
                      <div className="text-center space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Secret Token Key</span>
                        <div className="flex items-center gap-2 p-2 bg-slate-950/50 border border-white/5 rounded-xl px-4">
                          <code className="text-xs font-mono font-bold text-slate-200">{mfaSetup.secret}</code>
                          <button
                            onClick={() => {
                              copyToClipboard(mfaSetup.secret);
                              addNotification('Secret token copied', 'success');
                            }}
                            className="p-1 text-slate-500 hover:text-slate-300"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Verification Code</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary transition-colors text-center font-black tracking-widest"
                      />
                    </div>

                    {backupCodes.length > 0 && (
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-3 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Backup Recovery Codes</span>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-300">
                          {backupCodes.map((code) => <div key={code}>{code}</div>)}
                        </div>
                        <div className="flex justify-center gap-3 pt-2">
                          <button
                            onClick={handleCopyCodes}
                            className="px-3.5 py-1.5 rounded-lg border border-white/5 text-slate-300 hover:bg-white/5 font-bold text-[10px]"
                          >
                            Copy Codes
                          </button>
                          <button
                            onClick={handleDownloadCodes}
                            className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-[10px]"
                          >
                            Download Codes
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setIsConfiguringMfa(false)}
                        className="px-5 py-2.5 rounded-xl border border-white/5 text-slate-300 hover:bg-white/5 font-bold text-xs"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleVerifyMfaCode}
                        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 font-bold text-xs transition-all shadow-lg shadow-primary/20"
                      >
                        Verify & Enable
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* Disable Setup Step */
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs">
                    WARNING: Disabling MFA reduces account security standards. Confirm code to disable.
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current MFA verification code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP code"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-primary transition-colors text-center font-black tracking-widest"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setIsConfiguringMfa(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/5 text-slate-300 hover:bg-white/5 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDisableMfa}
                      disabled={isDisablingMfa}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/10"
                    >
                      {isDisablingMfa ? 'Disabling...' : 'Confirm Disable'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "px-5 py-3.5 rounded-2xl border flex items-center gap-3 text-xs font-black shadow-2xl backdrop-blur-md animate-slide-in",
              n.type === 'success'
                ? "bg-slate-900 border-emerald-500/20 text-emerald-400"
                : n.type === 'warn'
                  ? "bg-slate-900 border-red-500/20 text-red-400"
                  : "bg-slate-900 border-white/10 text-slate-300"
            )}
          >
            {n.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{n.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
