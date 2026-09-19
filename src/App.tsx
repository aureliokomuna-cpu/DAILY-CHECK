import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SinglePageDeptView } from './components/SinglePageDeptView';
import { EvaluationView } from './components/EvaluationView';
import { PhotoCompareModal } from './components/PhotoCompareModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ExternalLink, Copy, Check, Clock } from 'lucide-react';

import { 
  Department, 
  DailyObservation, 
  VMStandard, 
  ZoneId, 
  NotificationItem 
} from './types';

import { DEPARTMENTS } from './data/masterData';

import { 
  getStoredObservations, 
  saveObservations, 
  getStoredVMStandards, 
  saveVMStandards, 
  getStoredNotifications, 
  saveNotifications 
} from './utils/storage';

import { triggerPushNotification } from './utils/notification';
import { exportWeeklyEvaluationPDF } from './utils/pdfExport';

export default function App() {
  // Current Running Date (Format: YYYY-MM-DD)
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Selected Zone and Dept
  const [selectedZone, setSelectedZone] = useState<ZoneId>('LIVING');
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>('BA');

  // Core Data
  const [observations, setObservations] = useState<DailyObservation[]>(() => getStoredObservations());
  const [vmStandards, setVmStandards] = useState<Record<string, VMStandard>>(() => getStoredVMStandards());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications());
  
  // Modals state
  const [verifyModalData, setVerifyModalData] = useState<{ dept: Department; obs: DailyObservation } | null>(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [activeAppTab, setActiveAppTab] = useState<'INSPECTION' | 'EVALUATION'>('INSPECTION');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleCopyVercelLink = () => {
    navigator.clipboard.writeText('https://dcalsuter2026.vercel.app/');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Sync to storage
  useEffect(() => {
    saveObservations(observations);
  }, [observations]);

  useEffect(() => {
    saveVMStandards(vmStandards);
  }, [vmStandards]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // 1. Manager Save Observation (Single Page Direct)
  const handleSaveObservation = (obsData: Omit<DailyObservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const existingIndex = observations.findIndex(
      o => o.deptCode === obsData.deptCode && o.date === obsData.date
    );

    let updatedList: DailyObservation[];
    let targetObsId: string;

    if (existingIndex >= 0) {
      targetObsId = observations[existingIndex].id;
      const updatedItem: DailyObservation = {
        ...observations[existingIndex],
        ...obsData,
        status: (observations[existingIndex].status === 'RESOLVED' && obsData.status === 'NON_STANDARD')
          ? 'RESOLVED'
          : obsData.status,
        updatedAt: nowIso
      };
      updatedList = [...observations];
      updatedList[existingIndex] = updatedItem;
    } else {
      targetObsId = `obs-${obsData.date.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: DailyObservation = {
        ...obsData,
        id: targetObsId,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      updatedList = [newItem, ...observations];
    }

    setObservations(updatedList);

    // If finding is NON_STANDARD, trigger notification
    if (obsData.status === 'NON_STANDARD') {
      const newAlert = triggerPushNotification({
        title: 'Temuan Non-Standar Baru',
        message: `Manager ${obsData.managerName} melaporkan temuan pada [${obsData.deptCode}] ${obsData.deptName}: ${obsData.managerNotes || 'Display perlu perbaikan'}`,
        deptCode: obsData.deptCode,
        deptName: obsData.deptName,
        managerName: obsData.managerName,
        timestamp: `${obsData.inspectionTime || 'Baru Saja'} WIB`,
        observationId: targetObsId
      });

      setNotifications(prev => [newAlert, ...prev]);
    }
  };

  // 2. VM Save Standard SOP
  const handleSaveVMStandard = (standard: VMStandard) => {
    const updated = {
      ...vmStandards,
      [standard.deptCode]: standard
    };
    setVmStandards(updated);
  };

  // 3. PS Save Execution & Resolution
  const handleSavePSExecutionDirect = (data: {
    deptCode: string;
    resolutionPhotoUrl: string;
    psNotes: string;
    resolvedByPsName: string;
    executionTime: string;
  }) => {
    const nowIso = new Date().toISOString();
    const existingIndex = observations.findIndex(
      o => o.deptCode === data.deptCode && o.date === currentDate
    );

    let updatedList: DailyObservation[];
    if (existingIndex >= 0) {
      const updatedItem: DailyObservation = {
        ...observations[existingIndex],
        status: 'RESOLVED' as const,
        resolutionPhotoUrl: data.resolutionPhotoUrl,
        psNotes: data.psNotes,
        resolvedByPsName: data.resolvedByPsName,
        executionTime: data.executionTime,
        updatedAt: nowIso
      };
      updatedList = [...observations];
      updatedList[existingIndex] = updatedItem;
    } else {
      const dept = DEPARTMENTS.find(d => d.code === data.deptCode);
      const newItem: DailyObservation = {
        id: `obs-${currentDate.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7)}`,
        date: currentDate,
        deptCode: data.deptCode,
        deptName: dept?.name || data.deptCode,
        zoneId: dept?.zone || 'LIVING',
        status: 'RESOLVED',
        managerName: 'MANAGER',
        inspectionTime: data.executionTime,
        checklist: [],
        resolutionPhotoUrl: data.resolutionPhotoUrl,
        psNotes: data.psNotes,
        resolvedByPsName: data.resolvedByPsName,
        executionTime: data.executionTime,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      updatedList = [newItem, ...observations];
    }
    setObservations(updatedList);
  };

  // 4. Notification handlers
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleSelectObservationFromNotif = (obsId: string) => {
    const found = observations.find(o => o.id === obsId);
    if (found) {
      const dept = DEPARTMENTS.find(d => d.code === found.deptCode);
      if (dept) {
        setSelectedZone(dept.zone);
        setSelectedDeptCode(dept.code);
        setVerifyModalData({ dept, obs: found });
      }
    }
  };

  // 5. Export PDF
  const handleExportPDF = () => {
    exportWeeklyEvaluationPDF(observations, {
      title: `LAPORAN EVALUASI DAILY CHECK ALSUTERS`,
      selectedZone: selectedZone
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navigation & Controls */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        notifications={notifications}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onExportPDF={handleExportPDF}
        activeTab={activeAppTab}
        onTabChange={setActiveAppTab}
      />

      {/* SLA & Direct Vercel Inspection Link Alert Ribbon */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-2 text-xs border-b border-indigo-700/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-tight text-indigo-100">
              Target SLA Pengerjaan: <span className="text-amber-300 font-extrabold">Maksimal 1 Jam</span>
            </span>
            <span className="text-indigo-300 hidden md:inline">•</span>
            <span className="text-indigo-200 hidden md:inline">
              Link resmi pengecekan display & update foto oleh PS:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://dcalsuter2026.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-700/80 hover:bg-indigo-600 text-white font-mono font-bold text-[11px] transition-colors shadow-2xs"
              title="Buka web pengecekan di tab baru"
            >
              <span>https://dcalsuter2026.vercel.app/</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={handleCopyVercelLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-[11px] transition-all shadow-2xs active:scale-95"
              title="Salin link pengecekan ke clipboard"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-indigo-700" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3">
        {activeAppTab === 'INSPECTION' ? (
          <SinglePageDeptView
            currentDate={currentDate}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            selectedDeptCode={selectedDeptCode}
            onSelectDeptCode={setSelectedDeptCode}
            observations={observations}
            vmStandards={vmStandards}
            onSaveObservation={handleSaveObservation}
            onSaveVMStandard={handleSaveVMStandard}
            onSavePSExecution={handleSavePSExecutionDirect}
            onOpenPhotoVerification={(dept, obs) => setVerifyModalData({ dept, obs })}
          />
        ) : (
          <EvaluationView
            currentDate={currentDate}
            observations={observations}
            onSelectDepartment={(zone, deptCode) => {
              setSelectedZone(zone);
              setSelectedDeptCode(deptCode);
              setActiveAppTab('INSPECTION');
            }}
            onExportPDF={handleExportPDF}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-700">
              DAILY CHECK ALSUTERS
            </p>
            <span className="text-slate-300">•</span>
            <span>Team VM • Manager • Team PS</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Portal Pengecekan:</span>
            <a 
              href="https://dcalsuter2026.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1"
            >
              <span>dcalsuter2026.vercel.app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Verifikasi 3 Foto */}
      {verifyModalData && (
        <PhotoCompareModal
          isOpen={!!verifyModalData}
          onClose={() => setVerifyModalData(null)}
          observation={verifyModalData.obs}
          vmStandard={vmStandards[verifyModalData.dept.code]}
        />
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAllNotifs}
        onSelectObservation={handleSelectObservationFromNotif}
      />

    </div>
  );
}
