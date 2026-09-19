export type ZoneId = 'LIVING' | 'DINING' | 'SLEEPING' | 'COMMERCIAL';

export interface StaffMember {
  nip?: string;
  name: string;
  phone?: string;
  role: 'PS' | 'APS';
}

export interface Department {
  code: string;
  name: string;
  zone: ZoneId;
  category?: string;
  psList: StaffMember[];
  apsList: StaffMember[];
}

export interface ZoneConfig {
  id: ZoneId;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  departments: string[]; // Dept codes
}

export interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  notes?: string;
}

export interface VMStandard {
  deptCode: string;
  standardPhotoUrl: string;
  rules: string[];
  keyPoints: string[];
  updatedAt: string;
  updatedBy: string; // VM Staff Name
}

export type InspectionStatus = 'STANDARD' | 'NON_STANDARD' | 'IN_PROGRESS' | 'RESOLVED';

export interface DailyObservation {
  id: string;
  date: string; // YYYY-MM-DD
  deptCode: string;
  deptName: string;
  zoneId: ZoneId;
  status: InspectionStatus;
  
  // Manager Inspection Details
  managerName: string;
  inspectionTime: string;
  managerNotes?: string;
  findingPhotoUrl?: string; // Foto temuan tidak standar
  checklist: ChecklistItem[];
  
  // VM Standard Reference
  vmStandardPhotoUrl?: string;
  
  // PS Action Details
  assignedPsName?: string;
  executionTime?: string;
  resolutionPhotoUrl?: string; // Foto hasil pengerjaan
  psNotes?: string;
  resolvedByPsName?: string;

  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  deptCode: string;
  deptName: string;
  managerName: string;
  timestamp: string;
  read: boolean;
  observationId: string;
}

export type UserRole = 'ALL' | 'MANAGER' | 'VM' | 'PS' | 'ANALYTICS';
