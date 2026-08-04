import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  FileSpreadsheet,
  PlusCircle,
  Download,
} from 'lucide-react';
import { exportDocumentToExcel, exportSummaryToExcel } from '../utils/excelHandler';

export default function DocumentList() {
  const {
    documents,
    deleteDocument,
    saveDocument,
    setActiveTab,
    setCurrentDoc,
    generateDocNumber,
  } = useBilling();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.customer?.companyName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (doc.customer?.project || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEdit = (doc) => {
    setCurrentDoc(doc);
    setActiveTab('editor');
  };

  const handleView = (doc) => {
    setCurrentDoc(doc);
    setActiveTab('preview');
  };

  const handleDuplicate = (doc) => {
    const newDoc = {
      ...JSON.parse(JSON.stringify(doc)),
      id: `doc-${Date.now()}`,
      number: generateDocNumber(doc.type),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
    };
    saveDocument(newDoc);
    alert(`Duplicated as ${newDoc.number}`);
  };

  const handleDelete = (id, number) => {
    if (window.confirm(`Are you sure you want to delete ${number}?`)) {
      deleteDocument(id);
    }
  };

  const handleStatusChange = (doc, newStatus) => {
    saveDocument({ ...doc, status: newStatus });
  };

  return (
    <div className="documents-container">
      {/* Top Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Document Management Directory
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Manage, edit, export to Excel/PDF, and track invoices & quotations.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => exportSummaryToExcel(filteredDocuments)}
        >
          <FileSpreadsheet size={16} />
          <span>Export View to Excel</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search by Document Number, Customer Name, or Project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              background: 'white',
            }}
          >
            <option value="all">All Document Types</option>
            <option value="proforma">Proforma Invoices</option>
            <option value="quotation">Quotations</option>
            <option value="invoice">Tax Invoices</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              background: 'white',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Document #</th>
                <th>Type</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Project Scope</th>
                <th>Total (JOD)</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Excel & PDF</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No matching documents found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
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
                        <select
                          value={doc.status}
                          onChange={(e) => handleStatusChange(doc, e.target.value)}
                          className={`status-badge ${doc.status}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => exportDocumentToExcel(doc)}
                            title="Export Document to Excel (.xlsx)"
                          >
                            <FileSpreadsheet size={14} color="#16a34a" />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleView(doc)}
                            title="Print / Export PDF"
                          >
                            <Download size={14} color="#0284c7" />
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleView(doc)}
                            title="View Document"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEdit(doc)}
                            title="Edit Document"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDuplicate(doc)}
                            title="Duplicate Document"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(doc.id, doc.number)}
                            title="Delete Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
