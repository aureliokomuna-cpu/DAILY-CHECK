import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  FileText, 
  Eye, 
  CheckSquare, 
  Square,
  Send,
  HelpCircle
} from 'lucide-react';
import { Department, DailyObservation, VMStandard, ChecklistItem, InspectionStatus } from '../types';
import { MANAGERS, DEFAULT_CHECKLIST_TEMPLATE } from '../data/masterData';
import { PhotoPickerInput } from './PhotoPickerInput';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  date: string;
  vmStandard?: VMStandard;
  existingObservation?: DailyObservation;
  onSave: (obs: Omit<DailyObservation, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  department,
  date,
  vmStandard,
  existingObservation,
  onSave
}) => {
  const [managerName, setManagerName] = useState<string>(existingObservation?.managerName || MANAGERS[0]);
  const [status, setStatus] = useState<InspectionStatus>(existingObservation?.status || 'STANDARD');
  const [managerNotes, setManagerNotes] = useState<string>(existingObservation?.managerNotes || '');
  const [findingPhotoUrl, setFindingPhotoUrl] = useState<string>(existingObservation?.findingPhotoUrl || '');
  const [assignedPs, setAssignedPs] = useState<string>(
    existingObservation?.assignedPsName || 
    (department.psList[0]?.name || department.apsList[0]?.name || '')
  );
  
  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (existingObservation?.checklist && existingObservation.checklist.length > 0) {
      return existingObservation.checklist;
    }
    return DEFAULT_CHECKLIST_TEMPLATE.map(t => ({
      id: t.id,
      label: t.label,
      passed: true
    }));
  });

  useEffect(() => {
    if (isOpen) {
      if (existingObservation) {
        setManagerName(existingObservation.managerName);
        setStatus(existingObservation.status);
        setManagerNotes(existingObservation.managerNotes || '');
        setFindingPhotoUrl(existingObservation.findingPhotoUrl || '');
        setChecklist(existingObservation.checklist);
        setAssignedPs(existingObservation.assignedPsName || '');
      } else {
        setStatus('STANDARD');
        setManagerNotes('');
        setFindingPhotoUrl('');
        setChecklist(DEFAULT_CHECKLIST_TEMPLATE.map(t => ({ id: t.id, label: t.label, passed: true })));
        setAssignedPs(department.psList[0]?.name || department.apsList[0]?.name || '');
      }
    }
  }, [isOpen, existingObservation, department]);

  if (!isOpen) return null;

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return { ...item, passed: !item.passed };
        }
        return item;
      });
      // If any item failed, automatically suggest status NON_STANDARD
      const hasFailed = updated.some(item => !item.passed);
      if (hasFailed && status === 'STANDARD') {
        setStatus('NON_STANDARD');
      }
      return updated;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFindingPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateSamplePhoto = (type: 'messy' | 'tag' | 'cushion') => {
    const samplePhotos = {
      messy: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      tag: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      cushion: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=800&auto=format&fit=crop&q=80'
    };
    setFindingPhotoUrl(samplePhotos[type]);
    setStatus('NON_STANDARD');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName) {
      alert('Silakan pilih Nama Manager pengisi observasi!');
      return;
    }

    if (status === 'NON_STANDARD' && !findingPhotoUrl && !managerNotes) {
      alert('Untuk temuan non-standar, mohon lengkapi foto temuan atau deskripsi catatan!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSave({
      date,
      deptCode: department.code,
      deptName: department.name,
      zoneId: department.zone,
      status,
      managerName,
      inspectionTime: existingObservation?.inspectionTime || timeStr,
      managerNotes: managerNotes.trim(),
      findingPhotoUrl: status === 'NON_STANDARD' ? findingPhotoUrl : undefined,
      checklist,
      vmStandardPhotoUrl: vmStandard?.standardPhotoUrl,
      assignedPsName: status === 'NON_STANDARD' ? assignedPs : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-indigo-500 text-white">
                CHECKLIST HARIAN MANAGER
              </span>
              <span className="text-xs text-slate-300">Tanggal: {date}</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold mt-1 text-white">
              [{department.code}] {department.name} - {department.zone} ZONE
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Manager Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. NAMA MANAGER PENGISI OBSERVASI <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {MANAGERS.map((mgr) => {
                const isSelected = managerName === mgr;
                return (
                  <button
                    key={mgr}
                    type="button"
                    onClick={() => setManagerName(mgr)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mgr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference VM Standard Preview */}
          {vmStandard && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Standar Display VM ({department.name})
                </span>
                <span className="text-[10px] text-slate-400">Update: {vmStandard.updatedAt}</span>
              </div>
              <div className="flex gap-3">
                <img
                  src={vmStandard.standardPhotoUrl}
                  alt="Standar VM"
                  className="w-20 h-20 rounded-lg object-cover border border-slate-300 shrink-0"
                />
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Aturan Display VM:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {vmStandard.rules.slice(0, 3).map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Checklist Verification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. CEKLIS KESESUAIAN DISPLAY HARIAN (KLIK UNTUK UBAH)
            </label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                    item.passed
                      ? 'bg-white border-emerald-200 hover:border-emerald-300 text-slate-800'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="text-xs font-semibold">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.passed ? 'STANDAR (OK)' : 'TIDAK STANDAR'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. KESIMPULAN HASIL OBSERVASI
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('STANDARD')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  status === 'STANDARD'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>DISPLAY STANDAR (PAS)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('NON_STANDARD')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  status === 'NON_STANDARD'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>TEMUAN TIDAK STANDAR</span>
              </button>
            </div>
          </div>

          {/* If Non-Standard: Photo Finding & Description & PS Assignment */}
          {status === 'NON_STANDARD' && (
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Detail Pelaporan Temuan Non-Standar (Trigger Push Alert ke PS)</span>
              </div>

              {/* Photo Upload for Finding */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  FOTO TEMUAN DISPLAY TIDAK STANDAR <span className="text-rose-500">*</span>
                </label>
                
                <PhotoPickerInput
                  photoUrl={findingPhotoUrl}
                  onPhotoChange={setFindingPhotoUrl}
                  label=""
                  cameraTitle="Ambil Foto Temuan Display"
                  accentColor="rose"
                />

                {/* Simulation demo quick photos */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Contoh Cepat Demo:</span>
                  <button
                    type="button"
                    onClick={() => handleSimulateSamplePhoto('messy')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold"
                  >
                    Sofa Berantakan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateSamplePhoto('tag')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold"
                  >
                    Tableware Miring
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  DESKRIPSI TEMUAN DISPLAY <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Contoh: Bantal sofa velvet berantakan, price tag akrilik miring, dan ada debu tebal pada coffee table..."
                  className="w-full text-xs p-2.5 rounded-xl border border-rose-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>

              {/* Assign to PS/APS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TUGASKAN KE TEAM PS / APS DEPARTEMEN
                </label>
                <select
                  value={assignedPs}
                  onChange={(e) => setAssignedPs(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-rose-200 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  <optgroup label="Product Specialist (PS)">
                    {department.psList.map((ps) => (
                      <option key={ps.name} value={ps.name}>
                        {ps.name} {ps.phone ? `(${ps.phone})` : ''}
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
            </div>
          )}

          {/* Description for standard observation */}
          {status === 'STANDARD' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CATATAN APRESIASI / FEEDBACK (OPSIONAL)
              </label>
              <input
                type="text"
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder="Contoh: Display sangat rapi, lighting on point, mantap team!"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          )}

          {/* Submit Buttons */}
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
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                status === 'NON_STANDARD'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-slate-900 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {status === 'NON_STANDARD' ? 'Kirim Laporan Temuan & Push Alert' : 'Simpan Observasi Standar'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
