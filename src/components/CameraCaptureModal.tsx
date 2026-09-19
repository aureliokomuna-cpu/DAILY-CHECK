import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Ambil Foto dari Kamera'
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Start camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setErrorMsg(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
        throw new Error('Fitur live kamera tidak didukung di browser ini. Gunakan kamera sistem.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      setStream(newStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.error('Camera stream error:', err);
      setHasPermission(false);
      const message = err instanceof Error ? err.message : 'Tidak dapat mengakses kamera';
      setErrorMsg(message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Flip camera between environment (rear) and user (front)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture snapshot from video stream to canvas
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    // Pause video track while previewing
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    onClose();
  };

  // Fallback: Native system camera input
  const handleNativeCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
        handleClose();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      {/* Hidden input strictly for native camera invocation if device blocks getUserMedia */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={nativeCameraInputRef}
        onChange={handleNativeCameraChange}
        className="hidden"
      />

      <div className="bg-slate-900 text-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700">
        
        {/* Header Modal */}
        <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">
                {capturedImage ? 'Periksa hasil jepretan' : 'Arahkan kamera ke area display'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative bg-black aspect-4/3 sm:aspect-4/3 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Hasil Jepretan"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Grid Overlay for Visual Merchandising Display Symmetry */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>

              {/* Switch Facing Mode Button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                title="Putar Kamera (Depan / Belakang)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-300">
                {facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}
              </div>
            </>
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Permission / Device Error Banner */}
          {errorMsg && !capturedImage && (
            <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Akses Kamera Terkendala</h4>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                {errorMsg.includes('Permission') 
                  ? 'Izin kamera belum diberikan pada browser. Anda tetap bisa menggunakan kamera sistem perangkat.' 
                  : 'Gunakan tombol di bawah untuk membuka aplikasi kamera bawaan perangkat.'}
              </p>
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <span>Buka Kamera Sistem (Native)</span>
              </button>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between gap-2">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Foto Ulang</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Foto Ini</span>
              </button>
            </>
          ) : (
            <>
              {/* Fallback to Native Camera button */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                title="Gunakan aplikasi kamera bawaan HP"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kamera Sistem</span>
              </button>

              {/* Main Shutter Button */}
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSnap}
                  className="w-14 h-14 rounded-full border-4 border-white/80 bg-rose-600 hover:bg-rose-500 active:scale-90 flex items-center justify-center shadow-lg transition-transform"
                  title="Ambil Foto"
                >
                  <div className="w-8 h-8 rounded-full bg-white"></div>
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-3 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
