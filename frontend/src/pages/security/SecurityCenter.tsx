import React, { useState, useEffect, useMemo } from 'react';
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
  Settings
} from 'lucide-react';
import { createPortal } from 'react-dom';

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

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'info' | 'warn' | 'success' }[]>([]);

  // 30-day password reminder state
  const [showPasswordReminder, setShowPasswordReminder] = useState(false);

  // Device trust reminder state
  const [showTrustReminder, setShowTrustReminder] = useState(false);

  // Client-side Unique Device Fingerprint Setup
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
    }, 4000);
  };

  // Fetch security center dashboard configurations
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

  useEffect(() => {
    loadScore();
    loadSessions();
    loadTrustedDevices();
    loadFailedAttempts();
    loadDiagnostics();
    loadAuditLogs();
  }, [searchQuery, startDate, endDate]);

  // Check if password change reminder is needed (30 days)
  useEffect(() => {
    if (user?.passwordLastChanged) {
      const lastChanged = new Date(user.passwordLastChanged).getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const alreadyDismissed = sessionStorage.getItem('dismissed_pwd_reminder');
      
      if (Date.now() - lastChanged > thirtyDaysMs && !alreadyDismissed) {
        setShowPasswordReminder(true);
      }
    }
  }, [user]);

  // Check if device trust prompt is needed (if current device not registered yet)
  useEffect(() => {
    if (trustedDevices.length > 0 && deviceFingerprint) {
      const isTrusted = trustedDevices.some(d => d.deviceId === deviceFingerprint);
      const mfaFlowSession = sessionStorage.getItem('mfa_verified_session');
      
      if (!isTrusted && mfaFlowSession === 'true') {
        setShowTrustReminder(true);
        sessionStorage.removeItem('mfa_verified_session');
      }
    }
  }, [trustedDevices, deviceFingerprint]);

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
      addNotification('All other active sessions revoked', 'success');
      loadSessions();
      loadScore();
    } catch (err) {
      addNotification('Failed to revoke other sessions', 'warn');
    }
  };

  // Handle Device Trust
  const handleTrustCurrentDevice = async () => {
    try {
      let browser = 'Unknown Browser';
      let os = 'Unknown OS';
      const ua = navigator.userAgent;
      
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari')) browser = 'Safari';
      
      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Macintosh')) os = 'macOS';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

      await api.post('security/devices', {
        deviceId: deviceFingerprint,
        deviceName: `${os} Browser Device`,
        browser,
        os
      });
      addNotification('Device registered as Trusted', 'success');
      loadTrustedDevices();
      setShowTrustReminder(false);
    } catch (err) {
      addNotification('Failed to trust device', 'warn');
    }
  };

  const handleRemoveDeviceTrust = async (id: string) => {
    try {
      await api.delete(`security/devices/${id}`);
      addNotification('Device trust removed successfully', 'success');
      loadTrustedDevices();
    } catch (err) {
      addNotification('Failed to remove trust', 'warn');
    }
  };

  const handleRenameDevice = async (id: string) => {
    if (!renamedName.trim()) return;
    try {
      const device = trustedDevices.find(d => d.id === id);
      await api.post('security/devices', {
        deviceId: device.deviceId,
        deviceName: renamedName,
        browser: device.browser,
        os: device.os
      });
      addNotification('Device renamed successfully', 'success');
      setIsRenamingDevice(null);
      setRenamedName('');
      loadTrustedDevices();
    } catch (err) {
      addNotification('Failed to rename device', 'warn');
    }
  };

  // MFA Flow methods
  const handleInitializeMfa = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    try {
      const { data } = await api.post('auth/mfa/setup');
      setMfaSetup(data);
    } catch (err) {
      setMfaError('Failed to initialize MFA.');
    }
  };

  const handleEnableMfa = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    try {
      const { data } = await api.post('auth/mfa/enable', { code: mfaCode });
      setBackupCodes(data.backupCodes || []);
      setMfaSuccess('Multi-factor Authentication activated successfully.');
      addNotification('MFA configured and activated', 'success');
      
      // Refresh user profile state
      queryClient.invalidateQueries({ queryKey: ['me'] });
      
      loadScore();
    } catch (err: any) {
      setMfaError(err.response?.data?.message || 'Invalid confirmation code.');
    }
  };

  const handleDisableMfa = async () => {
    setMfaError(null);
    setMfaSuccess(null);
    setIsDisablingMfa(true);
    try {
      await api.post('auth/mfa/disable', { code: disableCode });
      setMfaSuccess('MFA deactivated successfully.');
      addNotification('MFA deactivated', 'warn');
      setDisableCode('');
      setBackupCodes([]);
      setMfaSetup(null);

      // Refresh user profile state
      queryClient.invalidateQueries({ queryKey: ['me'] });
      
      loadScore();
      setTimeout(() => {
        setIsConfiguringMfa(false);
      }, 1500);
    } catch (err: any) {
      setMfaError(err.response?.data?.message || 'Failed to deactivate MFA.');
    } finally {
      setIsDisablingMfa(false);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    let csv = 'Timestamp,Event,Email,IP Address,Browser,OS\n';
    auditLogs.forEach(log => {
      csv += `"${new Date(log.timestamp).toISOString()}","${log.event}","${log.email}","${log.ipAddress || ''}","${log.browser || ''}","${log.os || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `security_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('CSV downloaded successfully', 'success');
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `security_audit_logs_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('JSON downloaded successfully', 'success');
  };

  const handleExportPDF = () => {
    // Premium print stylesheet simulation using a popup window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableRows = '';
    auditLogs.forEach(log => {
      tableRows += `
        <tr>
          <td>${new Date(log.timestamp).toLocaleString()}</td>
          <td>${log.event}</td>
          <td>${log.email}</td>
          <td>${log.ipAddress || 'localhost'}</td>
          <td>${log.browser || 'Unknown'}</td>
          <td>${log.os || 'Unknown'}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Security Center - Audit Logs Export</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-weight: 900; letter-spacing: -0.05em; font-size: 28px; margin-bottom: 5px; }
            p { font-size: 12px; color: #64748b; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background-color: #f8fafc; }
            tr:hover { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Chronicle Lab</h1>
          <p>Security Audit Event Report. Generated at ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>User Account</th>
                <th>IP Address</th>
                <th>Browser</th>
                <th>Operating System</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addNotification('PDF generated successfully', 'success');
  };

  const handleExportExcel = () => {
    // Generate functional XML-based Excel worksheet loaded natively by Excel
    let excelXML = `
      <xml version="1.0">
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Worksheet ss:Name="Audit Logs">
          <Table>
            <Row>
              <Cell><Data ss:Type="String">Timestamp</Data></Cell>
              <Cell><Data ss:Type="String">Event</Data></Cell>
              <Cell><Data ss:Type="String">Email</Data></Cell>
              <Cell><Data ss:Type="String">IP Address</Data></Cell>
              <Cell><Data ss:Type="String">Browser</Data></Cell>
              <Cell><Data ss:Type="String">OS</Data></Cell>
            </Row>
    `;
    auditLogs.forEach(log => {
      excelXML += `
        <Row>
          <Cell><Data ss:Type="String">${new Date(log.timestamp).toISOString()}</Data></Cell>
          <Cell><Data ss:Type="String">${log.event}</Data></Cell>
          <Cell><Data ss:Type="String">${log.email}</Data></Cell>
          <Cell><Data ss:Type="String">${log.ipAddress || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${log.browser || ''}</Data></Cell>
          <Cell><Data ss:Type="String">${log.os || ''}</Data></Cell>
        </Row>
      `;
    });
    excelXML += `
          </Table>
        </Worksheet>
      </Workbook>
    `;
    
    const blob = new Blob([excelXML], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `security_audit_logs_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Excel file downloaded', 'success');
  };

  // Download User Analytics Report
  const handleDownloadAnalytics = async () => {
    try {
      const { data } = await api.get('analytics/overview');
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `chronicle_user_analytics_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification('User analytics report downloaded', 'success');
    } catch (err) {
      addNotification('Failed to download analytics', 'warn');
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 relative">
      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 z-[9999] space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 animate-in slide-in-from-right duration-250 pointer-events-auto bg-card text-card-foreground ${
              n.type === 'success' ? 'border-emerald-500/20 text-emerald-500' :
              n.type === 'warn' ? 'border-amber-500/20 text-amber-500' : 'border-blue-500/20 text-primary'
            }`}
          >
            {n.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span className="text-xs font-bold font-sans">{n.text}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Shield className="text-primary stroke-[2.5]" size={36} /> Security Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Monitor authentication security, manage cryptographic active sessions, and verify system integrity.
          </p>
        </div>
        <button
          onClick={handleDownloadAnalytics}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border hover:bg-muted text-xs font-black uppercase tracking-wider transition-all"
        >
          <Download size={14} /> Download Analytics
        </button>
      </div>

      {/* Hero Health Score Card */}
      {scoreData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden bg-card">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Overall Security Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black">{scoreData.score}</span>
                <span className="text-xl text-muted-foreground font-bold">/100</span>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${scoreData.score >= 85 ? 'bg-emerald-500' : scoreData.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-sm font-black uppercase tracking-wider">{scoreData.status}</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                Last check: {new Date(scoreData.lastCheck).toLocaleTimeString()}
              </p>
            </div>
            <div className="absolute right-6 top-6 opacity-5 select-none pointer-events-none">
              <Shield size={160} className="stroke-[1]" />
            </div>
          </div>

          <div className="lg:col-span-2 border rounded-[2rem] p-8 bg-card space-y-4">
            <h2 className="text-lg font-black">Security Checklist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(scoreData.checks).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl border bg-muted/20">
                  <div className="flex items-center gap-3">
                    {val ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-destructive shrink-0" />
                    )}
                    <span className="text-xs font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${val ? 'text-emerald-500 bg-emerald-500/10' : 'text-destructive bg-destructive/10'}`}>
                    {val ? 'Active' : 'Unresolved'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sections Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Authentication Card */}
        <div className="border rounded-[2rem] p-8 bg-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg leading-tight">Credentials Security</h3>
                <p className="text-xs text-muted-foreground">Manage your login passcode settings.</p>
              </div>
            </div>
            <hr className="border-slate-100 dark:border-white/5" />
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Password strength</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scoreData?.checks?.strongPassword ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                  {scoreData?.checks?.strongPassword ? 'Strong' : 'Weak'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-foreground font-bold">
                  {user?.passwordLastChanged ? new Date(user.passwordLastChanged).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsChangingPwd(true)}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-black text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/10 uppercase tracking-widest"
          >
            Change Password
          </button>
        </div>

        {/* Multi-Factor Authentication Card */}
        <div className="border rounded-[2rem] p-8 bg-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg leading-tight">Multi-Factor Authentication</h3>
                <p className="text-xs text-muted-foreground">Enforce Google Authenticator dynamic passcodes.</p>
              </div>
            </div>
            <hr className="border-slate-100 dark:border-white/5" />
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">MFA status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${user?.mfaEnabled ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-100 dark:bg-white/5'}`}>
                  {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Recovery keys</span>
                <span className="text-foreground font-bold">
                  {user?.mfaEnabled ? 'Generated & Cached' : 'Not Active'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsConfiguringMfa(true);
              if (!user?.mfaEnabled && !mfaSetup) {
                handleInitializeMfa();
              }
            }}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-black text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/10 uppercase tracking-widest"
          >
            Configure MFA
          </button>
        </div>
      </div>

      {/* Active Sessions Panel */}
      <div className="border rounded-[2.5rem] p-8 bg-card space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black">Active Login Sessions</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Authorized web applications currently reading your security logs.</p>
          </div>
          <button
            onClick={handleRevokeOthers}
            disabled={sessions.length <= 1}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-all disabled:opacity-50"
          >
            Sign Out Other Devices
          </button>
        </div>

        {sessionsLoading ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground font-medium animate-pulse">
            Loading cryptographic active sessions...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(s => (
              <div key={s.id} className="border rounded-2xl p-5 bg-muted/20 relative space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {s.os === 'Windows' || s.os === 'macOS' || s.os === 'Linux' ? (
                        <Laptop size={16} className="text-muted-foreground" />
                      ) : (
                        <Smartphone size={16} className="text-muted-foreground" />
                      )}
                      <span className="font-black text-xs leading-none">{s.deviceName}</span>
                    </div>
                    {s.isCurrent ? (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                        Current Device
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-400">
                        Remote Session
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-slate-500 font-medium">
                    <p className="flex items-center gap-1.5"><Globe size={12} /> {s.browser} • {s.os}</p>
                    <p className="flex items-center gap-1.5"><MapPin size={12} /> {s.city || 'Bangalore'}, {s.country || 'India'}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">IP: {s.ipAddress}</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-white/5 mt-2">
                  <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock size={10} /> Active {s.isCurrent ? 'Now' : `${s.sessionAgeDays}d ago`}
                  </span>
                  {!s.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="text-[10px] font-black uppercase tracking-wider text-destructive hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trusted Devices Panel */}
      <div className="border rounded-[2.5rem] p-8 bg-card space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black">Trusted Validation Devices</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Registered devices that bypass standard MFA second factor code validations.</p>
          </div>
          <button
            onClick={handleTrustCurrentDevice}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border hover:bg-muted transition-all"
          >
            Trust Current Device
          </button>
        </div>

        {devicesLoading ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground font-medium animate-pulse">
            Loading trusted devices...
          </div>
        ) : trustedDevices.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/10">
            <Laptop size={24} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground italic font-medium">No devices registered as trusted. All logins require dynamic MFA check.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustedDevices.map(d => (
              <div key={d.id} className="border rounded-2xl p-5 bg-muted/20 space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {isRenamingDevice === d.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={renamedName}
                          onChange={(e) => setRenamedName(e.target.value)}
                          className="bg-card border rounded px-2 py-1 text-xs font-bold w-36 outline-none"
                          placeholder="Device name..."
                        />
                        <button
                          onClick={() => handleRenameDevice(d.id)}
                          className="text-[9px] font-black uppercase text-primary"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => {
                          setIsRenamingDevice(d.id);
                          setRenamedName(d.deviceName);
                        }}
                        className="font-black text-xs cursor-pointer hover:underline flex items-center gap-1"
                      >
                        {d.deviceName} <span className="text-[8px] text-muted-foreground font-normal hover:text-primary">(rename)</span>
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground font-medium">{d.browser} • {d.os}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                    Trusted
                  </span>
                </div>
                <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-white/5 text-[9px] text-muted-foreground font-semibold">
                  <span>Added: {new Date(d.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleRemoveDeviceTrust(d.id)}
                    className="text-destructive hover:underline font-black uppercase tracking-wider"
                  >
                    Remove Trust
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failed Attempts & Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border rounded-[2rem] p-8 bg-card space-y-6">
          <div>
            <h3 className="font-black text-lg">Failed Logins Analysis</h3>
            <p className="text-xs text-muted-foreground">Suspicious active logs monitor.</p>
          </div>
          <hr className="border-slate-100 dark:border-white/5" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Last 24 Hours</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${failedAttempts.day > 0 ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                {failedAttempts.day}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Last 7 Days</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${failedAttempts.week > 0 ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                {failedAttempts.week}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">Last 30 Days</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black ${failedAttempts.month > 0 ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                {failedAttempts.month}
              </span>
            </div>
          </div>
          {failedAttempts.day === 0 && failedAttempts.week === 0 && failedAttempts.month === 0 && (
            <p className="text-center text-[10px] text-emerald-500 font-bold bg-emerald-500/10 py-2.5 rounded-xl">
              ✓ No suspicious login attempts detected.
            </p>
          )}
        </div>

        <div className="lg:col-span-2 border rounded-[2rem] p-8 bg-card space-y-6">
          <div>
            <h3 className="font-black text-lg">Diagnostics & API Status</h3>
            <p className="text-xs text-muted-foreground">Server configuration environment health validation.</p>
          </div>
          <hr className="border-slate-100 dark:border-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
            {/* Headers Diagnostic */}
            <div className="space-y-3">
              <p className="font-black uppercase tracking-widest text-[9px] text-muted-foreground">Security Headers Status</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {headers.map(h => (
                  <div key={h.name} className="flex justify-between items-center p-2.5 border rounded-xl bg-muted/20">
                    <span className="text-slate-600 dark:text-slate-400">{h.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${h.value === 'Healthy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {h.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DB & API Status */}
            <div className="space-y-3">
              <p className="font-black uppercase tracking-widest text-[9px] text-muted-foreground">Database & API Status</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {dbStatus.map(d => (
                  <div key={d.name} className="flex justify-between items-center p-2.5 border rounded-xl bg-muted/20">
                    <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                      {d.value}
                    </span>
                  </div>
                ))}
                {apiConfig.map(a => (
                  <div key={a.name} className="flex justify-between items-center p-2.5 border rounded-xl bg-muted/20">
                    <span className="text-slate-600 dark:text-slate-400">{a.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${a.configured ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                      {a.configured ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="border rounded-[2.5rem] p-8 bg-card space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black">Security Audit Logs</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Cryptographically signed security updates and administrative operations log.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} className="p-2 border rounded-xl hover:bg-muted text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Download size={12} /> CSV
            </button>
            <button onClick={handleExportJSON} className="p-2 border rounded-xl hover:bg-muted text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Download size={12} /> JSON
            </button>
            <button onClick={handleExportPDF} className="p-2 border rounded-xl hover:bg-muted text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} /> PDF
            </button>
            <button onClick={handleExportExcel} className="p-2 border rounded-xl hover:bg-muted text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Database size={12} /> Excel
            </button>
          </div>
        </div>

        {/* Date Filter & Search query */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit logs by event, browser, OS, IP or user email..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/20 border border-slate-200 dark:border-white/10 outline-none text-xs font-bold leading-normal placeholder:font-bold focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-muted/20 border rounded-2xl px-4 py-3 text-xs font-bold text-slate-500 outline-none"
            />
            <span className="text-slate-400 text-xs font-black uppercase">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-muted/20 border rounded-2xl px-4 py-3 text-xs font-bold text-slate-500 outline-none"
            />
          </div>
        </div>

        <div className="border rounded-[2rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b bg-muted/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Browser/OS</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold">
              {logsLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground animate-pulse font-bold">
                    Loading security logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground italic font-medium">
                    No security events found matching criteria.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-black">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide ${log.event.includes('SUCCESS') ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                        {log.event}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                      {log.ipAddress === '::1' || log.ipAddress === '127.0.0.1' ? '127.0.0.1 (Localhost)' : log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {log.browser || 'Unknown'} / {log.os || 'Unknown'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PORTALS & DIALOGS */}

      {/* Password Reminder Dialog */}
      {showPasswordReminder && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="bg-card border rounded-[2.5rem] p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center gap-3.5 text-amber-500">
              <AlertTriangle size={32} />
              <h3 className="font-black text-xl leading-tight">Security Reminder</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              It has been **30 days** since you last updated your account password. Changing your passcode regularly is recommended to improve dashboard security.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordReminder(false);
                  setIsChangingPwd(true);
                }}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow"
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordReminder(false);
                  sessionStorage.setItem('dismissed_pwd_reminder', 'true');
                }}
                className="flex-1 border hover:bg-muted py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Device Trust Reminder Dialog */}
      {showTrustReminder && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="bg-card border rounded-[2.5rem] p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center gap-3.5 text-primary">
              <Laptop size={32} />
              <h3 className="font-black text-xl leading-tight">Trust this device?</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
              Trusted devices bypass multi-factor authentication dynamic challenges on future login updates from this browser session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleTrustCurrentDevice}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow"
              >
                Trust Device
              </button>
              <button
                onClick={() => setShowTrustReminder(false)}
                className="flex-1 border hover:bg-muted py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Change Password Portal Modal */}
      {isChangingPwd && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsChangingPwd(false)}
          />
          <div className="bg-card border rounded-[3rem] p-8 max-w-lg w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl">Change Credentials Passcode</h3>
              <button
                onClick={() => setIsChangingPwd(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-slate-400"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-muted/20 border rounded-2xl px-4 py-3 outline-none text-xs font-bold leading-normal focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-muted/20 border rounded-2xl px-4 py-3 outline-none text-xs font-bold leading-normal focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-muted/20 border rounded-2xl px-4 py-3 outline-none text-xs font-bold leading-normal focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white"
                  required
                />
              </div>

              {/* Strength criteria checkmarks */}
              <div className="p-4 border rounded-2xl bg-muted/20 space-y-2 text-[10px] font-bold text-slate-500">
                <p className="font-black uppercase tracking-widest text-[9px] text-muted-foreground mb-1">Passcode Criteria Checklist</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    {passwordCriteria.length ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-300" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordCriteria.uppercase ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-300" />}
                    <span>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordCriteria.lowercase ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-300" />}
                    <span>One lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordCriteria.number ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-300" />}
                    <span>One digit/number</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {passwordCriteria.special ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-slate-300" />}
                    <span>One special character</span>
                  </div>
                </div>
              </div>

              {pwdError && <p className="text-xs font-bold text-red-500">{pwdError}</p>}
              {pwdSuccess && <p className="text-xs font-bold text-emerald-500">{pwdSuccess}</p>}

              <button
                type="submit"
                disabled={isUpdatingPwd || !Object.values(passwordCriteria).every(Boolean)}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-black text-xs hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isUpdatingPwd ? 'Updating password...' : 'Apply Code Update'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MFA Configuration Portal Modal */}
      {isConfiguringMfa && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsConfiguringMfa(false)}
          />
          <div className="bg-card border rounded-[3rem] p-8 max-w-lg w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl">MFA Security Settings</h3>
              <button
                onClick={() => setIsConfiguringMfa(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-slate-400"
              >
                ✕
              </button>
            </div>

            {user?.mfaEnabled ? (
              <div className="space-y-4">
                <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <h4 className="text-xs font-black">Multi-factor Authentication Active</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">Your credentials dashboard is secured by standard TOTP tokens.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deactivate MFA</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value)}
                      placeholder="Enter 6-digit Authenticator code..."
                      className="flex-1 bg-muted/20 border rounded-2xl px-4 py-3 outline-none text-xs font-bold leading-normal focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={handleDisableMfa}
                      disabled={isDisablingMfa || disableCode.length < 6}
                      className="px-4 py-3 rounded-2xl bg-destructive text-white hover:opacity-90 font-black text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                      {isDisablingMfa ? 'Stopping...' : 'Disable'}
                    </button>
                  </div>
                </div>
                {mfaError && <p className="text-xs font-bold text-red-500">{mfaError}</p>}
                {mfaSuccess && <p className="text-xs font-bold text-emerald-500">{mfaSuccess}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {mfaSetup ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Scan this QR code in Google Authenticator or Microsoft Authenticator, then enter the validation passcode below.
                    </p>
                    <div className="flex justify-center p-4 border rounded-2xl bg-white max-w-[200px] mx-auto">
                      {mfaSetup.qrCode && <img src={mfaSetup.qrCode} alt="TOTP QR Code" className="w-full h-full" />}
                    </div>
                    <div className="text-center font-mono text-xs bg-muted/20 py-2.5 rounded-xl border">
                      Secret Key: <span className="font-black select-all text-slate-900 dark:text-slate-100">{mfaSetup.secret}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enter verification code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="Enter 6-digit code..."
                          disabled={!!mfaSuccess}
                          className="flex-1 bg-muted/20 border rounded-2xl px-4 py-3 outline-none text-xs font-bold leading-normal focus:ring-1 focus:ring-primary/20 text-slate-800 dark:text-white disabled:opacity-60"
                        />
                        <button
                          onClick={handleEnableMfa}
                          disabled={mfaCode.length < 6 || !!mfaSuccess}
                          className={cn(
                            "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider disabled:opacity-50 transition-colors duration-300",
                            mfaSuccess 
                              ? "bg-emerald-500 text-white" 
                              : "bg-primary text-white hover:opacity-90"
                          )}
                        >
                          {mfaSuccess ? 'Activated' : 'Verify & Activate'}
                        </button>
                      </div>
                    </div>

                    {backupCodes.length > 0 && (
                      <div className="p-4 border rounded-2xl bg-muted/20 space-y-2">
                        <p className="font-black uppercase tracking-widest text-[9px] text-muted-foreground flex justify-between items-center">
                          Backup Recovery Codes
                          <button
                            onClick={() => {
                              copyToClipboard(backupCodes.join('\n'));
                              addNotification('Backup codes copied', 'success');
                            }}
                            className="text-primary hover:underline lowercase"
                          >
                            Copy codes
                          </button>
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {backupCodes.map((code, idx) => (
                            <div key={idx} className="flex justify-between p-1.5 border rounded bg-card select-all">
                              <span>{code}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[9px] text-amber-500 font-semibold leading-relaxed mt-2">
                          ✕ Keep these codes safe. They let you log in if you lose access to your Authenticator app.
                        </p>
                      </div>
                    )}

                    {mfaError && <p className="text-xs font-bold text-red-500">{mfaError}</p>}
                    {mfaSuccess && <p className="text-xs font-bold text-emerald-500">{mfaSuccess}</p>}
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center space-y-4">
                    <p className="text-xs text-muted-foreground font-medium animate-pulse">Initializing settings setup...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
