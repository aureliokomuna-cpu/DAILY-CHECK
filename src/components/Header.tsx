import React from 'react';
import { 
  Bell, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  FileDown
} from 'lucide-react';
import { NotificationItem } from '../types';
import managerLogo from '../assets/images/manager_logo_portrait_1789821725917.jpg';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onExportPDF: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  notifications,
  onOpenNotifications,
  onExportPDF
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Judul */}
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <div className="w-10 h-10 rounded-full ring-2 ring-indigo-600/30 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src={managerLogo}
                alt="Daily Check Alsuters"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-600/20" title="Online" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
              DAILY CHECK ALSUTERS
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Standar VM • Temuan Manager • Penyelesaian PS
            </p>
          </div>
        </div>

        {/* Tanggal & Aksi */}
        <div className="flex items-center gap-2">
          {/* Navigator Tanggal */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevDay}
              title="Hari Sebelumnya"
              className="p-1 rounded text-slate-600 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-hidden cursor-pointer w-[115px]"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              title="Hari Berikutnya"
              className="p-1 rounded text-slate-600 hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToday}
              className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-2xs"
            >
              Hari Ini
            </button>
          </div>

          {/* Notifikasi Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shrink-0 shadow-2xs"
            title="Download Rekap PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
