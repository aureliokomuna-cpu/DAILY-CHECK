import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectObservation: (obsId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectObservation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 rounded-xl">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Push Alert Temuan Non-Standar</h2>
              <p className="text-[11px] text-slate-300">Notifikasi Real-Time Divisi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Total: <strong>{notifications.length}</strong> Notifikasi
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Tandai Dibaca
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus Semua</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
              <p className="text-xs font-bold text-slate-600">Semua display aman!</p>
              <p className="text-[11px]">Belum ada laporan temuan tidak standar.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onSelectObservation(notif.observationId);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                  notif.read 
                    ? 'bg-white border-slate-200 opacity-80' 
                    : 'bg-rose-50/70 border-rose-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-rose-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mb-2 leading-snug">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-500">
                    Auditor: <strong className="text-indigo-700">{notif.managerName}</strong>
                  </span>
                  <span className="font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                    <span>Cek Observasi</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Push notification otomatis terkirim setiap kali Manager melaporkan display non-standar.
        </div>
      </div>
    </div>
  );
};
