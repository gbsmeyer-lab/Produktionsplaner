
import React, { useState } from 'react';
import { AppProvider, useApp } from './services/store';
import { Layout } from './components/Layout';
import { StudentForm } from './pages/StudentForm';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { PinModal } from './components/PinModal';
import { LoadPlanModal } from './components/LoadPlanModal';

const AppContent: React.FC = () => {
  const { isAdmin, loginAdmin } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [triggerExample, setTriggerExample] = useState(0);
  const [codeToLoad, setCodeToLoad] = useState<string | null>(null);

  const handleLoadCode = (code: string) => {
    setCodeToLoad(code);
    // Reset after a brief moment so triggering again with same code works if needed, 
    // though usually useEffect in form handles change. 
    // If we want to reload the same code, we might need a counter or timestamp, 
    // but for now unique codes or re-entering works fine.
  };

  return (
    <Layout 
      onAdminClick={() => setShowPinModal(true)} 
      onExampleClick={!isAdmin ? () => setTriggerExample(t => t + 1) : undefined}
      onLoadCodeClick={!isAdmin ? () => setShowLoadModal(true) : undefined}
    >
      {isAdmin ? (
         <TeacherDashboard /> 
      ) : (
         <StudentForm 
            triggerExample={triggerExample} 
            externalCodeToLoad={codeToLoad}
         />
      )}
      
      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={loginAdmin}
      />

      <LoadPlanModal 
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onConfirm={handleLoadCode}
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
