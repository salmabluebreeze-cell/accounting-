import React from 'react';
import { BillingProvider, useBilling } from './context/BillingContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import DocumentEditor from './components/DocumentEditor';
import PDFTemplate from './components/PDFTemplate';
import CustomerManager from './components/CustomerManager';
import SettingsModal from './components/SettingsModal';

function MainApp() {
  const { activeTab } = useBilling();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'documents' && <DocumentList />}
        {activeTab === 'editor' && <DocumentEditor />}
        {activeTab === 'preview' && <PDFTemplate />}
        {activeTab === 'customers' && <CustomerManager />}
        {activeTab === 'settings' && <SettingsModal />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BillingProvider>
      <MainApp />
    </BillingProvider>
  );
}
