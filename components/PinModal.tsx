import React, { useState, useEffect } from 'react';
import { X, Delete } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  // Auto-validate when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === '4103') {
        onSuccess();
        setPin('');
        setError(false);
        onClose();
      } else {
        setError(true);
        // Delay clearing to let the user see they hit the 4th digit
        const timer = setTimeout(() => {
          setPin('');
          // Keep error state momentarily true so UI can react, but typically we might clear it on next press
        }, 400);
        return () => clearTimeout(timer);
      }
    } else if (pin.length > 0 && error) {
        // Clear error as soon as user starts typing again
        setError(false);
    }
  }, [pin, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num.toString());
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 relative transition-colors duration-200 flex flex-col items-center animate-in fade-in zoom-in-95">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-center dark:text-white mt-2">Lehrer Login</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Bitte 4-stelligen Code eingeben</p>
        
        {/* PIN Dots Display */}
        <div className="flex gap-6 mb-8 justify-center h-8 items-center relative">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length 
                  ? (error ? 'bg-red-500 border-red-500 scale-100' : 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500 scale-125') 
                  : 'bg-transparent border-gray-300 dark:border-slate-600'
              }`}
            />
          ))}
          
          {error && pin.length === 0 && (
             <div className="absolute top-10 left-0 right-0 text-center text-red-500 text-sm font-bold animate-pulse">
                Falscher Code
             </div>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-2 select-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-16 w-full text-2xl font-semibold rounded-full bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-blue-100 dark:active:bg-blue-900 active:scale-95 transition-all touch-manipulation shadow-sm"
            >
              {num}
            </button>
          ))}
          
          {/* Empty spacer for alignment */}
          <div className="h-16 w-full"></div> 

          <button
            onClick={() => handleNumberClick(0)}
            className="h-16 w-full text-2xl font-semibold rounded-full bg-gray-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-blue-100 dark:active:bg-blue-900 active:scale-95 transition-all touch-manipulation shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-16 w-full flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all touch-manipulation"
          >
            <Delete size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};