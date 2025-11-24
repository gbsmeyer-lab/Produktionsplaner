import React, { useState, useEffect } from 'react';
import { X, Search, AlertCircle } from 'lucide-react';
import { useApp } from '../services/store';

interface EditCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (code: string) => void;
}

export const EditCodeModal: React.FC<EditCodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loadPlanByCode } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;

    const result = loadPlanByCode(code.trim());
    if (result.error) {
      setError(result.error);
    } else {
      onSuccess(code.trim());
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
        
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
            Buchung bearbeiten
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Bitte gib den 6-stelligen Bearbeitungs-Code ein, der beim Erstellen der Buchung angezeigt wurde.
        </p>

        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <input 
                    type="text" 
                    placeholder="CODE" 
                    className="w-full text-center text-3xl font-mono tracking-widest uppercase border-2 border-gray-300 dark:border-slate-600 rounded-lg py-3 dark:bg-slate-700 dark:text-white focus:border-blue-500 outline-none transition-colors"
                    value={code}
                    onChange={(e) => {
                        setError(null);
                        setCode(e.target.value.toUpperCase());
                    }}
                    maxLength={6}
                    autoFocus
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={code.length < 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
                <Search size={18} />
                Buchung laden
            </button>
        </form>
      </div>
    </div>
  );
};