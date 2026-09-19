import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SinglePageDeptView } from './components/SinglePageDeptView';
import { PhotoCompareModal } from './components/PhotoCompareModal';
import { NotificationDrawer } from './components/NotificationDrawer';

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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3">
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p className="font-semibold text-slate-700">
            DAILY CHECK ALSUTERS
          </p>
          <div className="flex items-center gap-3">
            <span>Team VM • Manager • Team PS</span>
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
