import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Eye, 
  Save, 
  Check, 
  MessageCircle, 
  Phone
} from 'lucide-react';
import { Department, DailyObservation, VMStandard, ZoneId, InspectionStatus } from '../types';
import { ZONES, DEPARTMENTS, MANAGERS } from '../data/masterData';

interface SinglePageDeptViewProps {
  currentDate: string;
  selectedZone: ZoneId;
  onSelectZone: (zone: ZoneId) => void;
  selectedDeptCode: string;
  onSelectDeptCode: (code: string) => void;
  observations: DailyObservation[];
  vmStandards: Record<string, VMStandard>;
  onSaveObservation: (obs: Omit<DailyObservation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveVMStandard: (standard: VMStandard) => void;
  onSavePSExecution: (data: {
    deptCode: string;
    resolutionPhotoUrl: string;
    psNotes: string;
    resolvedByPsName: string;
    executionTime: string;
  }) => void;
  onOpenPhotoVerification: (dept: Department, obs: DailyObservation) => void;
}

// WhatsApp Link Generator Utility
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
  const currentObservation = observations.find(o => o.deptCode === currentDept.code && o.date === currentDate);
  const currentVmStandard = vmStandards[currentDept.code];
  const zoneDepts = DEPARTMENTS.filter(d => d.zone === selectedZone);

  // Manager State
  const [managerName, setManagerName] = useState<string>(currentObservation?.managerName || MANAGERS[0]);
  const [managerStatus, setManagerStatus] = useState<InspectionStatus>(currentObservation?.status || 'STANDARD');
  const [managerNotes, setManagerNotes] = useState<string>(currentObservation?.managerNotes || '');
  const [findingPhotoUrl, setFindingPhotoUrl] = useState<string>(currentObservation?.findingPhotoUrl || '');
  const [assignedPs, setAssignedPs] = useState<string>(
    currentObservation?.assignedPsName || currentDept.psList[0]?.name || ''
  );

  // VM Edit State
  const [isEditingVM, setIsEditingVM] = useState<boolean>(false);
  const [vmPhotoUrl, setVmPhotoUrl] = useState<string>(currentVmStandard?.standardPhotoUrl || '');
  const [vmRulesText, setVmRulesText] = useState<string>(currentVmStandard?.rules.join('\n') || '');

  // PS State
  const [isEditingPS, setIsEditingPS] = useState<boolean>(false);
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState<string>(currentObservation?.resolutionPhotoUrl || '');
  const [psNotes, setPsNotes] = useState<string>(currentObservation?.psNotes || '');
  const [psExecutorName, setPsExecutorName] = useState<string>(
    currentObservation?.resolvedByPsName || currentDept.psList[0]?.name || ''
  );

  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  // Hidden File Inputs for Direct Camera / File Upload
  const managerFileInputRef = useRef<HTMLInputElement>(null);
  const psFileInputRef = useRef<HTMLInputElement>(null);
  const vmFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const obs = observations.find(o => o.deptCode === currentDept.code && o.date === currentDate);
    const vm = vmStandards[currentDept.code];

    if (obs) {
      setManagerName(obs.managerName || MANAGERS[0]);
      setManagerStatus(obs.status);
      setManagerNotes(obs.managerNotes || '');
      setFindingPhotoUrl(obs.findingPhotoUrl || '');
      setAssignedPs(obs.assignedPsName || currentDept.psList[0]?.name || '');
      setResolutionPhotoUrl(obs.resolutionPhotoUrl || '');
      setPsNotes(obs.psNotes || '');
      setPsExecutorName(obs.resolvedByPsName || currentDept.psList[0]?.name || '');
    } else {
      setManagerStatus('STANDARD');
      setManagerNotes('');
      setFindingPhotoUrl('');
      setAssignedPs(currentDept.psList[0]?.name || '');
      setResolutionPhotoUrl('');
      setPsNotes('');
      setPsExecutorName(currentDept.psList[0]?.name || '');
    }

    if (vm) {
      setVmPhotoUrl(vm.standardPhotoUrl || '');
      setVmRulesText(vm.rules.join('\n'));
    } else {
      setVmPhotoUrl('');
      setVmRulesText('');
    }

    setIsEditingVM(false);
    setIsEditingPS(false);
    setSavedAlert(null);
  }, [currentDept.code, currentDate, observations, vmStandards]);

  // Find assigned PS object with phone number
  const assignedPsObj = currentDept.psList.find(p => p.name === assignedPs);
  const primaryPsWithPhone = currentDept.psList.find(p => !!p.phone) || currentDept.psList[0];

  const handleFileChange = (file: File | undefined, setter: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveManager = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    onSaveObservation({
      date: currentDate,
      deptCode: currentDept.code,
      deptName: currentDept.name,
      zoneId: currentDept.zone,
      status: managerStatus,
      managerName,
      inspectionTime: currentObservation?.inspectionTime || timeStr,
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

    setSavedAlert('Pemeriksaan Manager tersimpan!');
    setTimeout(() => setSavedAlert(null), 2000);
  };

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
    setTimeout(() => setSavedAlert(null), 2000);
  };

  const handleSavePS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionPhotoUrl) {
      alert('Mohon lampirkan foto hasil perbaikan');
      return;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    onSavePSExecution({
      deptCode: currentDept.code,
      resolutionPhotoUrl,
      psNotes: psNotes.trim() || 'Display telah dirapikan sesuai standar.',
      resolvedByPsName: psExecutorName || 'Team PS',
      executionTime: timeStr
    });

    setIsEditingPS(false);
    setSavedAlert('Penyelesaian PS tersimpan (RESOLVED)!');
    setTimeout(() => setSavedAlert(null), 2000);
  };

  return (
    <div className="space-y-3">
      
      {/* 1. PILIH ZONA */}
      <div className="bg-white p-2 rounded-xl border border-slate-200">
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
      <div className="bg-white p-2 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide mr-1 shrink-0">
            DEPT:
          </span>
          {zoneDepts.map(dept => {
            const isSelected = selectedDeptCode === dept.code;
            const obs = observations.find(o => o.deptCode === dept.code && o.date === currentDate);
            const isNonStd = obs?.status === 'NON_STANDARD';
            const isResolved = obs?.status === 'RESOLVED';
            const isStd = obs?.status === 'STANDARD';

            return (
              <button
                key={dept.code}
                type="button"
                onClick={() => onSelectDeptCode(dept.code)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : isNonStd
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : isResolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isStd
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
                {isResolved ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                ) : isNonStd ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
                ) : isStd ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert toast notification */}
      {savedAlert && (
        <div className="py-2 px-3 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedAlert}</span>
        </div>
      )}

      {/* 3. HEADER DEPARTEMEN AKTIF */}
      <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-500 text-white">
            {currentDept.code}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white">
            {currentDept.name}
          </h2>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            currentObservation?.status === 'RESOLVED'
              ? 'bg-emerald-500 text-white'
              : currentObservation?.status === 'NON_STANDARD'
              ? 'bg-rose-500 text-white'
              : currentObservation?.status === 'STANDARD'
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-800 text-slate-300'
          }`}>
            {currentObservation?.status === 'RESOLVED'
              ? 'SELESAI'
              : currentObservation?.status === 'NON_STANDARD'
              ? 'TEMUAN'
              : currentObservation?.status === 'STANDARD'
              ? 'OK'
              : 'BELUM'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick WA Button in header if primary PS has phone */}
          {primaryPsWithPhone?.phone && (
            <a
              href={getWhatsAppUrl(
                primaryPsWithPhone.phone,
                `Halo Rekan PS ${primaryPsWithPhone.name}, terkait display harian departemen [${currentDept.code}] ${currentDept.name} (Manager: ${managerName}). Mohon bantuannya ya.`
              )!}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              title={`Chat WhatsApp ke ${primaryPsWithPhone.name} (${primaryPsWithPhone.phone})`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WA {primaryPsWithPhone.name.split(' ')[0]}</span>
            </a>
          )}

          {currentObservation && (
            <button
              type="button"
              onClick={() => onOpenPhotoVerification(currentDept, currentObservation)}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bandingkan Foto</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. TIGA KARTU: STANDAR • TEMUAN • PENYELESAIAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* KARTU 1: STANDAR (VM) */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between space-y-3">
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
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Upload / Ambil Foto</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={vmFileInputRef}
                    onChange={(e) => handleFileChange(e.target.files?.[0], setVmPhotoUrl)}
                    className="hidden"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => vmFileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamera / Galeri</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={vmPhotoUrl}
                    onChange={(e) => setVmPhotoUrl(e.target.value)}
                    placeholder="Atau link foto https://..."
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 mt-1.5"
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
                  <p className="font-semibold text-slate-900 mb-0.5 text-[11px]">Ketentuan:</p>
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

        {/* KARTU 2: TEMUAN (MANAGER) */}
        <div className={`bg-white rounded-xl border p-3 flex flex-col justify-between space-y-3 ${
          managerStatus === 'NON_STANDARD' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-rose-600 text-white text-[10px] flex items-center justify-center font-black">2</span>
                TEMUAN (MANAGER)
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                managerStatus === 'NON_STANDARD' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {managerStatus === 'NON_STANDARD' ? 'Ada Temuan' : 'Standar OK'}
              </span>
            </div>

            <form onSubmit={handleSaveManager} className="mt-2.5 space-y-2.5">
              {/* Nama Manager */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Manager</label>
                <select
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  {MANAGERS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Toggle Kondisi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Kondisi Display</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setManagerStatus('STANDARD')}
                    className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
                      managerStatus === 'STANDARD'
                        ? 'bg-indigo-600 text-white border-indigo-600'
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
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Ada Temuan</span>
                  </button>
                </div>
              </div>

              {/* Detail jika Ada Temuan */}
              {managerStatus === 'NON_STANDARD' && (
                <div className="space-y-2 p-2 bg-rose-50 rounded-lg border border-rose-200 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1">Foto Temuan</label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={managerFileInputRef}
                      onChange={(e) => handleFileChange(e.target.files?.[0], setFindingPhotoUrl)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => managerFileInputRef.current?.click()}
                      className="w-full py-1.5 px-2 bg-white border border-rose-300 rounded text-rose-900 font-bold flex items-center justify-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{findingPhotoUrl ? 'Ganti Foto' : 'Ambil / Upload Foto Temuan'}</span>
                    </button>
                    {findingPhotoUrl && (
                      <div className="mt-1.5 aspect-video rounded overflow-hidden border border-rose-300">
                        <img src={findingPhotoUrl} alt="Foto Temuan" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-0.5">Catatan Temuan</label>
                    <input
                      type="text"
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                      placeholder="Apa yang kurang rapi?"
                      className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-0.5">Tugaskan ke PS</label>
                    <select
                      value={assignedPs}
                      onChange={(e) => setAssignedPs(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-rose-300 bg-white font-semibold"
                    >
                      {currentDept.psList.map(ps => (
                        <option key={ps.name} value={ps.name}>
                          {ps.name} {ps.phone ? `(${ps.phone})` : ''}
                        </option>
                      ))}
                    </select>

                    {/* MENU LANGSUNG WA KE PS TERKAIT */}
                    {assignedPsObj?.phone ? (
                      <a
                        href={getWhatsAppUrl(
                          assignedPsObj.phone,
                          `Halo Rekan PS ${assignedPsObj.name},\nAda temuan display harian di [${currentDept.code}] ${currentDept.name}:\n• Status: Temuan Non-Standar\n• Catatan: ${managerNotes || 'Mohon dicek dan dirapikan sesuai standar'}\n• Pelapor: Manager ${managerName}\n\nMohon bantuannya untuk segera ditindaklanjuti. Terima kasih!`
                        )!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Kirim WA ke {assignedPsObj.name.split(' ')[0]} ({assignedPsObj.phone})</span>
                      </a>
                    ) : (
                      <div className="text-[11px] text-rose-600 italic mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-rose-400" />
                        <span>Nomor HP PS belum terdaftar di master data</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pemeriksaan</span>
              </button>
            </form>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
            <span>Jam Cek: {currentObservation?.inspectionTime || '-'}</span>
            <span>Manager: {currentObservation?.managerName || managerName}</span>
          </div>
        </div>

        {/* KARTU 3: PENYELESAIAN (PS) */}
        <div className={`bg-white rounded-xl border p-3 flex flex-col justify-between space-y-3 ${
          currentObservation?.status === 'RESOLVED' ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">3</span>
                PENYELESAIAN (PS)
              </span>
              {currentObservation?.status === 'RESOLVED' ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPS(!isEditingPS)}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  {isEditingPS ? 'Batal' : 'Edit'}
                </button>
              ) : null}
            </div>

            {isEditingPS || (currentObservation?.status === 'NON_STANDARD') ? (
              <form onSubmit={handleSavePS} className="mt-2.5 space-y-2.5">
                <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Status: Perlu Perbaikan PS</span>
                  <span className="text-[11px] text-amber-800 block">
                    {currentObservation?.managerNotes || 'Silakan rapikan display dan lampirkan foto hasil.'}
                  </span>

                  {/* Quick follow up WA link in Card 3 */}
                  {assignedPsObj?.phone && (
                    <a
                      href={getWhatsAppUrl(
                        assignedPsObj.phone,
                        `Halo ${assignedPsObj.name}, follow up perbaikan display [${currentDept.code}] ${currentDept.name}: "${currentObservation?.managerNotes || 'Mohon dirapikan'}". Apakah sudah selesai? Terima kasih!`
                      )!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline mt-0.5"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Follow Up WA ke {assignedPsObj.name} ({assignedPsObj.phone})</span>
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Foto Hasil Perbaikan</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={psFileInputRef}
                    onChange={(e) => handleFileChange(e.target.files?.[0], setResolutionPhotoUrl)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => psFileInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{resolutionPhotoUrl ? 'Ganti Foto' : 'Ambil / Upload Foto Selesai'}</span>
                  </button>
                  {resolutionPhotoUrl && (
                    <div className="mt-1.5 aspect-video rounded overflow-hidden border border-emerald-300">
                      <img src={resolutionPhotoUrl} alt="Foto Selesai" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Catatan Perbaikan</label>
                  <input
                    type="text"
                    value={psNotes}
                    onChange={(e) => setPsNotes(e.target.value)}
                    placeholder="Contoh: Display sudah dirapikan sesuai standar"
                    className="w-full text-xs p-1.5 rounded border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nama PS Pelaksana</label>
                  <select
                    value={psExecutorName}
                    onChange={(e) => setPsExecutorName(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-slate-200 font-semibold"
                  >
                    {currentDept.psList.map(ps => (
                      <option key={ps.name} value={ps.name}>{ps.name}</option>
                    ))}
                    {currentDept.apsList.map(aps => (
                      <option key={aps.name} value={aps.name}>{aps.name} (APS)</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Selesai (RESOLVED)</span>
                </button>
              </form>
            ) : currentObservation?.status === 'RESOLVED' ? (
              <div className="mt-2.5 space-y-2">
                <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 border border-emerald-300">
                  {currentObservation.resolutionPhotoUrl ? (
                    <img
                      src={currentObservation.resolutionPhotoUrl}
                      alt="Hasil Perbaikan"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Foto tidak tersedia
                    </div>
                  )}
                </div>

                <div className="bg-emerald-50 p-2 rounded-lg text-xs border border-emerald-200">
                  <span className="font-bold text-emerald-900 block text-[11px]">Selesai Diperbaiki</span>
                  <span className="text-[11px] text-emerald-800">
                    {currentObservation.psNotes || 'Telah dirapikan sesuai standar VM.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-2.5 py-8 flex flex-col items-center justify-center text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-xs font-semibold text-slate-600">Tidak ada tindakan perbaikan</span>
                <span className="text-[11px] text-slate-400">Display dalam kondisi standar</span>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
            <span>Waktu: {currentObservation?.executionTime || '-'}</span>
            <span>PS: {currentObservation?.resolvedByPsName || assignedPs || '-'}</span>
          </div>
        </div>

      </div>

      {/* 5. KONTAK WHATSAPP LANGSUNG SEMUA PS DI DEPT INI */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Kontak WhatsApp PS [{currentDept.code}] {currentDept.name}
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik nama PS untuk langsung membuka chat WhatsApp
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentDept.psList.map(ps => {
            const waUrl = getWhatsAppUrl(
              ps.phone,
              `Halo Rekan PS ${ps.name}, saya Manager ${managerName}. Terkait display harian departemen [${currentDept.code}] ${currentDept.name}...`
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
