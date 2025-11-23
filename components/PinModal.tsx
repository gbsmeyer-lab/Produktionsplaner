import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated PIN as requested: 4103
    if (pin === '4103') {
      onSuccess();
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xs p-6 relative transition-colors duration-200">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center dark:text-white">Lehrer Login</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Bitte geben Sie den 4-stelligen Code ein.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 dark:border-slate-600 rounded-md py-3 focus:border-blue-500 focus:outline-none bg-white dark:bg-slate-700 dark:text-white"
            placeholder="0000"
            autoFocus
          />
          {error && <p className="text-red-500 dark:text-red-400 text-center text-sm">Falscher Code</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
};