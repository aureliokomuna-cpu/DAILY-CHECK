import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileDown, 
  Users,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { DailyObservation, ZoneId } from '../types';
import { ZONES, DEPARTMENTS, MANAGERS } from '../data/masterData';

interface AnalyticsDashboardProps {
  currentDate: string;
  observations: DailyObservation[];
  onExportPDF: () => void;
  onFilterZone?: (zoneId: ZoneId) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  currentDate,
  observations,
  onExportPDF,
  onFilterZone
}) => {
  // Current date observations
  const dailyObs = observations.filter(o => o.date === currentDate);
  const totalDaily = dailyObs.length;
  const standardDaily = dailyObs.filter(o => o.status === 'STANDARD').length;
  const nonStdDaily = dailyObs.filter(o => o.status === 'NON_STANDARD').length;
  const resolvedDaily = dailyObs.filter(o => o.status === 'RESOLVED').length;

  const totalEffectiveOk = standardDaily + resolvedDaily;
  const complianceRate = totalDaily > 0 ? Math.round((totalEffectiveOk / totalDaily) * 100) : 100;

  // Historical overall stats
  const allTotal = observations.length;
  const allResolved = observations.filter(o => o.status === 'RESOLVED').length;
  const allNonStd = observations.filter(o => o.status === 'NON_STANDARD').length;

  // Zone Breakdown calculation for today
  const zoneStats = ZONES.map(zone => {
    const zoneDepts = DEPARTMENTS.filter(d => d.zone === zone.id);
    const zoneObs = dailyObs.filter(o => o.zoneId === zone.id);
    const checkedCount = zoneObs.length;
    const okCount = zoneObs.filter(o => o.status === 'STANDARD' || o.status === 'RESOLVED').length;
    const issueCount = zoneObs.filter(o => o.status === 'NON_STANDARD').length;
    const zoneCompliance = checkedCount > 0 ? Math.round((okCount / checkedCount) * 100) : 100;

    return {
      zone,
      totalDepts: zoneDepts.length,
      checkedCount,
      okCount,
      issueCount,
      zoneCompliance
    };
  });

  // Manager Leaderboard calculation
  const managerStats = MANAGERS.map(mgr => {
    const mgrObs = observations.filter(o => o.managerName === mgr);
    const findingsCount = mgrObs.filter(o => o.status === 'NON_STANDARD' || o.status === 'RESOLVED').length;
    const todayCount = mgrObs.filter(o => o.date === currentDate).length;
    return {
      name: mgr,
      totalAudits: mgrObs.length,
      todayCount,
      findingsCount
    };
  }).sort((a, b) => b.totalAudits - a.totalAudits);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Compliance Gauge Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kepatuhan Display Harian
            </span>
            <div className={`p-2 rounded-xl ${
              complianceRate >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                complianceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {complianceRate}%
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Target: 95%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  complianceRate >= 80 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${complianceRate}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            {standardDaily + resolvedDaily} dari {totalDaily} departemen dicek telah standar
          </p>
        </div>

        {/* Total Observasi Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dept Telah Dicek
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {totalDaily}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {DEPARTMENTS.length} Dept
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Progress cek toko: {Math.round((totalDaily / DEPARTMENTS.length) * 100)}% hari ini
          </p>
        </div>

        {/* Temuan Aktif Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Temuan Menunggu PS
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-600">
                {nonStdDaily}
              </span>
              <span className="text-xs text-rose-500 font-semibold">
                Perlu Eksekusi
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Team PS sedang menindaklanjuti temuan lapangan
          </p>
        </div>

        {/* Selesai Diperbaiki Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selesai Dibenahi (PS)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-600">
                {resolvedDaily}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">
                Resolved
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Verifikasi foto after action sudah terkonfirmasi
          </p>
        </div>

      </div>

      {/* Zonasi Real-time Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Performa Kepatuhan Per Zona ({currentDate})
            </h3>
            <p className="text-xs text-slate-500">
              Living, Dining, Sleeping, dan Commercial Zone
            </p>
          </div>

          <button
            type="button"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Laporan PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {zoneStats.map(({ zone, totalDepts, checkedCount, okCount, issueCount, zoneCompliance }) => (
            <div
              key={zone.id}
              onClick={() => onFilterZone && onFilterZone(zone.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${zone.bgColor} ${zone.borderColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-extrabold ${zone.color}`}>
                  {zone.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                  {checkedCount}/{totalDepts} Dept
                </span>
              </div>

              <div className="my-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {zoneCompliance}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Kepatuhan
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/80 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-slate-800 rounded-full"
                    style={{ width: `${zoneCompliance}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-semibold">
                  ✓ {okCount} Standar/Fix
                </span>
                <span className={`font-bold ${issueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {issueCount > 0 ? `🚨 ${issueCount} Temuan` : '0 Temuan'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Manager Leaderboard & Dept Status Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Manager Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Aktivitas 10 Team Manager
            </h3>
            <span className="text-[10px] text-slate-400">Total Audit</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {managerStats.map((mgr, index) => (
              <div
                key={mgr.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    index === 0 
                      ? 'bg-amber-400 text-slate-900' 
                      : index === 1 
                      ? 'bg-slate-300 text-slate-800' 
                      : index === 2 
                      ? 'bg-amber-700/30 text-amber-900' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <strong className="text-slate-800 font-bold block">{mgr.name}</strong>
                    <span className="text-[10px] text-slate-400">
                      {mgr.todayCount > 0 ? `${mgr.todayCount} cek hari ini` : 'Belum cek hari ini'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-indigo-700">
                    {mgr.totalAudits} Total
                  </span>
                  <span className="text-[10px] text-rose-500 block">
                    {mgr.findingsCount} temuan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dept Matrix Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Matriks Status Seluruh Departemen ({currentDate})
              </h3>
              <p className="text-[11px] text-slate-400">Pantau departemen mana yang belum dicek atau ada temuan</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-1">
            {DEPARTMENTS.map((dept) => {
              const obs = dailyObs.find(o => o.deptCode === dept.code);
              const isChecked = !!obs;
              const isResolved = obs?.status === 'RESOLVED';
              const isNonStd = obs?.status === 'NON_STANDARD';

              return (
                <div
                  key={dept.code}
                  className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    !isChecked
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : isResolved
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : isNonStd
                      ? 'bg-rose-50/80 border-rose-300 text-rose-950 shadow-2xs'
                      : 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-[11px]">[{dept.code}]</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      !isChecked
                        ? 'bg-slate-200 text-slate-700'
                        : isResolved
                        ? 'bg-emerald-200 text-emerald-900'
                        : isNonStd
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-indigo-200 text-indigo-900'
                    }`}>
                      {!isChecked ? 'Belum Cek' : isResolved ? 'Resolved' : isNonStd ? 'Temuan' : 'Standar'}
                    </span>
                  </div>
                  <p className="font-semibold truncate text-[11px]" title={dept.name}>
                    {dept.name}
                  </p>
                  <span className="text-[10px] text-slate-400 truncate mt-1">
                    PIC: {dept.psList[0]?.name?.split(' ')[0] || 'Team PS'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
