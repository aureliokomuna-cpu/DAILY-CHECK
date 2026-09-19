import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface PhotoPickerInputProps {
  photoUrl: string;
  onPhotoChange: (url: string) => void;
  label?: string;
  cameraTitle?: string;
  accentColor?: 'indigo' | 'rose' | 'emerald';
}

export const PhotoPickerInput: React.FC<PhotoPickerInputProps> = ({
  photoUrl,
  onPhotoChange,
  label = 'Foto Dokumentasi',
  cameraTitle = 'Ambil Foto dari Kamera',
  accentColor = 'indigo'
}) => {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // File chosen from Gallery
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    // reset input so selecting the same image triggers onChange
    e.target.value = '';
  };

  // Direct native camera snap
  const handleNativeCameraSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onPhotoChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenLiveCamera = () => {
    // If device supports mediaDevices, open live camera modal
    if (typeof navigator.mediaDevices?.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else {
      // Fallback directly to native camera capture
      nativeCameraInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-700">{label}</label>
          {photoUrl && (
            <button
              type="button"
              onClick={() => onPhotoChange('')}
              className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus Foto</span>
            </button>
          )}
        </div>
      )}

      {/* Hidden inputs */}
      {/* 1. Gallery input without capture */}
      <input
        type="file"
        accept="image/*"
        ref={galleryFileInputRef}
        onChange={handleGalleryFileSelect}
        className="hidden"
      />

      {/* 2. Direct Camera input with capture="environment" */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={nativeCameraInputRef}
        onChange={handleNativeCameraSelect}
        className="hidden"
      />

      {/* Dua Tombol Pilihan: Kamera vs Galeri */}
      <div className="grid grid-cols-2 gap-2">
        {/* Tombol Kamera */}
        <button
          type="button"
          onClick={handleOpenLiveCamera}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border shadow-2xs ${
            accentColor === 'rose'
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300 active:scale-98'
              : accentColor === 'emerald'
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 active:scale-98'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200 active:scale-98'
          }`}
        >
          <Camera className="w-4 h-4 shrink-0 text-slate-800" />
          <span>Ambil Kamera</span>
        </button>

        {/* Tombol Galeri */}
        <button
          type="button"
          onClick={() => galleryFileInputRef.current?.click()}
          className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs"
        >
          <ImageIcon className="w-4 h-4 shrink-0 text-slate-600" />
          <span>Pilih Galeri</span>
        </button>
      </div>

      {/* Photo Preview if photo exists */}
      {photoUrl && (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs group">
          <img
            src={photoUrl}
            alt="Preview Foto"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleOpenLiveCamera}
              className="px-2.5 py-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Foto Ulang</span>
            </button>
            <button
              type="button"
              onClick={() => onPhotoChange('')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          </div>
          <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium backdrop-blur-2xs">
            Foto terlampir ✓
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => onPhotoChange(dataUrl)}
        title={cameraTitle}
      />
    </div>
  );
};
