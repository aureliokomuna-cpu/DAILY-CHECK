import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Camera, 
  Eye, 
  Wrench, 
  Palette, 
  ClipboardCheck, 
  ChevronRight,
  Phone,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Department, DailyObservation, VMStandard, ZoneId, UserRole } from '../types';
import { ZONES, DEPARTMENTS } from '../data/masterData';

interface DailyCheckListProps {
  currentDate: string;
  activeRole: UserRole;
  selectedZone: ZoneId | 'ALL';
  onSelectZone: (zone: ZoneId | 'ALL') => void;
  observations: DailyObservation[];
  vmStandards: Record<string, VMStandard>;
  onOpenAudit: (dept: Department) => void;
  onOpenVMSetting: (dept: Department) => void;
  onOpenPSExecution: (dept: Department, obs: DailyObservation) => void;
  onOpenPhotoVerification: (dept: Department, obs: DailyObservation) => void;
}

export const DailyCheckList: React.FC<DailyCheckListProps> = ({
  currentDate,
  activeRole,
  selectedZone,
  onSelectZone,
  observations,
  vmStandards,
  onOpenAudit,
  onOpenVMSetting,
  onOpenPSExecution,
  onOpenPhotoVerification
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNCHECKED' | 'STANDARD' | 'NON_STANDARD' | 'RESOLVED'>('ALL');

  // Filter departments
  const filteredDepartments = DEPARTMENTS.filter(dept => {
    // Zone filter
    if (selectedZone !== 'ALL' && dept.zone !== selectedZone) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = dept.name.toLowerCase().includes(q);
      const matchCode = dept.code.toLowerCase().includes(q);
      const matchCategory = dept.category?.toLowerCase().includes(q);
      const matchPs = dept.psList.some(ps => ps.name.toLowerCase().includes(q));
      const matchAps = dept.apsList.some(aps => aps.name.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchCategory && !matchPs && !matchAps) {
        return false;
      }
    }

    // Status filter
    const obs = observations.find(o => o.deptCode === dept.code && o.date === currentDate);
    if (statusFilter === 'UNCHECKED' && obs) return false;
    if (statusFilter === 'STANDARD' && obs?.status !== 'STANDARD') return false;
    if (statusFilter === 'NON_STANDARD' && obs?.status !== 'NON_STANDARD') return false;
    if (statusFilter === 'RESOLVED' && obs?.status !== 'RESOLVED') return false;

    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Zone Navigator Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Zone Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectZone('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedZone === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            SEMUA ZONA ({DEPARTMENTS.length})
          </button>

          {ZONES.map(zone => {
            const isSelected = selectedZone === zone.id;
            const count = DEPARTMENTS.filter(d => d.zone === zone.id).length;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onSelectZone(zone.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? `${zone.bgColor} ${zone.color} border ${zone.borderColor} shadow-xs font-extrabold`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{zone.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Dept / PS / NIP..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="UNCHECKED">Belum Dicek</option>
            <option value="STANDARD">Standar (OK)</option>
            <option value="NON_STANDARD">Temuan (Non-Std)</option>
            <option value="RESOLVED">Selesai (Resolved)</option>
          </select>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepartments.map((dept) => {
          const obs = observations.find(o => o.deptCode === dept.code && o.date === currentDate);
          const vmStd = vmStandards[dept.code];

          const isChecked = !!obs;
          const isStandard = obs?.status === 'STANDARD';
          const isNonStandard = obs?.status === 'NON_STANDARD';
          const isResolved = obs?.status === 'RESOLVED';

          const currentZone = ZONES.find(z => z.id === dept.zone);

          return (
            <div
              key={dept.code}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                isNonStandard
                  ? 'border-rose-300 ring-2 ring-rose-50'
                  : isResolved
                  ? 'border-emerald-300 ring-2 ring-emerald-50'
                  : isChecked
                  ? 'border-indigo-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Top: Code + Name + Status */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-900 text-white">
                      {dept.code}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${currentZone?.bgColor} ${currentZone?.color} ${currentZone?.borderColor}`}>
                      {dept.zone}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                    !isChecked
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : isResolved
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isNonStandard
                      ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                      : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  }`}>
                    {!isChecked ? (
                      <>
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Belum Dicek</span>
                      </>
                    ) : isResolved ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Selesai (Resolved)</span>
                      </>
                    ) : isNonStandard ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Temuan Non-Standar</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                        <span>Standar (OK)</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {dept.name}
                </h3>
                {dept.category && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    {dept.category}
                  </span>
                )}
              </div>

              {/* Card Middle: 3-Photo Mini Preview Strip */}
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    3 Foto Komparasi (Standar • Temuan • Hasil)
                  </span>
                  {obs && (
                    <button
                      type="button"
                      onClick={() => onOpenPhotoVerification(dept, obs)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Photo 1: VM Standard */}
                  <div
                    onClick={() => onOpenVMSetting(dept)}
                    title="Foto Standar Display VM (Klik untuk kelola)"
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 border border-slate-300 cursor-pointer group"
                  >
                    {vmStd?.standardPhotoUrl ? (
                      <img
                        src={vmStd.standardPhotoUrl}
                        alt="Standar VM"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100 text-slate-400">
                        <Palette className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[8px] leading-tight">Set VM</span>
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] font-bold py-0.5 text-center">
                      1. VM Guide
                    </span>
                  </div>

                  {/* Photo 2: Manager Finding */}
                  <div
                    onClick={() => obs && onOpenPhotoVerification(dept, obs)}
                    title="Foto Temuan Manager Lapangan"
                    className={`relative aspect-square rounded-xl overflow-hidden bg-slate-200 border cursor-pointer group ${
                      isNonStandard ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300'
                    }`}
                  >
                    {obs?.findingPhotoUrl ? (
                      <img
                        src={obs.findingPhotoUrl}
                        alt="Temuan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100 text-slate-400">
                        <Camera className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[8px] leading-tight">
                          {isStandard ? 'Aman' : 'Temuan'}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] font-bold py-0.5 text-center">
                      2. Temuan
                    </span>
                  </div>

                  {/* Photo 3: PS Execution */}
                  <div
                    onClick={() => obs && isNonStandard ? onOpenPSExecution(dept, obs) : obs ? onOpenPhotoVerification(dept, obs) : null}
                    title="Foto Hasil Pengerjaan PS"
                    className={`relative aspect-square rounded-xl overflow-hidden bg-slate-200 border cursor-pointer group ${
                      isResolved ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-300'
                    }`}
                  >
                    {obs?.resolutionPhotoUrl ? (
                      <img
                        src={obs.resolutionPhotoUrl}
                        alt="Hasil PS"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-slate-100 text-slate-400">
                        <Wrench className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[8px] leading-tight">
                          {isNonStandard ? 'Pending' : 'Hasil PS'}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[8px] font-bold py-0.5 text-center">
                      3. Hasil PS
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Meta: PIC & PS Roster info */}
              <div className="p-4 space-y-2 text-xs">
                {/* Manager Auditor note if inspected */}
                {obs ? (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-600">
                        Manager: <strong className="text-indigo-900">{obs.managerName}</strong>
                      </span>
                      <span className="text-slate-400 text-[10px]">{obs.inspectionTime} WIB</span>
                    </div>
                    {obs.managerNotes && (
                      <p className="text-slate-700 italic line-clamp-1">
                        &ldquo;{obs.managerNotes}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    Belum dilakukan audit oleh Manager hari ini.
                  </div>
                )}

                {/* PS Roster from CSV */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    PIC Product Specialist (PS):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.psList.map(ps => (
                      <span
                        key={ps.name}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                        title={ps.phone ? `HP: ${ps.phone}` : undefined}
                      >
                        <UserCheck className="w-3 h-3 text-slate-500" />
                        <span>{ps.name}</span>
                        {ps.phone && (
                          <a
                            href={`https://wa.me/62${ps.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 ml-0.5"
                            title={`Chat WA: ${ps.phone}`}
                          >
                            <Phone className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </span>
                    ))}
                    {dept.apsList.map(aps => (
                      <span
                        key={aps.name}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200"
                      >
                        <span>{aps.name} (APS)</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Role-Specific Action Buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                
                {/* Left Action: VM Guidelines */}
                <button
                  type="button"
                  onClick={() => onOpenVMSetting(dept)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl text-purple-700 hover:bg-purple-100/60 transition-colors"
                  title="Standar & Aturan Display VM"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Standar VM</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Action for PS (if non-standard finding exists) */}
                  {isNonStandard && (
                    <button
                      type="button"
                      onClick={() => onOpenPSExecution(dept, obs)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Eksekusi PS</span>
                    </button>
                  )}

                  {/* Action for Manager: Audit */}
                  <button
                    type="button"
                    onClick={() => onOpenAudit(dept)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 ${
                      isChecked
                        ? 'bg-slate-900 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>{isChecked ? 'Edit Audit' : 'Audit Display'}</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {filteredDepartments.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">
            Tidak ada departemen yang sesuai dengan filter
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ganti kata kunci pencarian atau sesuaikan pilihan zona dan status.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              onSelectZone('ALL');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

    </div>
  );
};
