import React, { createContext, useContext, useState, useEffect } from 'react';
import { realtimeSync } from '../utils/realtimeSync';

const BillingContext = createContext();

const INITIAL_COMPANY_INFO = {
  name: 'BLUE BREEZE For Trading Renewable Energy Devices L.L.C',
  nameArabic: 'النسيم الأزرق لتجارة أجهزة الطاقة المتجددة ذ.م.م',
  shortName: 'BLUE BREEZE',
  address: 'Wasfi At-Tall Str, Hisham Salama Commercial Complex, Amman, Jordan',
  phone1: '+962 7 9717 0858',
  phone2: '+962 79 766 1818',
  email: 'info@blue-breez.com',
  website: 'www.blue-breez.com',
  bankName: 'Arab Bank',
  branch: 'Khalda',
  accountNo: '0145205006500',
  iban: 'JO97ARAB1450000000145205006500',
  swift: 'ARABJOA100',
  cliq: 'BLUEBREEZE',
  taxRate: 0.16,
};

const INITIAL_CUSTOMERS = [
  {
    id: 'c1',
    companyName: 'Eagle Solar Power',
    contact: 'Eng. Tareq',
    countryCity: 'Jordan - AMMAN',
    phone: '+962 7 9123 4567',
    project: 'eagle solar taibeh',
  },
  {
    id: 'c2',
    companyName: 'شركة الفكرة الذهبية للخدمات الهندسية',
    contact: 'المكتب الهندسي',
    countryCity: 'Jordan - AMMAN',
    phone: '+962 7 8888 9999',
    project: 'Inspection and Testing Generator 800 kVA',
  },
];

const INITIAL_DOCUMENTS = [
  {
    id: 'doc-pi-108',
    type: 'proforma', // 'proforma', 'quotation', 'invoice'
    number: 'PI-2026-0108',
    date: '2026-08-02',
    validUntil: '2026-08-16',
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        id: 1,
        itemNo: 1,
        description: 'Solar Inverter 10kW Hybrid - Three Phase',
        qty: 2,
        unit: 'pcs',
        unitPrice: 1200.0,
      },
      {
        id: 2,
        itemNo: 2,
        description: 'Lithium Battery Pack 5.12kWh LiFePO4',
        qty: 4,
        unit: 'pcs',
        unitPrice: 850.0,
      },
    ],
    subtotal: 5800.0,
    taxRate: 0.16,
    shipping: 0,
    other: 0,
    status: 'sent',
    comments: '',
  },
  {
    id: 'doc-qt-382',
    type: 'quotation',
    number: 'QT-2026-0382',
    date: '2026-07-06',
    validUntil: '2026-07-20',
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        id: 1,
        itemNo: 1,
        description:
          'Inspection and Testing of 800 kVA Generator, including Earthing Resistance Test, Current Measurement using Clamp Meter, Sound Level Measurement, Vibration Test, and Insulation Resistance Test using Megger.',
        qty: 1,
        unit: 'item',
        unitPrice: 700.0,
      },
    ],
    subtotal: 700.0,
    taxRate: 0.16,
    shipping: 0,
    other: 0,
    status: 'sent',
    comments:
      'Payment Terms:\n100% payment is due upon complete\nNoted that:\nThis offer include sales tax\n\nAny additional requirements or modifications will be quoted separately',
  },
];

export const BillingProvider = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('blue_breeze_company');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_INFO;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('blue_breeze_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('blue_breeze_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [roomId, setRoomId] = useState('BLUE-BREEZE-TEAM-ROOM');
  const [peerCount, setPeerCount] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDoc, setCurrentDoc] = useState(null);

  // Save to local storage on change & broadcast real-time sync
  useEffect(() => {
    localStorage.setItem('blue_breeze_company', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    localStorage.setItem('blue_breeze_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('blue_breeze_documents', JSON.stringify(documents));

    // Broadcast state update to peer tabs/users
    realtimeSync.broadcastState({
      companyInfo,
      customers,
      documents,
    });
  }, [documents, companyInfo, customers]);

  // Window Storage Event Listener (Instant Cross-Tab / Cross-Window Sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'blue_breeze_documents' && e.newValue) {
        setDocuments(JSON.parse(e.newValue));
      } else if (e.key === 'blue_breeze_customers' && e.newValue) {
        setCustomers(JSON.parse(e.newValue));
      } else if (e.key === 'blue_breeze_company' && e.newValue) {
        setCompanyInfo(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Connect Real-time P2P sync listener
  useEffect(() => {
    realtimeSync.connectRoom(
      roomId,
      (remoteState) => {
        if (remoteState) {
          if (remoteState.documents) setDocuments(remoteState.documents);
          if (remoteState.customers) setCustomers(remoteState.customers);
          if (remoteState.companyInfo) setCompanyInfo(remoteState.companyInfo);
        }
      },
      (count) => setPeerCount(count)
    );

    return () => realtimeSync.disconnect();
  }, [roomId]);

  // Auto-generate Document Number
  const generateDocNumber = (type) => {
    const year = new Date().getFullYear();
    const prefix =
      type === 'proforma' ? 'PI' : type === 'quotation' ? 'QT' : 'INV';

    const existing = documents
      .filter((d) => d.type === type && d.number.includes(`${prefix}-${year}`))
      .map((d) => {
        const parts = d.number.split('-');
        return parseInt(parts[parts.length - 1], 10) || 0;
      });

    const maxNum =
      existing.length > 0
        ? Math.max(...existing)
        : type === 'proforma'
        ? 108
        : type === 'quotation'
        ? 382
        : 10;
    const nextNum = String(maxNum + 1).padStart(4, '0');

    return `${prefix}-${year}-${nextNum}`;
  };

  // Add or Update Document
  const saveDocument = (docData) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === docData.id);
      if (exists) {
        return prev.map((d) => (d.id === docData.id ? docData : d));
      } else {
        return [docData, ...prev];
      }
    });
  };

  // Delete Document
  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Add / Edit Customer
  const saveCustomer = (custData) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === custData.id);
      if (exists) {
        return prev.map((c) => (c.id === custData.id ? custData : c));
      } else {
        return [...prev, custData];
      }
    });
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <BillingContext.Provider
      value={{
        companyInfo,
        setCompanyInfo,
        customers,
        saveCustomer,
        deleteCustomer,
        documents,
        saveDocument,
        deleteDocument,
        generateDocNumber,
        activeTab,
        setActiveTab,
        currentDoc,
        setCurrentDoc,
        roomId,
        setRoomId,
        peerCount,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => useContext(BillingContext);
