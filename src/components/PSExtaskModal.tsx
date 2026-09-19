import React, { useState } from 'react';
import { X, Upload, Camera, CheckCircle2, Wrench, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Department, DailyObservation, VMStandard } from '../types';
import { playNotificationChime } from '../utils/notification';
import { PhotoPickerInput } from './PhotoPickerInput';

interface PSExtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  observation: DailyObservation;
  vmStandard?: VMStandard;
  onSaveExecution: (data: {
    resolutionPhotoUrl: string;
    psNotes: string;
    resolvedByPsName: string;
    executionTime: string;
  }) => void;
}

export const PSExtaskModal: React.FC<PSExtaskModalProps> = ({
  isOpen,
  onClose,
  department,
  observation,
  vmStandard,
  onSaveExecution
}) => {
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState<string>(
    observation.resolutionPhotoUrl || ''
  );
  const [psNotes, setPsNotes] = useState<string>(
    observation.psNotes || ''
  );
  const defaultPsName = observation.assignedPsName || department.psList[0]?.name || department.apsList[0]?.name || '';
  const [resolvedByPsName, setResolvedByPsName] = useState<string>(
    observation.resolvedByPsName || defaultPsName
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResolutionPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateAfterPhoto = () => {
    // Demo resolved photo
    const demoPhoto = vmStandard?.standardPhotoUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80';
    setResolutionPhotoUrl(demoPhoto);
    if (!psNotes) {
      setPsNotes('Display sudah dirapikan kembali sesuai SOP VM. POP dan pricetag dipasang tegak rapi.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionPhotoUrl) {
      alert('Mohon unggah Foto Hasil Pengerjaan sebagai bukti eksekusi perbaikan!');
      return;
    }
    if (!resolvedByPsName) {
      alert('Silakan pilih Nama PS / APS yang mengeksekusi!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Trigger celebration & fanfare chime
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
    playNotificationChime('success');

    onSaveExecution({
      resolutionPhotoUrl,
      psNotes: psNotes.trim() || 'Sudah disesuaikan kembali sesuai standar display VM.',
      resolvedByPsName,
      executionTime: timeStr
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">
                  EKSEKUSI TEAM PS
                </span>
                <span className="text-xs text-emerald-200">Dept: [{department.code}]</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold mt-0.5 text-white">
                Perbaikan Display {department.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Comparison target cards: Manager Finding vs VM Standard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Finding Card */}
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Foto Temuan Manager
                </span>
                <span className="text-[10px] text-rose-700 font-semibold">
                  Auditor: {observation.managerName}
                </span>
              </div>
              {observation.findingPhotoUrl ? (
                <img
                  src={observation.findingPhotoUrl}
                  alt="Temuan"
                  className="w-full h-32 object-cover rounded-lg border border-rose-300"
                />
              ) : (
                <div className="h-32 bg-rose-100 rounded-lg flex items-center justify-center text-xs text-rose-600">
                  Tidak ada foto temuan
                </div>
              )}
              <p className="text-xs text-slate-700 font-medium line-clamp-2">
                &ldquo;{observation.managerNotes || 'Display tidak sesuai standar'}&rdquo;
              </p>
            </div>

            {/* Target Standard Card */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Target Standar VM
                </span>
                <span className="text-[10px] text-indigo-700 font-semibold">Acuan Target</span>
              </div>
              {vmStandard?.standardPhotoUrl ? (
                <img
                  src={vmStandard.standardPhotoUrl}
                  alt="Target VM"
                  className="w-full h-32 object-cover rounded-lg border border-indigo-300"
                />
              ) : (
                <div className="h-32 bg-indigo-100 rounded-lg flex items-center justify-center text-xs text-indigo-600">
                  Foto standar belum diunggah VM
                </div>
              )}
              <p className="text-xs text-slate-700 font-medium line-clamp-2">
                {vmStandard?.rules[0] || 'Sesuaikan display dengan rapi sesuai panduan VM'}
              </p>
            </div>
          </div>

          {/* Upload Foto Hasil Pengerjaan */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider">
                FOTO HASIL PENGERJAAN (AFTER ACTION) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleSimulateAfterPhoto}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
              >
                Gunakan Contoh Cepat Demo
              </button>
            </div>

            <PhotoPickerInput
              photoUrl={resolutionPhotoUrl}
              onPhotoChange={setResolutionPhotoUrl}
              label=""
              cameraTitle="Ambil Foto Hasil Perbaikan Display"
              accentColor="emerald"
            />
          </div>

          {/* PS Executor Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              NAMA PS / APS YANG MENYELESAIKAN EKSEKUSI <span className="text-rose-500">*</span>
            </label>
            <select
              value={resolvedByPsName}
              onChange={(e) => setResolvedByPsName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <optgroup label="Product Specialist (PS)">
                {department.psList.map((ps) => (
                  <option key={ps.name} value={ps.name}>
                    {ps.name} {ps.nip ? `[NIP: ${ps.nip}]` : ''}
                  </option>
                ))}
              </optgroup>
              {department.apsList.length > 0 && (
                <optgroup label="Assistant PS (APS)">
                  {department.apsList.map((aps) => (
                    <option key={aps.name} value={aps.name}>
                      {aps.name} (APS)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Execution Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              DESKRIPSI TINDAKAN PERBAIKAN (ACTION TAKEN)
            </label>
            <textarea
              rows={2}
              value={psNotes}
              onChange={(e) => setPsNotes(e.target.value)}
              placeholder="Contoh: Sudah menata ulang cushion, meluruskan price tag akrilik, dan membersihkan permukaan meja..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Perbaikan Selesai (Resolved)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
