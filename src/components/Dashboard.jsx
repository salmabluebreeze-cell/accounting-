import React from 'react';
import { useBilling } from '../context/BillingContext';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  PlusCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { exportSummaryToExcel } from '../utils/excelHandler';

export default function Dashboard() {
  const { documents, setActiveTab, setCurrentDoc, generateDocNumber } = useBilling();

  // Financial summary calculations
  const calculateTotals = () => {
    let totalInvoiced = 0;
    let totalQuotations = 0;
    let pendingPayment = 0;
    let totalTax = 0;

    documents.forEach((doc) => {
      const sub = (doc.items || []).reduce(
        (acc, item) => acc + (item.qty || 0) * (item.unitPrice || 0),
        0
      );
      const tax = sub * (doc.taxRate || 0.16);
      const grand = sub + tax + (doc.shipping || 0) + (doc.other || 0);

      totalTax += tax;

      if (doc.type === 'invoice') {
        totalInvoiced += grand;
        if (doc.status !== 'paid') {
          pendingPayment += grand;
        }
      } else if (doc.type === 'quotation') {
        totalQuotations += grand;
      } else if (doc.type === 'proforma') {
        if (doc.status !== 'paid') {
          pendingPayment += grand;
        }
      }
    });

    return { totalInvoiced, totalQuotations, pendingPayment, totalTax };
  };

  const totals = calculateTotals();

  const handleCreateNew = (type) => {
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

  const handleViewDoc = (doc) => {
    setCurrentDoc(doc);
    setActiveTab('preview');
  };

  const handleEditDoc = (doc) => {
    setCurrentDoc(doc);
    setActiveTab('editor');
  };

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
          padding: '24px 30px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
            Blue Breeze Executive Financial Summary
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.92rem' }}>
            Real-time tracking of Invoices, Proforma Invoices, Quotations, and Tax collections (JOD).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={() => exportSummaryToExcel(documents)}
          >
            <FileSpreadsheet size={16} />
            <span>Export Summary to Excel</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <DollarSign />
          </div>
          <div className="stat-info">
            <h4>Total Quotations</h4>
            <div className="value">JOD {totals.totalQuotations.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <TrendingUp />
          </div>
          <div className="stat-info">
            <h4>Total Invoiced</h4>
            <div className="value">JOD {totals.totalInvoiced.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock />
          </div>
          <div className="stat-info">
            <h4>Pending Payments</h4>
            <div className="value">JOD {totals.pendingPayment.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <FileText />
          </div>
          <div className="stat-info">
            <h4>Sales Tax Collected (16%)</h4>
            <div className="value">JOD {totals.totalTax.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Quick Action Triggers */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
          Create New Document
        </h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '200px', padding: '14px' }}
            onClick={() => handleCreateNew('proforma')}
          >
            <PlusCircle size={18} />
            <span>Create Proforma Invoice</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '200px', padding: '14px', background: '#fffbe8', borderColor: '#fde047', color: '#854d0e' }}
            onClick={() => handleCreateNew('quotation')}
          >
            <PlusCircle size={18} />
            <span>Create Quotation</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '200px', padding: '14px', background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
            onClick={() => handleCreateNew('invoice')}
          >
            <PlusCircle size={18} />
            <span>Create Tax Invoice</span>
          </button>

          <button
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '200px', padding: '14px', background: 'linear-gradient(135deg, #0284c7, #1e3a8a)', color: '#ffffff' }}
            onClick={() => setActiveTab('cheque-writer')}
          >
            <Printer size={18} />
            <span>Cheque Writer (طباعة الشيكات)</span>
          </button>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b' }}>
            Recent Billing Documents
          </h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('documents')}
          >
            View All Documents ({documents.length})
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Doc Number</th>
                <th>Type</th>
                <th>Date</th>
                <th>Customer / Company</th>
                <th>Project Scope</th>
                <th>Total (JOD)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.slice(0, 5).map((doc) => {
                const sub = (doc.items || []).reduce(
                  (acc, it) => acc + (it.qty || 0) * (it.unitPrice || 0),
                  0
                );
                const grand = sub * (1 + (doc.taxRate || 0.16)) + (doc.shipping || 0) + (doc.other || 0);

                return (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{doc.number}</td>
                    <td>
                      <span className={`doc-badge ${doc.type}`}>
                        {doc.type === 'proforma'
                          ? 'Pro-Forma'
                          : doc.type === 'quotation'
                          ? 'Quotation'
                          : 'Tax Invoice'}
                      </span>
                    </td>
                    <td>{doc.date}</td>
                    <td style={{ fontWeight: 600 }}>{doc.customer?.companyName || 'N/A'}</td>
                    <td style={{ color: '#64748b' }}>{doc.customer?.project || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      JOD {grand.toFixed(2)}
                    </td>
                    <td>
                      <span className={`status-badge ${doc.status}`}>{doc.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDoc(doc)}
                          title="View Printable Template / Download PDF"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditDoc(doc)}
                          title="Edit Document"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
