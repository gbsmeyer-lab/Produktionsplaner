
import React, { useState } from 'react';
import { AppProvider, useApp } from './services/store';
import { Layout } from './components/Layout';
import { StudentForm } from './pages/StudentForm';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { PinModal } from './components/PinModal';

const AppContent: React.FC = () => {
  const { isAdmin, loginAdmin } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);
  const [triggerExample, setTriggerExample] = useState(0);

  return (
    <Layout 
      onAdminClick={() => setShowPinModal(true)} 
      onExampleClick={!isAdmin ? () => setTriggerExample(t => t + 1) : undefined}
    >
      {isAdmin ? <TeacherDashboard /> : <StudentForm triggerExample={triggerExample} />}
      
      <PinModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={loginAdmin}
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
