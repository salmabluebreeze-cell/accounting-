import React, { useState, useEffect } from 'react';
import { useBilling } from '../context/BillingContext';
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { importItemsFromExcel, exportDocumentToExcel } from '../utils/excelHandler';

export default function DocumentEditor() {
  const {
    currentDoc,
    setCurrentDoc,
    customers,
    saveDocument,
    generateDocNumber,
    setActiveTab,
  } = useBilling();

  // Local document state
  const [doc, setDoc] = useState(() => {
    if (currentDoc) return { ...currentDoc };

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    return {
      id: `doc-${Date.now()}`,
      type: 'proforma',
      number: generateDocNumber('proforma'),
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
      comments: '',
    };
  });

  // Recalculate totals whenever items or rates change
  useEffect(() => {
    const newSubtotal = doc.items.reduce(
      (acc, item) => acc + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0),
      0
    );
    setDoc((prev) => ({ ...prev, subtotal: newSubtotal }));
  }, [doc.items]);

  // Handle Type Change & Auto-Number
  const handleTypeChange = (newType) => {
    const newNumber = generateDocNumber(newType);
    const defaultComments =
      newType === 'quotation'
        ? 'Payment Terms:\n100% payment is due upon complete\nNoted that:\nThis offer include sales tax\n\nAny additional requirements or modifications will be quoted separately'
        : '';

    setDoc((prev) => ({
      ...prev,
      type: newType,
      number: newNumber,
      comments: prev.comments || defaultComments,
    }));
  };

  // Select pre-saved Customer
  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setDoc((prev) => ({
        ...prev,
        customer: {
          companyName: found.companyName,
          contact: found.contact,
          countryCity: found.countryCity,
          phone: found.phone,
          project: found.project,
        },
      }));
    }
  };

  // Line Item Grid Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...doc.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'qty' || field === 'unitPrice' ? parseFloat(value) || 0 : value,
    };
    setDoc((prev) => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setDoc((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now() + Math.random(),
          itemNo: prev.items.length + 1,
          description: '',
          qty: 1,
          unit: 'item',
          unitPrice: 0,
        },
      ],
    }));
  };

  const removeItemRow = (index) => {
    if (doc.items.length === 1) {
      alert('Document must contain at least 1 line item.');
      return;
    }
    const newItems = doc.items.filter((_, i) => i !== index);
    // Re-index itemNo
    const reindexed = newItems.map((it, idx) => ({ ...it, itemNo: idx + 1 }));
    setDoc((prev) => ({ ...prev, items: reindexed }));
  };

  // Excel File Upload Import
  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const importedItems = await importItemsFromExcel(file);
      if (importedItems.length > 0) {
        setDoc((prev) => ({
          ...prev,
          items: importedItems,
        }));
        alert(`Successfully imported ${importedItems.length} line items from Excel!`);
      } else {
        alert('No valid items found in the Excel spreadsheet.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing Excel file. Please ensure it is a valid .xlsx or .csv document.');
    }
  };

  // Save Document Handler
  const handleSave = () => {
    if (!doc.customer?.companyName) {
      alert('Please select or enter a Customer / Company Name.');
      return;
    }
    saveDocument(doc);
    setCurrentDoc(doc);
    alert(`Successfully saved ${doc.number}!`);
  };

  const handleSaveAndView = () => {
    handleSave();
    setActiveTab('preview');
  };

  const taxAmount = doc.subtotal * (doc.taxRate || 0.16);
  const grandTotal = doc.subtotal + taxAmount + (parseFloat(doc.shipping) || 0) + (parseFloat(doc.other) || 0);

  return (
    <div className="editor-container">
      {/* Top Bar Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('documents')}
          >
            <ArrowLeft size={16} />
            <span>Back to List</span>
          </button>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            {doc.number ? `Edit Document: ${doc.number}` : 'Create New Billing Document'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => exportDocumentToExcel(doc)}
          >
            <FileSpreadsheet size={16} color="#16a34a" />
            <span>Export to Excel</span>
          </button>

          <button className="btn btn-secondary" onClick={handleSaveAndView}>
            <Eye size={16} />
            <span>Preview & Print PDF</span>
          </button>

          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} />
            <span>Save Document</span>
          </button>
        </div>
      </div>

      {/* 1. Document Configuration Box */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1e3a8a' }}>
          1. Document Details & Auto-Filling
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Document Type */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Document Type:
            </label>
            <select
              value={doc.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <option value="proforma">PRO-FORMA INVOICE</option>
              <option value="quotation">QUOTATION</option>
              <option value="invoice">TAX INVOICE</option>
            </select>
          </div>

          {/* Document Number */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Document Number:
              </label>
              <button
                type="button"
                onClick={() => setDoc((prev) => ({ ...prev, number: generateDocNumber(prev.type) }))}
                style={{ border: 'none', background: 'transparent', color: '#0284c7', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
              >
                Auto-Generate
              </button>
            </div>
            <input
              type="text"
              value={doc.number}
              onChange={(e) => setDoc((prev) => ({ ...prev, number: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                color: '#1e3a8a',
              }}
            />
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Document Date:
            </label>
            <input
              type="date"
              value={doc.date}
              onChange={(e) => setDoc((prev) => ({ ...prev, date: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>

          {/* Valid Until / Due Date */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              {doc.type === 'quotation' ? 'Valid Until Date:' : 'Due Date:'}
            </label>
            <input
              type="date"
              value={doc.validUntil || ''}
              onChange={(e) => setDoc((prev) => ({ ...prev, validUntil: e.target.value }))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Customer & Project Details */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
            2. Customer & Project Information
          </h3>

          {/* Quick Dropdown select */}
          {customers.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Quick Select Saved Customer:</span>
              <select
                onChange={handleCustomerSelect}
                defaultValue=""
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <option value="" disabled>Choose Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.project || 'No project'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Company / Customer Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Eagle Solar Power / شركة الفكرة الذهبية"
              value={doc.customer?.companyName || ''}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, companyName: e.target.value },
                }))
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Contact or Department:
            </label>
            <input
              type="text"
              placeholder="e.g. Procurement / Eng. Tareq"
              value={doc.customer?.contact || ''}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, contact: e.target.value },
                }))
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Country - City:
            </label>
            <input
              type="text"
              placeholder="e.g. Jordan - AMMAN ."
              value={doc.customer?.countryCity || ''}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, countryCity: e.target.value },
                }))
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Customer Phone:
            </label>
            <input
              type="text"
              placeholder="e.g. +962 7 9123 4567"
              value={doc.customer?.phone || ''}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, phone: e.target.value },
                }))
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
              Associated Project Name:
            </label>
            <input
              type="text"
              placeholder="e.g. eagle solar taibeh / Inspection and Testing of 800 kVA Generator"
              value={doc.customer?.project || ''}
              onChange={(e) =>
                setDoc((prev) => ({
                  ...prev,
                  customer: { ...prev.customer, project: e.target.value },
                }))
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                color: '#0284c7',
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Interactive Excel Spreadsheet Data Grid */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="excel-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet style={{ color: '#16a34a' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
              3. Interactive Excel Data Grid & Line Items
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label
              className="btn btn-secondary btn-sm"
              style={{ cursor: 'pointer', background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
            >
              <Upload size={14} />
              <span>Import Excel Sheet (.xlsx)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelImport}
                style={{ display: 'none' }}
              />
            </label>

            <button className="btn btn-primary btn-sm" onClick={addItemRow}>
              <Plus size={14} />
              <span>Add Row</span>
            </button>
          </div>
        </div>

        {/* Live Spreadsheet Grid */}
        <div className="excel-grid-container">
          <table className="excel-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>#</th>
                <th>DESCRIPTION</th>
                <th style={{ width: '90px' }}>QTY</th>
                <th style={{ width: '100px' }}>UNIT</th>
                <th style={{ width: '130px' }}>UNIT PRICE (JOD)</th>
                <th style={{ width: '150px' }}>TOTAL (JOD)</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, index) => {
                const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

                return (
                  <tr key={item.id || index}>
                    <td className="col-num">{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="excel-input"
                        placeholder="Item or service description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="excel-input"
                        style={{ textAlign: 'center' }}
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="excel-input"
                        style={{ textAlign: 'center' }}
                        placeholder="item/pcs"
                        value={item.unit || 'item'}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        className="excel-input"
                        style={{ textAlign: 'right', fontWeight: 600 }}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 700, color: '#1e3a8a' }}>
                      {lineTotal.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => removeItemRow(index)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                        title="Delete Row"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Summary Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <div
            style={{
              width: '320px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>SUBTOTAL:</span>
              <span style={{ fontWeight: 700 }}>JOD {doc.subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Sales TAX:</span>
                <select
                  value={doc.taxRate}
                  onChange={(e) => setDoc((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                  style={{ padding: '2px 4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  <option value={0.16}>16%</option>
                  <option value={0}>0% (Tax Exempt)</option>
                </select>
              </div>
              <span style={{ fontWeight: 700 }}>JOD {taxAmount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>SHIPPING:</span>
              <input
                type="number"
                step="any"
                value={doc.shipping || 0}
                onChange={(e) => setDoc((prev) => ({ ...prev, shipping: parseFloat(e.target.value) || 0 }))}
                style={{ width: '80px', textAlign: 'right', padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>OTHER:</span>
              <input
                type="number"
                step="any"
                value={doc.other || 0}
                onChange={(e) => setDoc((prev) => ({ ...prev, other: parseFloat(e.target.value) || 0 }))}
                style={{ width: '80px', textAlign: 'right', padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div
              style={{
                borderTop: '2px solid #1e3a8a',
                paddingTop: '10px',
                display: 'flex',
                justify: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#1e3a8a',
              }}
            >
              <span>TOTAL (JOD):</span>
              <span>JOD {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Comments & Terms */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#1e3a8a' }}>
          4. Terms, Notes & Special Instructions
        </h3>
        <textarea
          rows={4}
          placeholder="Enter payment terms, delivery notes, or special instructions..."
          value={doc.comments}
          onChange={(e) => setDoc((prev) => ({ ...prev, comments: e.target.value }))}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}
        ></textarea>
      </div>
    </div>
  );
}
