import * as XLSX from 'xlsx';

/**
 * Read Excel file (.xlsx or .csv) and parse line items
 */
export const importItemsFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          return resolve([]);
        }

        // Detect header row or start reading rows
        const items = [];
        let startRowIndex = 0;

        // Check if row 0 contains column titles like 'description', 'qty', 'price'
        const firstRow = rawJson[0] || [];
        const isHeader = firstRow.some((cell) =>
          typeof cell === 'string' &&
          /desc|item|qty|quantity|price|unit/i.test(cell)
        );

        if (isHeader) {
          startRowIndex = 1;
        }

        for (let i = startRowIndex; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          // Attempt to map columns smartly:
          // Item #, Description, Qty, Unit, Unit Price
          const desc = row[1] || row[0] || '';
          const qty = parseFloat(row[2] || row[1] || 1) || 1;
          const unit = row[3] || 'item';
          const unitPrice = parseFloat(row[4] || row[3] || row[2] || 0) || 0;

          if (desc || unitPrice) {
            items.push({
              id: Date.now() + i,
              itemNo: items.length + 1,
              description: String(desc).trim(),
              qty: qty,
              unit: String(unit).trim(),
              unitPrice: unitPrice,
              total: qty * unitPrice,
            });
          }
        }

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export single document (Invoice / Quotation / PI) to formatted Excel file
 */
export const exportDocumentToExcel = (doc) => {
  const wb = XLSX.utils.book_new();

  // Create summary rows
  const documentData = [
    ['BLUE BREEZE For Trading Renewable Energy Devices L.L.C'],
    [doc.type.toUpperCase() + ' #: ' + doc.number],
    ['Date: ' + doc.date],
    doc.validUntil ? ['Valid Until: ' + doc.validUntil] : [],
    [],
    ['CUSTOMER DETAILS'],
    ['Company Name', doc.customer?.companyName || ''],
    ['Contact / Department', doc.customer?.contact || ''],
    ['Country - City', doc.customer?.countryCity || ''],
    ['Phone', doc.customer?.phone || ''],
    ['Project', doc.customer?.project || ''],
    [],
    ['LINE ITEMS'],
    ['Item #', 'Description', 'Qty', 'Unit', 'Unit Price (JOD)', 'Total (JOD)'],
  ];

  // Append line items
  doc.items.forEach((item, index) => {
    documentData.push([
      item.itemNo || index + 1,
      item.description || '',
      item.qty || 0,
      item.unit || 'item',
      item.unitPrice || 0,
      (item.qty || 0) * (item.unitPrice || 0),
    ]);
  });

  // Calculate Subtotal, Tax, Total
  const subtotal = doc.items.reduce(
    (acc, it) => acc + (it.qty || 0) * (it.unitPrice || 0),
    0
  );
  const tax = subtotal * (doc.taxRate || 0.16);
  const shipping = doc.shipping || 0;
  const other = doc.other || 0;
  const grandTotal = subtotal + tax + shipping + other;

  documentData.push([]);
  documentData.push(['', '', '', '', 'SUBTOTAL', subtotal]);
  documentData.push(['', '', '', '', `Sales TAX (${(doc.taxRate || 0.16) * 100}%)`, tax]);
  if (shipping) documentData.push(['', '', '', '', 'SHIPPING', shipping]);
  if (other) documentData.push(['', '', '', '', 'OTHER', other]);
  documentData.push(['', '', '', '', 'TOTAL JOD', grandTotal]);

  const ws = XLSX.utils.aoa_to_sheet(documentData);

  // Set column widths
  ws['!cols'] = [
    { wch: 10 },
    { wch: 45 },
    { wch: 10 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, doc.number || 'Document');
  XLSX.writeFile(wb, `${doc.number || 'Document'}.xlsx`);
};

/**
 * Export Summary Log of all Invoices / Quotations to Excel
 */
export const exportSummaryToExcel = (documents) => {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['BLUE BREEZE - Document Summary Report'],
    ['Generated On: ' + new Date().toLocaleDateString()],
    [],
    ['Doc Number', 'Type', 'Date', 'Customer', 'Project', 'Status', 'Subtotal (JOD)', 'Tax 16%', 'Grand Total (JOD)'],
  ];

  documents.forEach((doc) => {
    const subtotal = (doc.items || []).reduce(
      (acc, it) => acc + (it.qty || 0) * (it.unitPrice || 0),
      0
    );
    const tax = subtotal * (doc.taxRate || 0.16);
    const shipping = doc.shipping || 0;
    const other = doc.other || 0;
    const total = subtotal + tax + shipping + other;

    summaryData.push([
      doc.number,
      doc.type?.toUpperCase(),
      doc.date,
      doc.customer?.companyName || 'N/A',
      doc.customer?.project || 'N/A',
      doc.status?.toUpperCase(),
      subtotal,
      tax,
      total,
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 30 },
    { wch: 25 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  XLSX.writeFile(wb, `Blue_Breeze_Summary_${Date.now()}.xlsx`);
};
