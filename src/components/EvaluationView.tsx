import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  UserCheck, 
  MessageCircle, 
  Building2, 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  Sparkles, 
  ExternalLink,
  Calendar,
  Layers,
  FileDown
} from 'lucide-react';
import { DailyObservation, Department, ZoneId, InspectionStatus } from '../types';
import { DEPARTMENTS, MANAGERS, ZONES } from '../data/masterData';

interface EvaluationViewProps {
  currentDate: string;
  observations: DailyObservation[];
  onSelectDepartment: (zone: ZoneId, deptCode: string) => void;
  onExportPDF: () => void;
}

// Utility to calculate minutes difference between two times (HH:mm or ISO)
export function calculateMinutesDiff(startStr?: string, endStr?: string, dateStr?: string): number | null {
  if (!startStr || !endStr) return null;

  // Check if both are HH:mm format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (timeRegex.test(startStr) && timeRegex.test(endStr)) {
    const [h1, m1] = startStr.split(':').map(Number);
    const [h2, m2] = endStr.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // if past midnight
    return diff;
  }

  // If ISO strings
  const d1 = new Date(startStr);
  const d2 = new Date(endStr);
  if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60));
    return diff >= 0 ? diff : null;
  }

  return null;
}

// Helper to format minutes nicely (e.g. 35m or 1j 15m)
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Menit`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} Jam ${remainingMinutes} Menit` : `${hours} Jam`;
}

// WhatsApp link generator
const getWhatsAppUrl = (phone?: string, text?: string) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return null;
  const formatted = cleanPhone.startsWith('0') 
    ? `62${cleanPhone.slice(1)}` 
    : cleanPhone.startsWith('62') 
    ? cleanPhone 
    : `62${cleanPhone}`;
  return `https://wa.me/${formatted}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  currentDate,
  observations,
  onSelectDepartment,
  onExportPDF
}) => {
  const [timeframe, setTimeframe] = useState<'TODAY' | 'ALL'>('TODAY');
  const [selectedZone, setSelectedZone] = useState<ZoneId | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'DEPT_SPEED' | 'MANAGER_ACTIVITY' | 'SLA_MONITOR'>('DEPT_SPEED');

  // Filter observations based on timeframe
  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      if (timeframe === 'TODAY') {
        return obs.date === currentDate;
      }
      return true;
    });
  }, [observations, timeframe, currentDate]);

  // 1. DEPARTEMEN PALING CEPAT SELESAI
  const departmentSpeedStats = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      // Find all resolved observations for this department in the selected timeframe
      const deptObs = filteredObservations.filter(
        o => o.deptCode === dept.code && o.status === 'RESOLVED'
      );

      const durations: { diffMinutes: number; obs: DailyObservation }[] = [];

      deptObs.forEach(obs => {
        let diff = calculateMinutesDiff(obs.inspectionTime, obs.executionTime);
        if (diff === null) {
          diff = calculateMinutesDiff(obs.createdAt, obs.updatedAt);
        }
        if (diff !== null && diff > 0) {
          durations.push({ diffMinutes: diff, obs });
        }
      });

      const totalResolved = deptObs.length;
      const avgDuration = durations.length > 0 
        ? Math.round(durations.reduce((sum, d) => sum + d.diffMinutes, 0) / durations.length) 
        : null;
      
      const fastestDuration = durations.length > 0 
        ? Math.min(...durations.map(d => d.diffMinutes)) 
        : null;

      // Count compliance with 1 hour SLA (<= 60 mins)
      const onTimeSLACount = durations.filter(d => d.diffMinutes <= 60).length;
      const slaCompliancePercent = durations.length > 0 
        ? Math.round((onTimeSLACount / durations.length) * 100) 
        : 100;

      // Current department observation today (supports multiple findings per dept)
      const currentTodayObsList = observations.filter(o => o.deptCode === dept.code && o.date === currentDate);
      const hasPending = currentTodayObsList.some(o => o.status === 'NON_STANDARD');
      const hasInProgress = currentTodayObsList.some(o => o.status === 'IN_PROGRESS');
      const hasResolved = currentTodayObsList.some(o => o.status === 'RESOLVED');
      const hasStd = currentTodayObsList.some(o => o.status === 'STANDARD');
      const currentStatus: InspectionStatus | 'UNCHECKED' = hasPending 
        ? 'NON_STANDARD' 
        : hasInProgress 
        ? 'IN_PROGRESS' 
        : hasResolved 
        ? 'RESOLVED' 
        : hasStd 
        ? 'STANDARD' 
        : 'UNCHECKED';

      return {
        dept,
        totalResolved,
        avgDuration,
        fastestDuration,
        durationsCount: durations.length,
        slaCompliancePercent,
        lastResolvedObs: durations.length > 0 ? durations[durations.length - 1].obs : null,
        currentStatus,
        assignedPs: dept.psList[0]?.name || '-'
      };
    })
    .filter(item => {
      // Zone filter
      if (selectedZone !== 'ALL' && item.dept.zone !== selectedZone) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = item.dept.code.toLowerCase().includes(q);
        const matchName = item.dept.name.toLowerCase().includes(q);
        const matchPs = item.assignedPs.toLowerCase().includes(q);
        return matchCode || matchName || matchPs;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by fastest average duration first
      if (a.avgDuration !== null && b.avgDuration !== null) {
        return a.avgDuration - b.avgDuration;
      }
      if (a.avgDuration !== null) return -1;
      if (b.avgDuration !== null) return 1;
      return b.totalResolved - a.totalResolved;
    });
  }, [filteredObservations, observations, currentDate, selectedZone, searchQuery]);

  // 2. MANAGER YANG LEBIH SERING MENGECEK DEPARTEMEN
  const managerActivityStats = useMemo(() => {
    return MANAGERS.map(managerName => {
      const allManagerObs = observations.filter(o => o.managerName === managerName);
      const timeframeManagerObs = filteredObservations.filter(o => o.managerName === managerName);
      const todayManagerObs = observations.filter(o => o.managerName === managerName && o.date === currentDate);

      // Distinct departments checked
      const checkedDeptCodes = new Set(timeframeManagerObs.map(o => o.deptCode));
      const totalChecks = timeframeManagerObs.length;
      const findingsCount = timeframeManagerObs.filter(o => o.status === 'NON_STANDARD' || o.status === 'RESOLVED').length;
      const resolvedCount = timeframeManagerObs.filter(o => o.status === 'RESOLVED').length;
      const resolutionRate = findingsCount > 0 ? Math.round((resolvedCount / findingsCount) * 100) : 100;

      // Department coverage percentage (out of 16 departments)
      const deptCoveragePct = Math.round((checkedDeptCodes.size / DEPARTMENTS.length) * 100);

      return {
        name: managerName,
        totalChecks,
        allTimeChecks: allManagerObs.length,
        todayChecks: todayManagerObs.length,
        distinctDeptsCount: checkedDeptCodes.size,
        deptCoveragePct,
        findingsCount,
        resolvedCount,
        resolutionRate,
        lastCheckedDate: allManagerObs.length > 0 ? allManagerObs[0].date : '-'
      };
    })
    .filter(mgr => {
      if (searchQuery.trim()) {
        return mgr.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by total checks in selected timeframe descending
      if (b.totalChecks !== a.totalChecks) {
        return b.totalChecks - a.totalChecks;
      }
      return b.allTimeChecks - a.allTimeChecks;
    });
  }, [observations, filteredObservations, currentDate, searchQuery]);

  // 3. OVERALL KPI CALCULATIONS
  const overallKPIs = useMemo(() => {
    // All resolved durations
    const allDurations: number[] = [];
    filteredObservations.forEach(obs => {
      if (obs.status === 'RESOLVED') {
        let diff = calculateMinutesDiff(obs.inspectionTime, obs.executionTime);
        if (diff === null) {
          diff = calculateMinutesDiff(obs.createdAt, obs.updatedAt);
        }
        if (diff !== null && diff > 0) {
          allDurations.push(diff);
        }
      }
    });

    const avgResolutionTime = allDurations.length > 0 
      ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length) 
      : null;

    const onTimeSLAs = allDurations.filter(d => d <= 60).length;
    const slaComplianceRate = allDurations.length > 0 
      ? Math.round((onTimeSLAs / allDurations.length) * 100) 
      : 100;

    // Fastest department
    const resolvedDeptStats = departmentSpeedStats.filter(d => d.avgDuration !== null);
    const fastestDept = resolvedDeptStats.length > 0 ? resolvedDeptStats[0] : null;

    // Top active manager
    const topManager = managerActivityStats.length > 0 ? managerActivityStats[0] : null;

    // Active pending non-standard findings
    const activeFindings = filteredObservations.filter(o => o.status === 'NON_STANDARD');

    return {
      avgResolutionTime,
      slaComplianceRate,
      fastestDept,
      topManager,
      activeFindingsCount: activeFindings.length,
      totalAudits: filteredObservations.length
    };
  }, [filteredObservations, departmentSpeedStats, managerActivityStats]);

  // Active findings awaiting PS resolution
  const activeFindingsList = useMemo(() => {
    return observations
      .filter(o => o.date === currentDate && o.status === 'NON_STANDARD')
      .map(obs => {
        const dept = DEPARTMENTS.find(d => d.code === obs.deptCode);
        const assignedPsObj = dept?.psList.find(p => p.name === obs.assignedPsName) || dept?.psList[0];
        
        // Calculate minutes elapsed since inspectionTime
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
        
        const elapsed = calculateMinutesDiff(obs.inspectionTime, currentTimeStr) || 0;
        const remainingSLA = 60 - elapsed;
        const isOverdue = remainingSLA < 0;

        return {
          obs,
          dept,
          assignedPsObj,
          elapsed,
          remainingSLA,
          isOverdue
        };
      });
  }, [observations, currentDate]);

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Trophy className="w-4 h-4 text-amber-300" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                EVALUASI PENGISIAN & LEADERBOARD
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pantau departemen yang menyelesaikan display paling cepat, kepatuhan SLA 1 jam, dan keaktifan manager dalam melakukan inspeksi harian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTimeframe('TODAY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === 'TODAY' 
                    ? 'bg-white text-indigo-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini ({currentDate})
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === 'ALL' 
                    ? 'bg-white text-indigo-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Data
              </button>
            </div>

            {/* Export PDF Button */}
            <button
              type="button"
              onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Rekap PDF</span>
            </button>
          </div>
        </div>

        {/* Sub-Filters: Search & Zone */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Zone Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedZone('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                selectedZone === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Zona
            </button>
            {ZONES.map(z => (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZone(z.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedZone === z.id
                    ? 'bg-indigo-600 text-white'
                    : `${z.bgColor} ${z.color} border border-slate-200/60 hover:opacity-80`
                }`}
              >
                {z.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dept, manager, atau PS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* 2. KPI SUMMARY METRIC CARDS (SLA & SPEED HIGHLIGHTS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Rata-rata Kecepatan Pengerjaan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Rata-rata Selesai
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {overallKPIs.avgResolutionTime ? formatDuration(overallKPIs.avgResolutionTime) : '-'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <Clock className="w-3 h-3" />
            <span>Target SLA: Maksimal 1 Jam (60m)</span>
          </div>
        </div>

        {/* Card 2: Kepatuhan SLA 1 Jam */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Kepatuhan SLA (≤ 1 Jam)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {overallKPIs.slaComplianceRate}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">Tepat Waktu</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Selesai sebelum 60 menit sejak dilaporkan
          </p>
        </div>

        {/* Card 3: Departemen Paling Cepat Selesai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Dept Tercepat ⚡
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-sm font-black text-slate-900 block truncate">
              {overallKPIs.fastestDept ? `[${overallKPIs.fastestDept.dept.code}] ${overallKPIs.fastestDept.dept.name}` : '-'}
            </span>
            <span className="text-lg font-black text-indigo-700">
              {overallKPIs.fastestDept?.avgDuration ? `${overallKPIs.fastestDept.avgDuration} Menit` : '-'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            PIC: {overallKPIs.fastestDept?.assignedPs?.split(' ')[0] || '-'}
          </p>
        </div>

        {/* Card 4: Manager Paling Rajin Cek */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Manager Teraktif 👑
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-base sm:text-lg font-black text-purple-900 block">
              {overallKPIs.topManager ? overallKPIs.topManager.name : '-'}
            </span>
            <span className="text-xs text-purple-700 font-bold">
              {overallKPIs.topManager ? `${overallKPIs.topManager.totalChecks} Dept Diperiksa` : '-'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Cakupan Toko: {overallKPIs.topManager?.deptCoveragePct || 0}%
          </p>
        </div>

      </div>

      {/* 3. SUB-MENU TABS FOR DETAILS */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('DEPT_SPEED')}
          className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'DEPT_SPEED'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Ranking Kecepatan Departemen</span>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {departmentSpeedStats.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MANAGER_ACTIVITY')}
          className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'MANAGER_ACTIVITY'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-purple-500" />
          <span>Leaderboard Keaktifan Manager</span>
          <span className="bg-purple-50 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {managerActivityStats.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SLA_MONITOR')}
          className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'SLA_MONITOR'
              ? 'border-rose-500 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-500" />
          <span>Monitor SLA 1 Jam & Temuan Aktif</span>
          {activeFindingsList.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
              {activeFindingsList.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. TAB 1: RANKING DEPARTEMEN PALING CEPAT SELESAI */}
      {activeTab === 'DEPT_SPEED' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Daftar Departemen Mana yang Selesai Paling Cepat
              </h3>
              <p className="text-[11px] text-slate-500">
                Diurutkan berdasarkan rata-rata durasi penyelesaian perbaikan display dari tercepat. Target SLA: Maksimal 1 Jam.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Data Periode: {timeframe === 'TODAY' ? `Hari Ini (${currentDate})` : 'Semua Data Historis'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-14 text-center">Rank</th>
                  <th className="py-3 px-3">Departemen</th>
                  <th className="py-3 px-3 text-center">Rata-rata Durasi</th>
                  <th className="py-3 px-3 text-center">Rekor Tercepat</th>
                  <th className="py-3 px-3 text-center">Kepatuhan SLA (≤ 1 Jam)</th>
                  <th className="py-3 px-3">PIC PS</th>
                  <th className="py-3 px-3 text-center">Status Hari Ini</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentSpeedStats.map((item, index) => {
                  const isTop3 = index < 3 && item.avgDuration !== null;
                  const isWithinSLA = item.avgDuration !== null && item.avgDuration <= 60;

                  return (
                    <tr 
                      key={item.dept.code} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        index === 0 && item.avgDuration !== null ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-3 text-center">
                        {index === 0 && item.avgDuration !== null ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-2xs">
                            🥇
                          </span>
                        ) : index === 1 && item.avgDuration !== null ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-2xs">
                            🥈
                          </span>
                        ) : index === 2 && item.avgDuration !== null ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs shadow-2xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono font-bold">
                            #{index + 1}
                          </span>
                        )}
                      </td>

                      {/* Department Column */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {item.dept.code}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {item.dept.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Zona: {item.dept.zone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Average Duration */}
                      <td className="py-3 px-3 text-center">
                        {item.avgDuration !== null ? (
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                              item.avgDuration <= 30
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.avgDuration <= 60
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              ⚡ {formatDuration(item.avgDuration)}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {item.durationsCount} temuan selesai
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Belum ada perbaikan
                          </span>
                        )}
                      </td>

                      {/* Fastest Duration Record */}
                      <td className="py-3 px-3 text-center">
                        {item.fastestDuration !== null ? (
                          <span className="font-bold text-slate-700 text-xs">
                            🏆 {item.fastestDuration} m
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* SLA Compliance */}
                      <td className="py-3 px-3 text-center">
                        {item.avgDuration !== null ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isWithinSLA 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isWithinSLA ? '✓ Sesuai SLA (<1 Jam)' : '⚠️ Melebihi 1 Jam'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      {/* PIC PS */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 block truncate max-w-[120px]">
                          {item.assignedPs}
                        </span>
                      </td>

                      {/* Current Status Today */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.currentStatus === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.currentStatus === 'NON_STANDARD'
                            ? 'bg-rose-100 text-rose-800'
                            : item.currentStatus === 'STANDARD'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.currentStatus === 'RESOLVED' ? 'Selesai' :
                           item.currentStatus === 'NON_STANDARD' ? 'Perlu PS' :
                           item.currentStatus === 'STANDARD' ? 'Standar' : 'Belum Cek'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectDepartment(item.dept.zone, item.dept.code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition-all shadow-2xs"
                        >
                          <span>Buka Dept</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 2: LEADERBOARD KEAKTIFAN MANAGER */}
      {activeTab === 'MANAGER_ACTIVITY' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Leaderboard Keaktifan Manager Mengecek Departemen
              </h3>
              <p className="text-[11px] text-slate-500">
                Peringkat manager berdasarkan frekuensi pengecekan dan jumlah departemen yang telah diaudit.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Total 10 Manager Toko
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-14 text-center">Rank</th>
                  <th className="py-3 px-3">Nama Manager</th>
                  <th className="py-3 px-3 text-center">Total Cek (Periode Ini)</th>
                  <th className="py-3 px-3 text-center">Cek Hari Ini</th>
                  <th className="py-3 px-3 text-center">Cakupan Dept Toko</th>
                  <th className="py-3 px-3 text-center">Temuan Dicatat</th>
                  <th className="py-3 px-3 text-center">Tingkat Tindak Lanjut</th>
                  <th className="py-3 px-3 text-center">Gelar Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managerActivityStats.map((mgr, index) => {
                  const isTopActive = index === 0;

                  return (
                    <tr 
                      key={mgr.name} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTopActive ? 'bg-purple-50/30' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 text-center">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-2xs">
                            👑
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-2xs">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs shadow-2xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono font-bold">
                            #{index + 1}
                          </span>
                        )}
                      </td>

                      {/* Manager Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                            index === 0 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {mgr.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {mgr.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Manager Duty Alsut
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Checks */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-lg">
                          {mgr.totalChecks} Dept
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Total Historis: {mgr.allTimeChecks}
                        </span>
                      </td>

                      {/* Today Checks */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-extrabold text-xs ${
                          mgr.todayChecks > 0 ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {mgr.todayChecks > 0 ? `✓ ${mgr.todayChecks} Dept` : 'Belum Cek'}
                        </span>
                      </td>

                      {/* Department Coverage */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-800">
                            {mgr.distinctDeptsCount} / {DEPARTMENTS.length} Dept ({mgr.deptCoveragePct}%)
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-purple-600 rounded-full" 
                              style={{ width: `${mgr.deptCoveragePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Findings count */}
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold text-xs ${
                          mgr.findingsCount > 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          {mgr.findingsCount > 0 ? `${mgr.findingsCount} Temuan` : '0 Temuan'}
                        </span>
                      </td>

                      {/* Resolution Rate */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-extrabold text-emerald-600">
                          {mgr.resolutionRate}% Selesai
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {mgr.resolvedCount} dari {mgr.findingsCount} resolved
                        </span>
                      </td>

                      {/* Badge / Award */}
                      <td className="py-3 px-3 text-center">
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            ⭐ Top Auditor
                          </span>
                        ) : index < 3 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            ✨ Auditor Aktif
                          </span>
                        ) : mgr.todayChecks > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                            🟢 On-Duty
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 3: SLA MONITOR & ACTIVE FINDINGS TRACKER */}
      {activeTab === 'SLA_MONITOR' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                Monitor Kepatuhan SLA Pengerjaan 1 Jam
              </h3>
              <p className="text-[11px] text-slate-500">
                Semua temuan display wajib diselesaikan tim PS dalam batas waktu SLA maksimal 1 Jam (60 Menit).
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              Target SLA: ≤ 60 Menit
            </span>
          </div>

          {/* Active Pending Findings */}
          {activeFindingsList.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                Tidak Ada Temuan yang Tertunda Hari Ini!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Semua departemen yang diperiksa telah berstatus STANDAR atau sudah SELESAI (RESOLVED) oleh tim PS.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {activeFindingsList.length} Temuan Sedang Berjalan Menunggu Perbaikan PS:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeFindingsList.map(({ obs, dept, assignedPsObj, elapsed, remainingSLA, isOverdue }) => {
                  const waReminderUrl = getWhatsAppUrl(
                    assignedPsObj?.phone,
                    `🚨 *REMINDER SLA 1 JAM - DISPLAY BELUM SELESAI*\n\nHalo Rekan PS *${assignedPsObj?.name || 'PS'}*,\nMohon segera tindaklanjuti temuan display di departemen *[${obs.deptCode}] ${obs.deptName}*:\n\n• Catatan: "${obs.managerNotes || 'Mohon dirapikan sesuai standar'}"\n• Pelapor: Manager ${obs.managerName} (Jam ${obs.inspectionTime || '-'})\n• Target SLA Pengerjaan: Maksimal 1 Jam\n• Link Pengecekan & Input Foto: https://dcalsuter2026.vercel.app/\n\nHarap segera diselesaikan dan upload bukti foto pengerjaan di web. Terima kasih!`
                  );

                  return (
                    <div 
                      key={obs.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                        isOverdue 
                          ? 'border-rose-300 bg-rose-50/40' 
                          : 'border-amber-300 bg-amber-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-black text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            [{obs.deptCode}] {obs.deptName}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isOverdue ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {isOverdue ? '🚨 Lewat SLA 1 Jam' : '⏱️ Dalam Pengerjaan'}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-700">
                          <p className="font-semibold line-clamp-2">
                            {obs.managerNotes || 'Display tidak standar, perlu perbaikan.'}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                            <span>Manager: {obs.managerName} ({obs.inspectionTime || '-'})</span>
                            <span>PIC PS: {obs.assignedPsName || '-'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timer & SLA status bar */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-[10px] text-slate-400 block font-semibold">Status Durasi</span>
                          <span className={`font-black ${isOverdue ? 'text-rose-600' : 'text-amber-700'}`}>
                            {isOverdue 
                              ? `Lewat ${Math.abs(remainingSLA)} Menit dari SLA!` 
                              : `Sisa waktu SLA: ${remainingSLA} Menit`}
                          </span>
                        </div>

                        {assignedPsObj?.phone && waReminderUrl && (
                          <a
                            href={waReminderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                            title="Ingatkan PS via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Ingatkan WA</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
