
import React, { useState, useEffect } from 'react';
import { X, KeyRound, Search } from 'lucide-react';

interface LoadPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code: string) => void;
}

export const LoadPlanModal: React.FC<LoadPlanModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [code, setCode] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
        onConfirm(code);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 relative transition-colors duration-200 animate-in fade-in zoom-in-95">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <KeyRound size={24} />
            </div>
            
            <h2 className="text-xl font-bold mb-2 dark:text-white">Planung laden</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Gib deinen 6-stelligen Code ein, um eine gespeicherte Planung zu bearbeiten.</p>
            
            <form onSubmit={handleSubmit} className="w-full">
                <input 
                    type="text" 
                    placeholder="CODE" 
                    className="w-full border rounded-lg p-3 text-center text-2xl font-mono tracking-widest uppercase mb-4 bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    autoFocus
                />
                
                <button
                    type="submit"
                    disabled={code.length < 6}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Search size={18} /> Laden
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
