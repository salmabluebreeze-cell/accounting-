import React, { useState } from 'react';
import { Search, Printer, Trash2, Download, FileSpreadsheet, Plus, CheckCircle, RefreshCw } from 'lucide-react';

export default function ChequeHistory({
  chequeLogs,
  onPrintCheque,
  onDeleteLog,
  onClearAllLogs,
  onLoadChequeToEditor
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = chequeLogs.filter((item) => {
    const matchesSearch =
      (item.payee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.chequeNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.bankName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (chequeLogs.length === 0) return alert('No cheque records to export.');

    const headers = ['Cheque Number', 'Date', 'Payee Name', 'Amount (Figures)', 'Amount (Words)', 'Crossing Stamp', 'Bank', 'Status'];
    const rows = chequeLogs.map((c) => [
      `"${c.chequeNumber || ''}"`,
      `"${c.date || ''}"`,
      `"${c.payee || ''}"`,
      `"${c.amountFigures || ''}"`,
      `"${c.amountWords || ''}"`,
      `"${c.crossingStampText || ''}"`,
      `"${c.bankName || ''}"`,
      `"${c.status || 'printed'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cheque_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cheque-history-container">
      <div className="history-header">
        <div>
          <h2>سجل الشيكات الصادرة (Cheque Registry)</h2>
          <p>أرشيف وسجل الشيكات المكتوبة والمطبوعة مسبقاً</p>
        </div>

        <div className="history-actions">
          <button className="btn btn-outline" onClick={exportToCSV}>
            <FileSpreadsheet size={16} /> Export CSV / Excel
          </button>
          {chequeLogs.length > 0 && (
            <button className="btn btn-danger-outline" onClick={onClearAllLogs}>
              <Trash2 size={16} /> Clear Registry
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="history-filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Payee, Cheque #, or Bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
          >
            <option value="all">All Statuses (كل الحالات)</option>
            <option value="printed">Printed (مطبوع)</option>
            <option value="draft">Draft (مسودة)</option>
            <option value="void">Voided (ملغى)</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th># Cheque No.</th>
              <th>Date (التاريخ)</th>
              <th>Payee Name (اسم المستفيد)</th>
              <th>Amount (المبلغ)</th>
              <th>Crossing Stamp (التسطير)</th>
              <th>Bank (البنك)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold">{item.chequeNumber || '---'}</td>
                  <td>{item.date}</td>
                  <td className="fw-bold">{item.payee}</td>
                  <td className="amount-col">
                    <span className="badge-amount">{item.amountFigures} {item.currency || 'JOD'}</span>
                  </td>
                  <td>
                    <span className="stamp-badge">
                      {item.crossingStampText || 'بدون تسطير'}
                    </span>
                  </td>
                  <td>{item.bankName || 'Arab Bank'}</td>
                  <td>
                    <span className={`status-pill ${item.status || 'printed'}`}>
                      {item.status || 'printed'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon"
                      title="Load into Editor"
                      onClick={() => onLoadChequeToEditor(item)}
                    >
                      <RefreshCw size={15} />
                    </button>
                    <button
                      className="btn-icon primary"
                      title="Print Cheque"
                      onClick={() => onPrintCheque(item)}
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete Entry"
                      onClick={() => onDeleteLog(item.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-table-msg">
                  No cheque entries found in history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
