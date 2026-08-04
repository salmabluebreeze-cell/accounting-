import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import {
  FileText,
  PlusCircle,
  Users,
  Settings,
  LayoutDashboard,
  Share2,
} from 'lucide-react';
import SyncModal from './SyncModal';

export default function Navbar() {
  const { activeTab, setActiveTab, setCurrentDoc, generateDocNumber, peerCount } =
    useBilling();
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleCreateNew = (type = 'proforma') => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    const newDoc = {
      id: `doc-${Date.now()}`,
      type: type,
      number: generateDocNumber(type),
      date: today,
      validUntil: futureDate.toISOString().split('T')[0],
      customer: {
        companyName: '',
        contact: '',
        countryCity: 'Jordan - AMMAN',
        phone: '',
        project: '',
      },
      items: [
        {
          id: Date.now(),
          itemNo: 1,
          description: '',
          qty: 1,
          unit: 'item',
          unitPrice: 0,
        },
      ],
      subtotal: 0,
      taxRate: 0.16,
      shipping: 0,
      other: 0,
      status: 'draft',
      comments:
        type === 'quotation'
          ? 'Payment Terms:\n100% payment is due upon complete\nNoted that:\nThis offer include sales tax\n\nAny additional requirements or modifications will be quoted separately'
          : '',
    };

    setCurrentDoc(newDoc);
    setActiveTab('editor');
  };

  return (
    <>
      <header className="navbar no-print">
        <div className="navbar-inner">
          {/* Main Page Website PNG Logo */}
          <div
            className="brand-logo"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <img
              src="/logo.png"
              alt="Blue Breeze Logo"
              style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            />
            <div className="brand-title" style={{ display: 'none' }}>
              <span className="en">BLUE BREEZE</span>
              <span className="ar">النسيم الأزرق</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="nav-links">
            <button
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FileText size={17} />
              <span>Documents</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users size={17} />
              <span>Customers & Projects</span>
            </button>

            <button
              className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={17} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Action Buttons & Sync Indicator */}
          <div className="nav-actions">
            <div
              className="sync-badge"
              onClick={() => setShowSyncModal(true)}
              title="Click to manage multi-user real-time room sharing"
            >
              <span className="sync-dot"></span>
              <Share2 size={14} />
              <span>{peerCount > 1 ? `${peerCount} Users Active` : 'Realtime Sync'}</span>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => handleCreateNew('proforma')}
            >
              <PlusCircle size={17} />
              <span>New Document</span>
            </button>
          </div>
        </div>
      </header>

      {showSyncModal && <SyncModal onClose={() => setShowSyncModal(false)} />}
    </>
  );
}
