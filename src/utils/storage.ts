import { DailyObservation, VMStandard, NotificationItem } from '../types';
import { INITIAL_OBSERVATIONS, INITIAL_VM_STANDARDS } from '../data/masterData';

const STORAGE_KEYS = {
  OBSERVATIONS: 'alsuters_daily_observations_v1',
  VM_STANDARDS: 'alsuters_vm_standards_v1',
  NOTIFICATIONS: 'alsuters_notifications_v1',
  AUDIO_ENABLED: 'alsuters_audio_enabled_v1',
};

export const getStoredObservations = (): DailyObservation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OBSERVATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(INITIAL_OBSERVATIONS));
      return INITIAL_OBSERVATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load observations', err);
    return INITIAL_OBSERVATIONS;
  }
};

export const saveObservations = (observations: DailyObservation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(observations));
  } catch (err) {
    console.error('Failed to save observations', err);
  }
};

export const getStoredVMStandards = (): Record<string, VMStandard> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VM_STANDARDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VM_STANDARDS, JSON.stringify(INITIAL_VM_STANDARDS));
      return INITIAL_VM_STANDARDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load VM standards', err);
    return INITIAL_VM_STANDARDS;
  }
};

export const saveVMStandards = (standards: Record<string, VMStandard>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.VM_STANDARDS, JSON.stringify(standards));
  } catch (err) {
    console.error('Failed to save VM standards', err);
  }
};

export const getStoredNotifications = (): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      const initialNotifs: NotificationItem[] = [
        {
          id: 'notif-init-1',
          title: '🚨 Temuan Non-Standar Baru!',
          message: 'Manager AUREL melaporkan temuan pada Dept Sofa & Chair (BA): Bantal sofa velvet berantakan & POP miring.',
          deptCode: 'BA',
          deptName: 'Sofa & Chair',
          managerName: 'AUREL',
          timestamp: '08:45 WIB',
          read: false,
          observationId: 'obs-20260919-01'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
      return initialNotifs;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load notifications', err);
    return [];
  }
};

export const saveNotifications = (notifs: NotificationItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
};

export const getAudioSetting = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.AUDIO_ENABLED) !== 'false';
};

export const setAudioSetting = (enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.AUDIO_ENABLED, enabled ? 'true' : 'false');
};
