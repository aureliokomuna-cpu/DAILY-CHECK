import React, { useState } from 'react';
import { X, Upload, Palette, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { Department, VMStandard } from '../types';
import { PhotoPickerInput } from './PhotoPickerInput';

interface VMStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  existingStandard?: VMStandard;
  onSave: (standard: VMStandard) => void;
}

export const VMStandardModal: React.FC<VMStandardModalProps> = ({
  isOpen,
  onClose,
  department,
  existingStandard,
  onSave
}) => {
  const [standardPhotoUrl, setStandardPhotoUrl] = useState<string>(
    existingStandard?.standardPhotoUrl || 
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80'
  );
  const [rules, setRules] = useState<string[]>(
    existingStandard?.rules || [
      'Produk utama diletakkan menghadap lorong utama toko dengan clearance minimal 90cm',
      'Price tag akrilik dipasang rapi di pojok kanan display tanpa miring',
      'Pencahayaan spotlight diarahkan tepat ke fokus produk (3000K Warm White)'
    ]
  );
  const [newRuleText, setNewRuleText] = useState('');
  const [updatedBy, setUpdatedBy] = useState(existingStandard?.updatedBy || 'Team VM Pusat');

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (newRuleText.trim()) {
      setRules(prev => [...prev, newRuleText.trim()]);
      setNewRuleText('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStandardPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!standardPhotoUrl) {
      alert('Mohon lampirkan foto display standar VM!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    onSave({
      deptCode: department.code,
      standardPhotoUrl,
      rules,
      keyPoints: rules.map(r => r.slice(0, 20)),
      updatedAt: today,
      updatedBy: updatedBy.trim() || 'Team VM'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase bg-purple-800 px-2 py-0.5 rounded text-purple-200">
                TEAM VM GUIDELINES
              </span>
              <h2 className="text-base sm:text-lg font-extrabold mt-0.5 text-white">
                Standar Display: [{department.code}] {department.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white rounded-xl hover:bg-purple-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Photo Display Standard */}
          <div>
            <PhotoPickerInput
              photoUrl={standardPhotoUrl}
              onPhotoChange={setStandardPhotoUrl}
              label="FOTO DISPLAY STANDAR RESMI VM"
              cameraTitle="Ambil Foto Standar VM"
              accentColor="indigo"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Foto ini jadi acuan audit harian Manager & PS
            </p>
          </div>

          {/* SOP Rules List */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ATURAN & GUIDELINES DISPLAY VM
            </label>
            <div className="space-y-2 mb-3">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <span className="font-semibold">{idx + 1}. {rule}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new rule */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
                placeholder="Tambah aturan display baru..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-3 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              NAMA SPV / PIC VM PENGISI
            </label>
            <input
              type="text"
              value={updatedBy}
              onChange={(e) => setUpdatedBy(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Standar Display VM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
