import React, { useState } from 'react';
import { AppProvider, useApp } from './services/store';
import { Layout } from './components/Layout';
import { StudentForm } from './pages/StudentForm';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { PinModal } from './components/PinModal';
import { EditCodeModal } from './components/EditCodeModal';

const AppContent: React.FC = () => {
  const { isAdmin, loginAdmin } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [triggerExample, setTriggerExample] = useState(0);
  const [codeToLoad, setCodeToLoad] = useState<string | null>(null);

  const handleEditSuccess = (code: string) => {
    setCodeToLoad(code);
    // Reset after a short delay so it can be triggered again if needed, 
    // though usually the form handles the change.
    setTimeout(() => setCodeToLoad(null), 500);
  };

  return (
    <Layout 
      onAdminClick={() => setShowPinModal(true)} 
      onExampleClick={!isAdmin ? () => setTriggerExample(t => t + 1) : undefined}
      onEditClick={!isAdmin ? () => setShowEditModal(true) : undefined}
    >
      {isAdmin ? (
        <TeacherDashboard />
      ) : (
        <StudentForm 
            triggerExample={triggerExample} 
            externalLoadCode={codeToLoad}
        />
      )}
      
      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={loginAdmin}
      />

      <EditCodeModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
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