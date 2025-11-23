
import React from 'react';
import { useApp } from '../services/store';
import { Lock, LogOut, Sun, Moon, Wand2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onAdminClick: () => void;
  onExampleClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onAdminClick, onExampleClick }) => {
  const { isAdmin, logoutAdmin, isDarkMode, toggleTheme } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <header className="bg-slate-900 dark:bg-slate-950 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Produktionsplaner_beta</h1>
            <p className="text-xs text-slate-400">Mediengestaltung Bild und Ton</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAdmin ? (
              <button 
                onClick={logoutAdmin}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <div className="flex gap-2">
                 {onExampleClick && (
                   <button
                     onClick={onExampleClick}
                     className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md text-sm transition-colors text-slate-300 hover:text-white"
                     title="Füllt das Formular mit Beispieldaten"
                   >
                     <Wand2 size={16} />
                     <span className="hidden sm:inline">Beispiel</span>
                   </button>
                 )}
                 <button 
                  onClick={onAdminClick}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  <Lock size={16} />
                  <span className="hidden sm:inline">Lehrer Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-white dark:bg-slate-800 dark:border-slate-700 border-t py-4 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
        &copy; {new Date().getFullYear()} Gutenbergschule Leipzig
      </footer>
    </div>
  );
};
