import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Eye, 
  Save, 
  Check, 
  MessageCircle, 
  Phone,
  Clock,
  Plus,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { Department, DailyObservation, VMStandard, ZoneId, InspectionStatus } from '../types';
import { ZONES, DEPARTMENTS, MANAGERS } from '../data/masterData';
import { PhotoPickerInput } from './PhotoPickerInput';
import { FindingItemCard } from './FindingItemCard';

interface SinglePageDeptViewProps {
  currentDate: string;
  selectedZone: ZoneId;
  onSelectZone: (zone: ZoneId) => void;
  selectedDeptCode: string;
  onSelectDeptCode: (code: string) => void;
  observations: DailyObservation[];
  vmStandards: Record<string, VMStandard>;
  onSaveObservation: (obs: Omit<DailyObservation, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onSaveVMStandard: (standard: VMStandard) => void;
  onSavePSExecution: (data: {
    obsId?: string;
    deptCode: string;
    resolutionPhotoUrl: string;
    psNotes: string;
    resolvedByPsName: string;
    executionTime: string;
    status?: InspectionStatus;
  }) => void;
  onOpenPhotoVerification: (dept: Department, obs: DailyObservation) => void;
}

// WhatsApp Link Generator Utility with SLA and Vercel Link
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

export const SinglePageDeptView: React.FC<SinglePageDeptViewProps> = ({
  currentDate,
  selectedZone,
  onSelectZone,
  selectedDeptCode,
  onSelectDeptCode,
  observations,
  vmStandards,
  onSaveObservation,
  onSaveVMStandard,
  onSavePSExecution,
  onOpenPhotoVerification
}) => {
  const currentDept = DEPARTMENTS.find(d => d.code === selectedDeptCode) || DEPARTMENTS.find(d => d.zone === selectedZone) || DEPARTMENTS[0];
  const currentVmStandard = vmStandards[currentDept.code];
  const zoneDepts = DEPARTMENTS.filter(d => d.zone === selectedZone);

  // ALL FINDINGS for current department:
  // Today's observations plus any pending unresolved observations from past dates
  const deptObservations = observations.filter(o => o.deptCode === currentDept.code);
  const todayDeptObs = deptObservations.filter(o => o.date === currentDate);
  
  // Real findings (non-standard, in progress, resolved, or has photos/notes)
  const allDeptFindings = deptObservations.filter(
    o => o.status !== 'STANDARD' || !!o.findingPhotoUrl || !!o.managerNotes
  );

  // Status counts for this department
  const pendingFindings = allDeptFindings.filter(o => o.status === 'NON_STANDARD');
  const inProgressFindings = allDeptFindings.filter(o => o.status === 'IN_PROGRESS');
  const resolvedFindings = allDeptFindings.filter(o => o.status === 'RESOLVED');

  // Filter state for PS findings list
  const [psFilter, setPsFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  // Manager Form State
  const [managerName, setManagerName] = useState<string>(MANAGERS[0]);
  const [managerStatus, setManagerStatus] = useState<InspectionStatus>('NON_STANDARD');
  const [managerNotes, setManagerNotes] = useState<string>('');
  const [findingPhotoUrl, setFindingPhotoUrl] = useState<string>('');
  const [assignedPs, setAssignedPs] = useState<string>(currentDept.psList[0]?.name || '');
  const [activeEditingObsId, setActiveEditingObsId] = useState<string | null>(null);

  // VM Edit State
  const [isEditingVM, setIsEditingVM] = useState<boolean>(false);
  const [vmPhotoUrl, setVmPhotoUrl] = useState<string>(currentVmStandard?.standardPhotoUrl || '');
  const [vmRulesText, setVmRulesText] = useState<string>(currentVmStandard?.rules.join('\n') || '');

  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Reset/sync form when department or date changes
  useEffect(() => {
    const vm = vmStandards[currentDept.code];
    if (vm) {
      setVmPhotoUrl(vm.standardPhotoUrl || '');
      setVmRulesText(vm.rules.join('\n'));
    } else {
      setVmPhotoUrl('');
      setVmRulesText('');
    }

    setAssignedPs(currentDept.psList[0]?.name || '');
    setFindingPhotoUrl('');
    setManagerNotes('');
    setActiveEditingObsId(null);
    setIsEditingVM(false);
    setSavedAlert(null);
  }, [currentDept.code, currentDate, vmStandards]);

  // Find assigned PS object with phone number
  const assignedPsObj = currentDept.psList.find(p => p.name === assignedPs);
  const primaryPsWithPhone = currentDept.psList.find(p => !!p.phone) || currentDept.psList[0];

  // Save Standard SOP (VM)
  const handleSaveVM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vmPhotoUrl) {
      alert('Mohon masukkan atau upload foto standar VM');
      return;
    }
    const rules = vmRulesText.split('\n').map(r => r.trim()).filter(Boolean);

    onSaveVMStandard({
      deptCode: currentDept.code,
      standardPhotoUrl: vmPhotoUrl,
      rules: rules.length > 0 ? rules : ['Display rapi sesuai panduan VM'],
      keyPoints: ['Price tag', 'Kebersihan', 'Pencahayaan'],
      updatedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      updatedBy: 'Team VM'
    });

    setIsEditingVM(false);
    setSavedAlert('Standar VM berhasil diperbarui!');
    setTimeout(() => setSavedAlert(null), 2500);
  };

  // Manager: Simpan Pemeriksaan (Temuan Baru atau Update)
  const handleSaveManager = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (managerStatus === 'NON_STANDARD' && !managerNotes.trim() && !findingPhotoUrl) {
      alert('Mohon masukkan catatan temuan atau foto display yang kurang rapi.');
      return;
    }

    onSaveObservation({
      id: activeEditingObsId || undefined,
      date: currentDate,
      deptCode: currentDept.code,
      deptName: currentDept.name,
      zoneId: currentDept.zone,
      status: managerStatus,
      managerName,
      inspectionTime: timeStr,
      managerNotes: managerNotes.trim(),
      findingPhotoUrl: managerStatus === 'NON_STANDARD' ? (findingPhotoUrl || undefined) : undefined,
      checklist: [
        { id: 'cleanliness', label: 'Kebersihan area display', passed: managerStatus !== 'NON_STANDARD' },
        { id: 'pop_pricetag', label: 'Price tag & POP promo', passed: managerStatus !== 'NON_STANDARD' },
        { id: 'vm_symmetry', label: 'Display simetris & rapi', passed: managerStatus !== 'NON_STANDARD' }
      ],
      vmStandardPhotoUrl: currentVmStandard?.standardPhotoUrl,
      assignedPsName: managerStatus === 'NON_STANDARD' ? assignedPs : undefined
    });

    setSavedAlert(
      activeEditingObsId 
        ? 'Temuan berhasil diperbarui!' 
        : managerStatus === 'NON_STANDARD'
        ? `Temuan baru tersimpan! Ditugaskan ke ${assignedPs}.`
        : 'Pemeriksaan Standar OK tersimpan!'
    );

    // Reset manager form so they can easily add another finding!
    setFindingPhotoUrl('');
    setManagerNotes('');
    setActiveEditingObsId(null);
    setTimeout(() => setSavedAlert(null), 3000);
  };

  // Switch to editing an existing finding in Card 2
  const handleEditFinding = (obs: DailyObservation) => {
    setActiveEditingObsId(obs.id);
    setManagerName(obs.managerName || MANAGERS[0]);
    setManagerStatus('NON_STANDARD');
    setManagerNotes(obs.managerNotes || '');
    setFindingPhotoUrl(obs.findingPhotoUrl || '');
    setAssignedPs(obs.assignedPsName || currentDept.psList[0]?.name || '');
  };

  // Cancel editing existing finding
  const handleCancelEdit = () => {
    setActiveEditingObsId(null);
    setFindingPhotoUrl('');
    setManagerNotes('');
  };

  // Filtered findings for PS view
  const displayFindings = allDeptFindings.filter(finding => {
    if (psFilter === 'PENDING') return finding.status === 'NON_STANDARD' || finding.status === 'IN_PROGRESS';
    if (psFilter === 'RESOLVED') return finding.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-3 animate-fadeIn">
      
      {/* 1. PILIH ZONA */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide mr-1 shrink-0">
            ZONA:
          </span>
          {ZONES.map(zone => {
            const isSelected = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  onSelectZone(zone.id);
                  const firstDept = DEPARTMENTS.find(d => d.zone === zone.id);
                  if (firstDept) onSelectDeptCode(firstDept.code);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {zone.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PILIH DEPARTEMEN */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide mr-1 shrink-0">
            DEPT:
          </span>
          {zoneDepts.map(dept => {
            const isSelected = selectedDeptCode === dept.code;
            const deptObs = observations.filter(o => o.deptCode === dept.code && o.date === currentDate);
            const hasPending = deptObs.some(o => o.status === 'NON_STANDARD');
            const hasInProgress = deptObs.some(o => o.status === 'IN_PROGRESS');
            const hasResolved = deptObs.some(o => o.status === 'RESOLVED');
            const hasStd = deptObs.some(o => o.status === 'STANDARD');

            return (
              <button
                key={dept.code}
                type="button"
                onClick={() => onSelectDeptCode(dept.code)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : hasPending
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : hasInProgress
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : hasResolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : hasStd
                    ? 'bg-slate-100 border-indigo-200 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[10px] px-1 py-0.2 rounded font-black ${
                  isSelected ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {dept.code}
                </span>
                <span>{dept.name}</span>
                {hasPending ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" title="Ada temuan belum selesai" />
                ) : hasInProgress ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Sedang dikerjakan" />
                ) : hasResolved ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Sudah di progres" />
                ) : hasStd ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="Standar OK" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert toast notification */}
      {savedAlert && (
        <div className="py-2.5 px-3.5 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedAlert}</span>
        </div>
      )}

      {/* 3. HEADER DEPARTEMEN AKTIF & SUMMARY TEMUAN */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-indigo-500 text-white">
            {currentDept.code}
          </span>
          <h2 className="text-sm sm:text-base font-extrabold text-white">
            {currentDept.name}
          </h2>

          {/* STATUS LABEL TEMUAN */}
          {pendingFindings.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>{pendingFindings.length} Belum di Progres</span>
            </span>
          ) : resolvedFindings.length > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{resolvedFindings.length} Sudah di Progres</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-200">
              Standar OK (0 Temuan)
            </span>
          )}

          {resolvedFindings.length > 0 && pendingFindings.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ✓ {resolvedFindings.length} Selesai
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {primaryPsWithPhone?.phone && (
            <a
              href={getWhatsAppUrl(
                primaryPsWithPhone.phone,
                `Halo Rekan PS *${primaryPsWithPhone.name}*, terkait display departemen *[${currentDept.code}] ${currentDept.name}*:\n⏱️ Target SLA Pengerjaan: Maksimal 1 Jam.\n🔗 Link Pengecekan: https://dcalsuter2026.vercel.app/\nMohon bantuannya ya.`
              )!}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WA PS ({primaryPsWithPhone.name.split(' ')[0]})</span>
            </a>
          )}

          {allDeptFindings.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenPhotoVerification(currentDept, allDeptFindings[0])}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Bandingkan Foto</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. TIGA KARTU: 1. STANDAR (VM) • 2. TEMUAN (MANAGER) • 3. PENYELESAIAN (PS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* KARTU 1: STANDAR (VM) - 4 Kolom di Desktop */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">1</span>
                STANDAR DISPLAY (VM)
              </span>
              <button
                type="button"
                onClick={() => setIsEditingVM(!isEditingVM)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                {isEditingVM ? 'Batal' : 'Ubah Foto'}
              </button>
            </div>

            {isEditingVM ? (
              <form onSubmit={handleSaveVM} className="mt-2.5 space-y-2">
                <div>
                  <PhotoPickerInput
                    photoUrl={vmPhotoUrl}
                    onPhotoChange={setVmPhotoUrl}
                    label="Foto Acuan Standar VM"
                    cameraTitle="Foto Standar Display VM"
                    accentColor="indigo"
                  />
                  <input
                    type="url"
                    value={vmPhotoUrl}
                    onChange={(e) => setVmPhotoUrl(e.target.value)}
                    placeholder="Atau URL foto https://..."
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 mt-1.5 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Panduan Display</label>
                  <textarea
                    rows={2}
                    value={vmRulesText}
                    onChange={(e) => setVmRulesText(e.target.value)}
                    placeholder="Contoh: Display rapi, bebas debu, price tag jelas"
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                >
                  Simpan Standar VM
                </button>
              </form>
            ) : (
              <div className="mt-2.5 space-y-2">
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  {currentVmStandard?.standardPhotoUrl ? (
                    <img
                      src={currentVmStandard.standardPhotoUrl}
                      alt="Standar VM"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400">
                      <Camera className="w-6 h-6 mb-1 text-slate-300" />
                      <span className="text-xs">Belum ada foto acuan</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-700 border border-slate-100">
                  <p className="font-semibold text-slate-900 mb-0.5 text-[11px]">Ketentuan Standar:</p>
                  <p className="text-[11px] text-slate-600">
                    {currentVmStandard?.rules && currentVmStandard.rules.length > 0 
                      ? currentVmStandard.rules.join(', ')
                      : 'Display simetris, price tag terpasang, bersih dari debu.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
            <span>Update: {currentVmStandard?.updatedAt || '-'}</span>
            <span>PIC: {currentDept.psList.map(p => p.name).join(', ')}</span>
          </div>
        </div>

        {/* KARTU 2: PEMERIKSAAN (MANAGER) - 4 Kolom di Desktop */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
                PEMERIKSAAN (MANAGER)
              </span>

              {allDeptFindings.length > 0 && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {allDeptFindings.length} Temuan Aktif
                </span>
              )}
            </div>

            {/* Banner info jika sedang edit temuan tertentu */}
            {activeEditingObsId ? (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between text-xs">
                <span className="font-bold">Mode Edit Temuan</span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-amber-700 underline"
                >
                  Batal / Tambah Baru
                </button>
              </div>
            ) : null}

            <form onSubmit={handleSaveManager} className="mt-2.5 space-y-2.5">
              {/* Pilih Manager */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Manager yang Memeriksa</label>
                <select
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  {MANAGERS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Kondisi Display */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Hasil Observasi Display</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setManagerStatus('STANDARD');
                      setActiveEditingObsId(null);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                      managerStatus === 'STANDARD'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Standar OK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManagerStatus('NON_STANDARD')}
                    className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                      managerStatus === 'NON_STANDARD'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Ada Temuan</span>
                  </button>
                </div>
              </div>

              {/* Form Input Temuan Non-Standar */}
              {managerStatus === 'NON_STANDARD' && (
                <div className="space-y-2 p-2 bg-rose-50/70 rounded-xl border border-rose-200 text-xs">
                  <div>
                    <PhotoPickerInput
                      photoUrl={findingPhotoUrl}
                      onPhotoChange={setFindingPhotoUrl}
                      label="Foto Temuan (Kamera / Galeri)"
                      cameraTitle="Ambil Foto Temuan Display"
                      accentColor="rose"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Catatan Temuan</label>
                    <input
                      type="text"
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                      placeholder="Apa yang kurang rapi / perlu diperbaiki?"
                      className="w-full text-xs p-1.5 rounded-lg border border-rose-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-950 mb-0.5">Tugaskan ke PS</label>
                    <select
                      value={assignedPs}
                      onChange={(e) => setAssignedPs(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-rose-300 bg-white font-semibold"
                    >
                      {currentDept.psList.map(ps => (
                        <option key={ps.name} value={ps.name}>
                          {ps.name} {ps.phone ? `(${ps.phone})` : ''}
                        </option>
                      ))}
                    </select>

                    {/* Short WA button to assigned PS */}
                    {assignedPsObj?.phone && (
                      <a
                        href={getWhatsAppUrl(
                          assignedPsObj.phone,
                          `🚨 *DAILY CHECK ALSUTERS - TEMUAN DISPLAY*\n\nHalo Rekan PS *${assignedPsObj.name}*,\nAda temuan display di departemen *[${currentDept.code}] ${currentDept.name}*:\n📌 *Catatan:* ${managerNotes || 'Mohon dicek dan dirapikan sesuai standar VM'}\n👤 *Manager:* ${managerName}\n⏱️ *Target SLA:* Maksimal 1 Jam\n🔗 *Link Pengecekan:* https://dcalsuter2026.vercel.app/\n\nMohon bantuannya untuk segera ditindaklanjuti. Terima kasih!`
                        )!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Kirim WA ke {assignedPsObj.name.split(' ')[0]}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {activeEditingObsId 
                    ? 'Simpan Perubahan Temuan' 
                    : managerStatus === 'NON_STANDARD' 
                    ? '+ Tambah Temuan Baru (Tidak Timpa)' 
                    : 'Simpan Standar OK'}
                </span>
              </button>
            </form>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
            <span>Pemeriksaan: {managerName}</span>
            <span>Total Temuan: {allDeptFindings.length}</span>
          </div>
        </div>

        {/* KARTU 3: PENYELESAIAN (PS) - 4 Kolom di Desktop */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
                PENYELESAIAN (PS)
              </span>

              {/* Status Badge Ringkasan */}
              {pendingFindings.length > 0 ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  {pendingFindings.length} Perlu Dikerjakan
                </span>
              ) : resolvedFindings.length > 0 ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Semua Selesai
                </span>
              ) : null}
            </div>

            {/* Filter Tabs untuk Temuan PS */}
            {allDeptFindings.length > 1 && (
              <div className="flex items-center gap-1 mt-2 p-1 bg-slate-100 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPsFilter('ALL')}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    psFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600'
                  }`}
                >
                  Semua ({allDeptFindings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPsFilter('PENDING')}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    psFilter === 'PENDING' ? 'bg-rose-600 text-white shadow-2xs font-extrabold' : 'text-rose-700'
                  }`}
                >
                  Belum ({pendingFindings.length + inProgressFindings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPsFilter('RESOLVED')}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    psFilter === 'RESOLVED' ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'text-emerald-700'
                  }`}
                >
                  Sudah ({resolvedFindings.length})
                </button>
              </div>
            )}

            {/* DAFTAR TEMUAN PS DENGAN PENGISIAN SUPER MUDAH */}
            <div className="mt-2.5 space-y-3 max-h-[620px] overflow-y-auto pr-0.5">
              {displayFindings.length > 0 ? (
                displayFindings.map((finding, idx) => (
                  <FindingItemCard
                    key={finding.id}
                    finding={finding}
                    dept={currentDept}
                    index={idx}
                    onSavePSExecution={onSavePSExecution}
                    onOpenPhotoVerification={onOpenPhotoVerification}
                    getWhatsAppUrl={getWhatsAppUrl}
                  />
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Display Standar OK</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Tidak ada temuan non-standar yang perlu dikerjakan oleh rekan PS.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
            <span>SLA Maksimal: 1 Jam</span>
            <span>PIC: {currentDept.psList.map(p => p.name).join(', ')}</span>
          </div>
        </div>

      </div>

      {/* 5. DAFTAR & RIWAYAT LENGKAP SEMUA TEMUAN DEPARTEMEN INI (JANGAN HILANG) */}
      {allDeptFindings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-black text-slate-900">
                RIWAYAT SEMUA TEMUAN [{currentDept.code}] {currentDept.name} ({allDeptFindings.length} Temuan)
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold border border-rose-200">
                🔴 {pendingFindings.length} Belum di Progres
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                🟢 {resolvedFindings.length} Sudah di Progres
              </span>
            </div>
          </div>

          {/* Grid Riwayat Temuan Lengkap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allDeptFindings.map((item, i) => {
              const isItemResolved = item.status === 'RESOLVED';
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isItemResolved
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-900 text-white">
                        #{i + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Oleh: {item.managerName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.inspectionTime || '-'} WIB)
                      </span>
                    </div>

                    {/* KETERANGAN STATUS */}
                    {isItemResolved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        🟢 Sudah di Progres
                      </span>
                    ) : item.status === 'IN_PROGRESS' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        🟡 Sedang Dikerjakan
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        🔴 Belum di Progres
                      </span>
                    )}
                  </div>

                  {/* Foto Temuan VS Foto Hasil */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <span className="text-[9px] font-bold text-rose-800 uppercase block mb-0.5">
                        Foto Temuan Manager:
                      </span>
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-rose-200">
                        {item.findingPhotoUrl ? (
                          <img
                            src={item.findingPhotoUrl}
                            alt="Temuan"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            Tanpa Foto
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-700 mt-1 line-clamp-2">
                        {item.managerNotes || 'Catatan temuan tidak disertakan'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block mb-0.5">
                        Foto Hasil PS:
                      </span>
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-emerald-200">
                        {item.resolutionPhotoUrl ? (
                          <img
                            src={item.resolutionPhotoUrl}
                            alt="Hasil Perbaikan"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 italic">
                            Belum Ada Hasil
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-700 mt-1 line-clamp-2">
                        {item.psNotes || (isItemResolved ? 'Display dirapikan' : 'Belum diisi')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100/80">
                    <span>
                      PIC PS: <strong>{item.resolvedByPsName || item.assignedPsName || '-'}</strong>
                    </span>
                    {isItemResolved && (
                      <span className="text-emerald-700 font-bold">
                        Selesai: {item.executionTime || '-'} WIB
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. KONTAK WHATSAPP LANGSUNG SEMUA PS DI DEPT INI */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Kontak WhatsApp PS [{currentDept.code}] {currentDept.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik nama PS untuk langsung membuka chat WhatsApp dengan peringatan SLA 1 jam & link Vercel
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentDept.psList.map(ps => {
            const waUrl = getWhatsAppUrl(
              ps.phone,
              `Halo Rekan PS *${ps.name}*, saya Manager *${managerName}*.\nTerkait pengecekan display harian departemen *[${currentDept.code}] ${currentDept.name}*.\n⏱️ Target SLA Pengerjaan: Maksimal 1 Jam.\n🔗 Link Pengecekan & Input Foto: https://dcalsuter2026.vercel.app/\nMohon bantuannya ya.`
            );

            return ps.phone ? (
              <a
                key={ps.name}
                href={waUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
                title={`Kirim WA ke ${ps.name} (${ps.phone})`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{ps.name}</span>
                <span className="bg-emerald-700 px-1 py-0.2 rounded text-[10px] text-emerald-100 font-mono">
                  {ps.phone}
                </span>
              </a>
            ) : (
              <span
                key={ps.name}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200"
              >
                <span>{ps.name}</span>
                <span className="text-[10px] text-slate-400">(No HP -)</span>
              </span>
            );
          })}
        </div>
      </div>

    </div>
  );
};
