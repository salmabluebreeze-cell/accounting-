import React from 'react';
import { useBilling } from '../context/BillingContext';
import { Download, Printer, ArrowLeft, Edit } from 'lucide-react';
import { downloadPDF } from '../utils/pdfGenerator';

export default function PDFTemplate() {
  const { currentDoc, companyInfo, setActiveTab } = useBilling();

  if (!currentDoc) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>No document selected for preview.</h3>
        <button
          className="btn btn-primary"
          style={{ marginTop: '16px' }}
          onClick={() => setActiveTab('documents')}
        >
          Return to Documents
        </button>
      </div>
    );
  }

  const doc = currentDoc;
  const items = doc.items || [];

  const subtotal = items.reduce(
    (acc, it) => acc + (parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0),
    0
  );
  const taxRate = doc.taxRate !== undefined ? doc.taxRate : 0.16;
  const salesTax = subtotal * taxRate;
  const shipping = parseFloat(doc.shipping) || 0;
  const other = parseFloat(doc.other) || 0;
  const grandTotal = subtotal + salesTax + shipping + other;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadPDF('pdf-render-area', `${doc.number || 'Document'}.pdf`);
  };

  return (
    <div className="pdf-preview-container">
      {/* Top Action Bar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setActiveTab('documents')}
        >
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('editor')}
          >
            <Edit size={16} />
            <span>Edit Document</span>
          </button>

          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Document</span>
          </button>

          <button className="btn btn-success" onClick={handleDownload}>
            <Download size={16} />
            <span>Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Exact Visual PDF Page Renderer */}
      <div className="pdf-template-wrapper">
        <div className="pdf-page" id="pdf-render-area">
          {/* Background Breeze Wave Watermark Graphic */}
          <div className="pdf-breeze-background">
            <svg
              viewBox="0 0 800 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%' }}
            >
              <path
                d="M-50 250 C150 120, 450 380, 850 180 C650 320, 250 100, -50 250 Z"
                fill="url(#breezeGrad1)"
              />
              <path
                d="M-50 320 C200 200, 500 420, 850 260 C600 380, 200 180, -50 320 Z"
                fill="url(#breezeGrad2)"
              />
              <defs>
                <linearGradient id="breezeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="breezeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="pdf-page-content">
            {/* Header with PNG Logo */}
            <div className="pdf-header">
              {/* Left Brand Logo Image */}
              <div>
                <img
                  src="/logo.png"
                  alt="Blue Breeze Logo"
                  className="pdf-header-logo-img"
                />
              </div>

              {/* Center Title */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    color: '#0284c7',
                    letterSpacing: '2px',
                  }}
                >
                  BLUE BREEZE
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  Trading Renewable Energy Devices
                </div>
              </div>

              {/* Right Arabic Title */}
              <div>
                <div className="pdf-header-logo-ar">النسيم الأزرق</div>
                <div style={{ fontFamily: 'Cairo', fontSize: '0.7rem', color: '#475569', textAlign: 'right' }}>
                  لتجارة أجهزة الطاقة المتجددة ذ.م.م
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="pdf-title-banner">
              <h1>
                {doc.type === 'proforma'
                  ? 'PRO-FORMA INVOICE'
                  : doc.type === 'quotation'
                  ? 'QUOTATION'
                  : 'TAX INVOICE'}
              </h1>
            </div>

            {/* Meta Grid: Customer Box & Document Info Box */}
            <div className="pdf-meta-grid">
              {/* Customer Info */}
              <div className="pdf-info-box">
                <div className="pdf-info-box-title">Customer</div>
                <div className="pdf-info-box-content">
                  <p>
                    <strong>Company Name :</strong>{' '}
                    <span>{doc.customer?.companyName || ''}</span>
                  </p>
                  <p>
                    <strong>Contact or Department:</strong>{' '}
                    <span>{doc.customer?.contact || ''}</span>
                  </p>
                  <p>
                    <strong>Country-City :</strong>{' '}
                    <span>{doc.customer?.countryCity || ''}</span>
                  </p>
                  <p>
                    <strong>Phone:</strong> <span>{doc.customer?.phone || ''}</span>
                  </p>
                  {doc.customer?.project && (
                    <p style={{ marginTop: '4px', borderTop: '1px dashed #cbd5e1', paddingTop: '4px' }}>
                      <strong>Project:</strong>{' '}
                      <span style={{ fontWeight: '700', color: '#0284c7' }}>
                        {doc.customer.project}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Document Meta Info */}
              <div className="pdf-info-box" style={{ alignSelf: 'flex-start' }}>
                <div className="pdf-info-box-content" style={{ padding: '0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ background: '#f8fafc', fontWeight: '700', borderBottom: '1px solid #cbd5e1', padding: '6px 12px' }}>
                          DATE
                        </td>
                        <td style={{ borderBottom: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'right', fontWeight: '600' }}>
                          {doc.date}
                        </td>
                      </tr>
                      {doc.validUntil && (
                        <tr>
                          <td style={{ background: '#f8fafc', fontWeight: '700', borderBottom: '1px solid #cbd5e1', padding: '6px 12px' }}>
                            {doc.type === 'quotation' ? 'Valid Until' : 'Due Date'}
                          </td>
                          <td style={{ borderBottom: '1px solid #cbd5e1', padding: '6px 12px', textAlign: 'right', fontWeight: '600' }}>
                            {doc.validUntil}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ background: '#f8fafc', fontWeight: '700', padding: '6px 12px' }}>
                          {doc.type === 'quotation' ? 'QUOTATION #' : 'INVOICE NO:'}
                        </td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: '800', color: '#dc2626' }}>
                          {doc.number}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="pdf-items-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>ITEM #</th>
                  <th>DESCRIPTION</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>QTY</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>unit</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>UNIT PRICE</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>TOTAL (JOD)</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      No items
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const lineTot = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);

                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: '600' }}>{item.itemNo || idx + 1}</td>
                        <td style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>{item.description}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'center' }}>{item.unit || 'item'}</td>
                        <td style={{ textAlign: 'right' }}>{(parseFloat(item.unitPrice) || 0).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{lineTot.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Totals Summary */}
            <div className="pdf-summary-block">
              <table className="pdf-summary-table">
                <tbody>
                  <tr>
                    <td className="label">SUBTOTAL</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="label">Sales TAX {Math.round(taxRate * 100)}%</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{salesTax > 0 ? salesTax.toFixed(2) : '-'}</td>
                  </tr>
                  <tr>
                    <td className="label">SHIPPING</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{shipping > 0 ? shipping.toFixed(2) : '-'}</td>
                  </tr>
                  <tr>
                    <td className="label">OTHER</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{other > 0 ? other.toFixed(2) : '-'}</td>
                  </tr>
                  <tr className="grand-total">
                    <td style={{ padding: '8px 10px' }}>TOTAL</td>
                    <td style={{ textAlign: 'right', padding: '8px 10px' }}>JOD {grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Blocks: Bank Account Info (for PI/Invoice) OR Comments/Terms (for Quotation) */}
            {doc.type === 'quotation' ? (
              <div className="pdf-info-box" style={{ marginBottom: '20px' }}>
                <div className="pdf-info-box-title" style={{ background: '#475569' }}>
                  Comments or Special Instructions
                </div>
                <div className="pdf-info-box-content" style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                  {doc.comments || 'No special comments.'}
                </div>
              </div>
            ) : (
              <div className="pdf-bank-info">
                <div
                  style={{
                    background: '#1e3a8a',
                    color: 'white',
                    padding: '4px 8px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    borderRadius: '2px',
                  }}
                >
                  BANK ACCOUNT INFORMATION
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <div><strong>Name:</strong> {companyInfo.shortName}</div>
                  <div><strong>Bank Account:</strong> {companyInfo.bankName}</div>
                  <div><strong>Bank Account Branch name:</strong> {companyInfo.branch}</div>
                  <div><strong>Account No:</strong> {companyInfo.accountNo}</div>
                  <div><strong>IBAN:</strong> {companyInfo.iban}</div>
                  <div><strong>SWIFT code:</strong> {companyInfo.swift}</div>
                  <div><strong>Cliq:</strong> {companyInfo.cliq}</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pdf-footer">
            <div>📞 {companyInfo.phone2}</div>
            <div>📍 {companyInfo.address}</div>
            <div>🌐 {companyInfo.website}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
