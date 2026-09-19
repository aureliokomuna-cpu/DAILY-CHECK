import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  User, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { DailyObservation, VMStandard } from '../types';

interface PhotoCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  observation: DailyObservation;
  vmStandard?: VMStandard;
}

export const PhotoCompareModal: React.FC<PhotoCompareModalProps> = ({
  isOpen,
  onClose,
  observation,
  vmStandard
}) => {
  if (!isOpen) return null;

  const standardPhoto = observation.vmStandardPhotoUrl || vmStandard?.standardPhotoUrl;
  const findingPhoto = observation.findingPhotoUrl;
  const resolutionPhoto = observation.resolutionPhotoUrl;

  const isResolved = observation.status === 'RESOLVED';
  const isNonStandard = observation.status === 'NON_STANDARD';
  const isStandard = observation.status === 'STANDARD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500 text-white">
                  VERIFIKASI 3 FOTO OBSERVASI
                </span>
                <span className="text-xs text-slate-300">
                  {observation.deptCode} • {observation.zoneId} ZONE
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold mt-0.5 text-white">
                {observation.deptName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isResolved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : isNonStandard
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {isResolved ? '✅ SUDAH DIPERBAIKI (RESOLVED)' : isNonStandard ? '🚨 TEMUAN NON-STANDAR' : '✨ STANDAR TERPENUHI'}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 3-Side Photo Comparison */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">Tanggal Audit</span>
                <span className="font-bold text-slate-800">{observation.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-500 block">Waktu Inspeksi</span>
                <span className="font-bold text-slate-800">{observation.inspectionTime || '-'} WIB</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="text-[10px] text-slate-500 block">Manager</span>
                <span className="font-bold text-indigo-900">{observation.managerName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="text-[10px] text-slate-500 block">Eksekutor PS</span>
                <span className="font-bold text-emerald-900">{observation.resolvedByPsName || observation.assignedPsName || 'Team PS'}</span>
              </div>
            </div>
          </div>

          {/* 3 Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. STANDAR DISPLAY (VM) */}
            <div className="bg-white rounded-xl border border-indigo-200 shadow-xs overflow-hidden flex flex-col">
              <div className="p-3 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  1. FOTO STANDAR VM
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Acuan Resmi
                </span>
              </div>

              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                {standardPhoto ? (
                  <img
                    src={standardPhoto}
                    alt="Standar VM"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                    Foto standar belum diunggah oleh Team VM
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between text-xs border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Panduan Standar Display:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {vmStandard?.rules[0] || 'Display ditata rapi, bersih, spotlight fokus, dan price tag terpasang.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Ditetapkan oleh: <strong className="text-slate-600">{vmStandard?.updatedBy || 'Team VM'}</strong>
                </div>
              </div>
            </div>

            {/* 2. TEMUAN TIDAK STANDAR (MANAGER) */}
            <div className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col ${
              isNonStandard ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
            }`}>
              <div className="p-3 bg-rose-50/80 border-b border-rose-100 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  2. FOTO TEMUAN
                </span>
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  Audit Manager
                </span>
              </div>

              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                {findingPhoto ? (
                  <img
                    src={findingPhoto}
                    alt="Temuan Tidak Standar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 p-4 text-center">
                    {isStandard ? 'Display standar (tidak ada temuan)' : 'Belum ada foto temuan diunggah'}
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between text-xs border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Deskripsi Temuan:</span>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    {observation.managerNotes ? `"${observation.managerNotes}"` : 'Display sesuai standar VM.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Diperiksa oleh: <strong className="text-indigo-700">{observation.managerName}</strong>
                </div>
              </div>
            </div>

            {/* 3. HASIL PENGERJAAN PS (AFTER ACTION) */}
            <div className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col ${
              isResolved ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
            }`}>
              <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  3. HASIL PENGERJAAN
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Eksekusi PS
                </span>
              </div>

              <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                {resolutionPhoto ? (
                  <img
                    src={resolutionPhoto}
                    alt="Hasil Pengerjaan PS"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                    {isNonStandard ? (
                      <>
                        <Clock className="w-6 h-6 text-amber-500 mb-1 animate-spin-slow" />
                        <span className="font-semibold text-amber-700">Menunggu Eksekusi PS</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">PIC: {observation.assignedPsName || 'Team PS'}</span>
                      </>
                    ) : (
                      <span>Display sudah standar sejak awal</span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between text-xs border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Catatan Tindakan PS:</span>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {observation.psNotes || (isResolved ? 'Perbaikan selesai dilakukan.' : 'Belum dieksekusi')}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Dikerjakan oleh: <strong className="text-emerald-700">{observation.resolvedByPsName || observation.assignedPsName || '-'}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Checklist Details */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              DETAIL CEKLIS PENILAIAN OBSERVASI
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {observation.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                    item.passed ? 'bg-emerald-50/60 border-emerald-200 text-slate-800' : 'bg-rose-50/60 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {item.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                    item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.passed ? 'OK' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Verifikasi data akurat: Foto Standar VM ➔ Foto Temuan Manager ➔ Foto Hasil Pengerjaan PS
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Tutup Verifikasi
          </button>
        </div>
      </div>
    </div>
  );
};
