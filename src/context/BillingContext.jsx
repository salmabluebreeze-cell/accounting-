import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

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
    type: 'proforma',
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
  const [companyInfo, setCompanyInfoState] = useState(INITIAL_COMPANY_INFO);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDoc, setCurrentDoc] = useState(null);

  // 1. الاستماع المباشر واللحظي للتغييرات من Firebase
  useEffect(() => {
    // الاستماع لبيانات الشركة
    const unsubCompany = onSnapshot(doc(db, 'app_data', 'companyInfo'), (docSnap) => {
      if (docSnap.exists()) {
        setCompanyInfoState(docSnap.data());
      } else {
        setDoc(doc(db, 'app_data', 'companyInfo'), INITIAL_COMPANY_INFO);
      }
    });

    // الاستماع لقائمة العملاء
    const unsubCustomers = onSnapshot(doc(db, 'app_data', 'customers'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setCustomers(docSnap.data().list);
      } else {
        setDoc(doc(db, 'app_data', 'customers'), { list: INITIAL_CUSTOMERS });
      }
    });

    // الاستماع لقائمة الفواتير والوثائق
    const unsubDocuments = onSnapshot(doc(db, 'app_data', 'documents'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setDocuments(docSnap.data().list);
      } else {
        setDoc(doc(db, 'app_data', 'documents'), { list: INITIAL_DOCUMENTS });
      }
    });

    return () => {
      unsubCompany();
      unsubCustomers();
      unsubDocuments();
    };
  }, []);

  // 2. تحديث بيانات الشركة
  const setCompanyInfo = async (newInfo) => {
    setCompanyInfoState(newInfo);
    try {
      await setDoc(doc(db, 'app_data', 'companyInfo'), newInfo);
    } catch (err) {
      console.error("خطأ في حفظ بيانات الشركة:", err);
    }
  };

  // 3. الترقيم التلقائي
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

  // 4. حفظ وتحديث الفاتورة بالكامل (التفاصيل والبنود والمجموع)
  const saveDocument = async (docData) => {
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === docData.id);
      const updatedList = exists
        ? prev.map((d) => (d.id === docData.id ? docData : d))
        : [docData, ...prev];

      // إرسال القائمة الجديدة الكاملة إلى Firebase
      setDoc(doc(db, 'app_data', 'documents'), { list: updatedList }).catch((err) =>
        console.error("خطأ في حفظ الفاتورة في السحابة:", err)
      );

      return updatedList;
    });
  };

  // 5. حذف الفاتورة
  const deleteDocument = async (id) => {
    setDocuments((prev) => {
      const updatedList = prev.filter((d) => d.id !== id);
      setDoc(doc(db, 'app_data', 'documents'), { list: updatedList }).catch((err) =>
        console.error("خطأ في حذف الفاتورة:", err)
      );
      return updatedList;
    });
  };

  // 6. حفظ وتحديث الزبائن
  const saveCustomer = async (custData) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === custData.id);
      const updatedList = exists
        ? prev.map((c) => (c.id === custData.id ? custData : c))
        : [...prev, custData];

      // إرسال قائمة العملاء كاملة للسحابة
      setDoc(doc(db, 'app_data', 'customers'), { list: updatedList }).catch((err) =>
        console.error("خطأ في حفظ الزبون في السحابة:", err)
      );

      return updatedList;
    });
  };

  // 7. حذف الزبون
  const deleteCustomer = async (id) => {
    setCustomers((prev) => {
      const updatedList = prev.filter((c) => c.id !== id);
      setDoc(doc(db, 'app_data', 'customers'), { list: updatedList }).catch((err) =>
        console.error("خطأ في حذف الزبون:", err)
      );
      return updatedList;
    });
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
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => useContext(BillingContext);