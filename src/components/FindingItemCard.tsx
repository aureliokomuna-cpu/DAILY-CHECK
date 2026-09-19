import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  Eye, 
  MessageCircle, 
  RotateCcw, 
  Edit3, 
  Zap, 
  Camera, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { DailyObservation, Department, InspectionStatus } from '../types';
import { PhotoPickerInput } from './PhotoPickerInput';

interface FindingItemCardProps {
  finding: DailyObservation;
  dept: Department;
  index: number;
  onSavePSExecution: (data: {
    obsId: string;
    deptCode: string;
    resolutionPhotoUrl: string;
    psNotes: string;
    resolvedByPsName: string;
    executionTime: string;
    status?: InspectionStatus;
  }) => void;
  onOpenPhotoVerification: (dept: Department, obs: DailyObservation) => void;
  getWhatsAppUrl: (phone?: string, text?: string) => string | null;
}

const QUICK_PRESET_NOTES = [
  '✓ Sudah dirapikan sesuai standar VM',
  '🏷️ Price tag & POP sudah terpasang rapi',
  '🧹 Area display sudah dibersihkan & ditata simetris',
  '🔄 Produk display sudah diganti unit baru yang layak'
];

export const FindingItemCard: React.FC<FindingItemCardProps> = ({
  finding,
  dept,
  index,
  onSavePSExecution,
  onOpenPhotoVerification,
  getWhatsAppUrl
}) => {
  const isResolved = finding.status === 'RESOLVED';
  const isInProgress = finding.status === 'IN_PROGRESS';
  const isPending = finding.status === 'NON_STANDARD' || (!isResolved && !isInProgress);

  const [isEditing, setIsEditing] = useState<boolean>(!isResolved);
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState<string>(finding.resolutionPhotoUrl || '');
  const [psNotes, setPsNotes] = useState<string>(finding.psNotes || '');
  const [resolvedByName, setResolvedByName] = useState<string>(
    finding.resolvedByPsName || finding.assignedPsName || dept.psList[0]?.name || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Find assigned PS object with phone
  const assignedPsObj = dept.psList.find(p => p.name === finding.assignedPsName) || dept.psList[0];

  const handleQuickPreset = (preset: string) => {
    setPsNotes(preset);
  };

  const handleCompleteFinding = (targetStatus: InspectionStatus = 'RESOLVED') => {
    if (targetStatus === 'RESOLVED' && !resolutionPhotoUrl) {
      alert('Mohon lampirkan foto hasil perbaikan (bisa via Kamera 📸 atau Galeri 🖼️) agar tersimpan dengan lengkap.');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    onSavePSExecution({
      obsId: finding.id,
      deptCode: dept.code,
      resolutionPhotoUrl: resolutionPhotoUrl || finding.resolutionPhotoUrl || '',
      psNotes: psNotes.trim() || (targetStatus === 'RESOLVED' ? 'Display telah dirapikan sesuai standar VM.' : 'Sedang dalam proses pengerjaan oleh PS.'),
      resolvedByPsName: resolvedByName || dept.psList[0]?.name || 'Team PS',
      executionTime: timeStr,
      status: targetStatus
    });

    setIsSubmitting(false);
    if (targetStatus === 'RESOLVED') {
      setIsEditing(false);
    }
  };

  const handleReopen = () => {
    if (confirm('Kembalikan status temuan ini menjadi "Belum di Progres"?')) {
      onSavePSExecution({
        obsId: finding.id,
        deptCode: dept.code,
        resolutionPhotoUrl: '',
        psNotes: '',
        resolvedByPsName: '',
        executionTime: '',
        status: 'NON_STANDARD'
      });
      setIsEditing(true);
    }
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      isResolved 
        ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs' 
        : isInProgress
        ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
        : 'bg-rose-50/30 border-rose-300 shadow-xs'
    }`}>
      {/* Top Bar Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-white/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-black px-2 py-0.5 rounded bg-slate-900 text-white">
            Temuan #{index + 1}
          </span>

          {/* STATUS BADGE DENGAN KETERANGAN JELAS */}
          {isResolved ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sudah di Progres</span>
            </span>
          ) : isInProgress ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Sedang Dikerjakan</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Belum di Progres</span>
            </span>
          )}

          <span className="text-[11px] text-slate-500 font-medium">
            Oleh: <strong className="text-slate-800">{finding.managerName || 'Manager'}</strong> ({finding.inspectionTime || '-'} WIB)
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isResolved && (
            <button
              type="button"
              onClick={() => onOpenPhotoVerification(dept, finding)}
              className="px-2 py-1 rounded-md text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
              title="Bandingkan 3 Foto"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Foto 3-Way</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Detail Temuan Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200">
            {/* Foto Temuan Manager */}
            <div className="sm:col-span-4">
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
                Foto Temuan Manager
              </span>
              <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-rose-200 relative group">
                {finding.findingPhotoUrl ? (
                  <img
                    src={finding.findingPhotoUrl}
                    alt="Foto Temuan"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-2 text-center">
                    <Camera className="w-5 h-5 mb-1 text-slate-300" />
                    <span>Tidak ada foto temuan</span>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan Manager & Follow Up */}
            <div className="sm:col-span-8 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Catatan Temuan Display
                </span>
                <p className="text-xs font-semibold text-slate-900 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                  {finding.managerNotes || 'Display belum sesuai standar VM, mohon segera dirapikan.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-500">PIC Ditugaskan: </span>
                  <span className="font-bold text-slate-800">{finding.assignedPsName || dept.psList[0]?.name || '-'}</span>
                </div>

                {/* Direct WhatsApp shortcut */}
                {assignedPsObj?.phone && (
                  <a
                    href={getWhatsAppUrl(
                      assignedPsObj.phone,
                      `🚨 *DAILY CHECK ALSUTERS - TEMUAN #${index + 1}*\n\nHalo Rekan PS *${assignedPsObj.name}*,\nAda temuan display di departemen *[${dept.code}] ${dept.name}*:\n📌 *Catatan:* ${finding.managerNotes || 'Mohon dirapikan sesuai standar VM'}\n👤 *Manager:* ${finding.managerName}\n⏱️ *Target SLA:* Maksimal 1 Jam\n🔗 *Link Input Foto Hasil:* https://dcalsuter2026.vercel.app/\n\nMohon segera ditindaklanjuti. Terima kasih!`
                    )!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WA ke {assignedPsObj.name.split(' ')[0]}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Area Penyelesaian PS: Super Mudah & Cepat */}
          {isEditing ? (
            <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">PS</span>
                  PENGISIAN PERBAIKAN DISPLAY (SUPER MUDAH)
                </span>
                {isResolved && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              {/* 1. Upload Foto Hasil Perbaikan (Kamera / Galeri) */}
              <div>
                <PhotoPickerInput
                  photoUrl={resolutionPhotoUrl}
                  onPhotoChange={setResolutionPhotoUrl}
                  label="1. Ambil / Upload Foto Hasil Perbaikan (Wajib)"
                  cameraTitle="Foto Hasil Perbaikan Display"
                  accentColor="emerald"
                />
              </div>

              {/* 2. Catatan Cepat (Quick Chips - 1 Klik Isi Otomatis) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>2. Catatan Perbaikan (Klik Cepat / Ketik)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Pilih salah satu untuk isi otomatis</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {QUICK_PRESET_NOTES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickPreset(preset)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium text-left transition-all active:scale-95 ${
                        psNotes === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={psNotes}
                  onChange={(e) => setPsNotes(e.target.value)}
                  placeholder="Atau tulis catatan sendiri..."
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-emerald-600 bg-white"
                />
              </div>

              {/* 3. Nama PS Pelaksana */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  3. Nama PS yang Mengerjakan
                </label>
                <select
                  value={resolvedByName}
                  onChange={(e) => setResolvedByName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                >
                  {dept.psList.map(ps => (
                    <option key={ps.name} value={ps.name}>
                      PS: {ps.name} {ps.phone ? `(${ps.phone})` : ''}
                    </option>
                  ))}
                  {dept.apsList.map(aps => (
                    <option key={aps.name} value={aps.name}>
                      APS: {aps.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Aksi Utama */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCompleteFinding('RESOLVED')}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>✓ Selesaikan Temuan (Sudah di Progres)</span>
                </button>

                {isPending && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCompleteFinding('IN_PROGRESS')}
                    className="w-full sm:w-auto py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sedang Dikerjakan</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Tampilan Temuan yang Sudah di Progres */
            <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  HASIL PERBAIKAN OLEH PS
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Hasil</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReopen}
                    className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                    title="Buka kembali temuan"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Buka Kembali</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-4">
                  <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-emerald-300">
                    {finding.resolutionPhotoUrl ? (
                      <img
                        src={finding.resolutionPhotoUrl}
                        alt="Hasil Perbaikan"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Foto tidak tersedia
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Catatan Perbaikan:</span>
                    <p className="text-xs font-semibold text-emerald-950">
                      {finding.psNotes || 'Display telah dirapikan sesuai standar VM.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Selesai: <strong className="text-slate-800">{finding.executionTime || '-'} WIB</strong></span>
                    <span>Pelaksana: <strong className="text-emerald-700">{finding.resolvedByPsName || 'Team PS'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
