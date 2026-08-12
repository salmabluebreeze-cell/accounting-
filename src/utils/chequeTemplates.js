/**
 * Default Bank Cheque Templates & Configuration
 * Dimensions in millimeters (mm)
 */

export const CROSSING_STAMP_OPTIONS = [
  { id: 'payee_only', label: 'يصرف للمستفيد الأول', en: 'Account Payee Only' },
  { id: 'not_negotiable_date', label: 'غير قابل للتداول / يصرف بتاريخه', en: 'Not Negotiable / Pay on Date' },
  { id: 'payee_only_not_neg', label: 'يصرف للمستفيد الأول فقط - غير قابل للتداول', en: 'A/C Payee Only - Not Negotiable' },
  { id: 'not_negotiable', label: 'غير قابل للتداول', en: 'Not Negotiable' },
  { id: 'acc_payee_only', label: 'حساب المستفيد الأول فقط', en: 'Payee Account Only' },
  { id: 'ac_payee_en', label: 'A/C PAYEE ONLY - NOT NEGOTIABLE', en: 'A/C PAYEE ONLY - NOT NEGOTIABLE' },
  { id: 'none', label: 'بدون تسطير (بدون ختم)', en: 'No Crossing Stamp' },
  { id: 'custom', label: 'نص مخصص...', en: 'Custom Text...' }
];

export const DEFAULT_TEMPLATES = [
  {
    id: 'arab_bank_165x85',
    name: 'Arab Bank - البنك العربي (16.5 × 8.5 cm)',
    bankName: 'Arab Bank - البنك العربي',
    widthMm: 165,
    heightMm: 85,
    bgImage: null, // Scanned background overlay (optional)
    isDefault: true,
    fields: {
      date: {
        id: 'date',
        name: 'التاريخ / Date',
        x: 8,
        y: 16,
        width: 48,
        height: 8,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        align: 'left',
        letterSpacing: 1,
        visible: true,
      },
      stamp: {
        id: 'stamp',
        name: 'ختم التسطير / Crossing Box',
        x: 62,
        y: 12,
        width: 44,
        height: 14,
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Tajawal, Arial, sans-serif',
        align: 'center',
        boxBorder: true,
        style: 'box', // 'box', 'lines', 'plain'
        visible: true,
      },
      payee: {
        id: 'payee',
        name: 'ادفعوا لأمر / Payee Name',
        x: 12,
        y: 33,
        width: 145,
        height: 9,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Tajawal, Arial, sans-serif',
        align: 'right',
        prefix: '*** ',
        suffix: ' ***',
        visible: true,
      },
      amountWords1: {
        id: 'amountWords1',
        name: 'مبلغ وقدره (السطر الأول) / Words Line 1',
        x: 12,
        y: 44,
        width: 102,
        height: 8,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Tajawal, Arial, sans-serif',
        align: 'right',
        visible: true,
      },
      amountWords2: {
        id: 'amountWords2',
        name: 'مبلغ وقدره (السطر الثاني) / Words Line 2',
        x: 12,
        y: 52,
        width: 102,
        height: 8,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Tajawal, Arial, sans-serif',
        align: 'right',
        visible: true,
      },
      amountFigures: {
        id: 'amountFigures',
        name: 'مبلغ بالأرقام (دينار/فلس) / Figures Box',
        x: 118,
        y: 43,
        width: 42,
        height: 14,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Courier New, monospace',
        align: 'center',
        prefix: '# ',
        suffix: ' #',
        visible: true,
      },
      signNote: {
        id: 'signNote',
        name: 'ملاحظة التوقيع / Sign Note',
        x: 12,
        y: 68,
        width: 70,
        height: 7,
        fontSize: 10,
        fontWeight: 'normal',
        fontFamily: 'Tajawal, Arial, sans-serif',
        align: 'right',
        visible: false,
      }
    }
  },
  {
    id: 'bank_of_jordan_175x85',
    name: 'Bank of Jordan - بنك الأردن (17.5 × 8.5 cm)',
    bankName: 'Bank of Jordan',
    widthMm: 175,
    heightMm: 85,
    bgImage: null,
    isDefault: false,
    fields: {
      date: { id: 'date', name: 'Date', x: 10, y: 16, width: 45, height: 8, fontSize: 13, fontWeight: 'bold', align: 'left', visible: true },
      stamp: { id: 'stamp', name: 'Crossing Box', x: 65, y: 12, width: 46, height: 14, fontSize: 11, fontWeight: 'bold', align: 'center', boxBorder: true, style: 'box', visible: true },
      payee: { id: 'payee', name: 'Payee Name', x: 15, y: 34, width: 150, height: 9, fontSize: 14, fontWeight: 'bold', align: 'right', prefix: '*** ', suffix: ' ***', visible: true },
      amountWords1: { id: 'amountWords1', name: 'Words Line 1', x: 15, y: 45, width: 108, height: 8, fontSize: 12, fontWeight: 'bold', align: 'right', visible: true },
      amountWords2: { id: 'amountWords2', name: 'Words Line 2', x: 15, y: 53, width: 108, height: 8, fontSize: 12, fontWeight: 'bold', align: 'right', visible: true },
      amountFigures: { id: 'amountFigures', name: 'Figures Box', x: 126, y: 44, width: 44, height: 14, fontSize: 15, fontWeight: 'bold', align: 'center', prefix: '# ', suffix: ' #', visible: true },
      signNote: { id: 'signNote', name: 'Sign Note', x: 15, y: 70, width: 70, height: 7, fontSize: 10, align: 'right', visible: false }
    }
  },
  {
    id: 'housing_bank_175x85',
    name: 'Housing Bank - بنك الإسكان (17.5 × 8.5 cm)',
    bankName: 'Housing Bank',
    widthMm: 175,
    heightMm: 85,
    bgImage: null,
    isDefault: false,
    fields: {
      date: { id: 'date', name: 'Date', x: 12, y: 15, width: 45, height: 8, fontSize: 13, fontWeight: 'bold', align: 'left', visible: true },
      stamp: { id: 'stamp', name: 'Crossing Box', x: 64, y: 11, width: 46, height: 14, fontSize: 11, fontWeight: 'bold', align: 'center', boxBorder: true, style: 'box', visible: true },
      payee: { id: 'payee', name: 'Payee Name', x: 15, y: 32, width: 150, height: 9, fontSize: 14, fontWeight: 'bold', align: 'right', prefix: '*** ', suffix: ' ***', visible: true },
      amountWords1: { id: 'amountWords1', name: 'Words Line 1', x: 15, y: 43, width: 108, height: 8, fontSize: 12, fontWeight: 'bold', align: 'right', visible: true },
      amountWords2: { id: 'amountWords2', name: 'Words Line 2', x: 15, y: 51, width: 108, height: 8, fontSize: 12, fontWeight: 'bold', align: 'right', visible: true },
      amountFigures: { id: 'amountFigures', name: 'Figures Box', x: 125, y: 43, width: 44, height: 14, fontSize: 15, fontWeight: 'bold', align: 'center', prefix: '# ', suffix: ' #', visible: true },
      signNote: { id: 'signNote', name: 'Sign Note', x: 15, y: 68, width: 70, height: 7, fontSize: 10, align: 'right', visible: false }
    }
  },
  {
    id: 'generic_cheque_180x85',
    name: 'Generic Standard Cheque - شيك عام قياسي (18.0 × 8.5 cm)',
    bankName: 'Standard Commercial Bank',
    widthMm: 180,
    heightMm: 85,
    bgImage: null,
    isDefault: false,
    fields: {
      date: { id: 'date', name: 'Date', x: 14, y: 15, width: 45, height: 8, fontSize: 13, fontWeight: 'bold', align: 'left', visible: true },
      stamp: { id: 'stamp', name: 'Crossing Box', x: 68, y: 12, width: 46, height: 14, fontSize: 11, fontWeight: 'bold', align: 'center', boxBorder: true, style: 'box', visible: true },
      payee: { id: 'payee', name: 'Payee Name', x: 15, y: 33, width: 155, height: 9, fontSize: 14, fontWeight: 'bold', align: 'right', prefix: '*** ', suffix: ' ***', visible: true },
      amountWords1: { id: 'amountWords1', name: 'Words Line 1', x: 15, y: 44, width: 112, height: 8, fontSize: 12, fontWeight: 'bold', align: 'right', visible: true },
      amountWords2: { id: 'amountWords2', name: 'Words Line 2', x: 15, y: 52, width: 112, height: 8, fontSize: 12, fontWeight: 'bold', align: 'right', visible: true },
      amountFigures: { id: 'amountFigures', name: 'Figures Box', x: 130, y: 44, width: 44, height: 14, fontSize: 15, fontWeight: 'bold', align: 'center', prefix: '# ', suffix: ' #', visible: true },
      signNote: { id: 'signNote', name: 'Sign Note', x: 15, y: 69, width: 70, height: 7, fontSize: 10, align: 'right', visible: false }
    }
  }
];

export const DEFAULT_PRINTER_CALIBRATION = {
  offsetX: 0, // mm adjustment (+ moves right, - moves left)
  offsetY: 0, // mm adjustment (+ moves down, - moves up)
  feedOrientation: 'landscape', // 'landscape', 'portrait_center', 'portrait_left', 'portrait_right'
  pageSizeMode: 'exact', // 'exact' (165x85mm) or 'a4'
  paperTray: 'manual_feed'
};
