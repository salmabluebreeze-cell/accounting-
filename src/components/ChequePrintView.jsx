import React from 'react';

export default function ChequePrintView({
  template,
  chequeData,
  calibration,
  customStampText
}) {
  if (!template) return null;

  // Total mm offsets
  const finalX = calibration.offsetX || 0;
  const finalY = calibration.offsetY || 0;

  // Determine stamp label
  let stampDisplay = chequeData.crossingStampText;
  if (chequeData.crossingStampId === 'custom') {
    stampDisplay = customStampText || chequeData.customStampText || 'ختم مخصص';
  }

  // Handle amount splitting into Line 1 and Line 2 if long
  let wordsLine1 = chequeData.amountWords || '';
  let wordsLine2 = chequeData.amountWordsLine2 || '';

  if (!wordsLine2 && wordsLine1.length > 55) {
    // Auto-split line 1 into two lines at space
    const splitIndex = wordsLine1.lastIndexOf(' ', 55);
    if (splitIndex > 0) {
      wordsLine2 = wordsLine1.substring(splitIndex + 1);
      wordsLine1 = wordsLine1.substring(0, splitIndex);
    }
  }

  return (
    <div className="cheque-print-root">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .cheque-print-root, .cheque-print-root * {
            visibility: visible !important;
          }
          .cheque-print-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${template.widthMm}mm !important;
            height: ${template.heightMm}mm !important;
            background: none !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
          }
          @page {
            size: ${template.widthMm}mm ${template.heightMm}mm;
            margin: 0;
          }
        }
      `}</style>

      {/* Main Print Box */}
      <div
        className="cheque-print-container"
        style={{
          position: 'relative',
          width: `${template.widthMm}mm`,
          height: `${template.heightMm}mm`,
          transform: `translate(${finalX}mm, ${finalY}mm)`,
          transformOrigin: 'top left',
          fontFamily: 'Tajawal, Arial, sans-serif',
          color: '#000000',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Date */}
        {template.fields.date?.visible && chequeData.date && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.date.x}mm`,
              top: `${template.fields.date.y}mm`,
              width: `${template.fields.date.width}mm`,
              fontSize: `${template.fields.date.fontSize}pt`,
              fontWeight: template.fields.date.fontWeight || 'bold',
              fontFamily: template.fields.date.fontFamily || 'sans-serif',
              textAlign: template.fields.date.align || 'left',
              letterSpacing: `${template.fields.date.letterSpacing || 1}px`
            }}
          >
            {chequeData.date}
          </div>
        )}

        {/* Crossing Stamp */}
        {template.fields.stamp?.visible && chequeData.crossingStampId !== 'none' && stampDisplay && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.stamp.x}mm`,
              top: `${template.fields.stamp.y}mm`,
              width: `${template.fields.stamp.width}mm`,
              height: template.fields.stamp.height ? `${template.fields.stamp.height}mm` : 'auto',
              fontSize: `${template.fields.stamp.fontSize}pt`,
              fontWeight: template.fields.stamp.fontWeight || 'bold',
              textAlign: template.fields.stamp.align || 'center',
              border: template.fields.stamp.boxBorder ? '1.5px solid #000' : 'none',
              borderRadius: template.fields.stamp.boxBorder ? '2px' : '0',
              padding: '2px 4px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1.2
            }}
          >
            {stampDisplay}
          </div>
        )}

        {/* Payee Name */}
        {template.fields.payee?.visible && chequeData.payee && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.payee.x}mm`,
              top: `${template.fields.payee.y}mm`,
              width: `${template.fields.payee.width}mm`,
              fontSize: `${template.fields.payee.fontSize}pt`,
              fontWeight: template.fields.payee.fontWeight || 'bold',
              textAlign: template.fields.payee.align || 'right'
            }}
          >
            {template.fields.payee.prefix || ''}{chequeData.payee}{template.fields.payee.suffix || ''}
          </div>
        )}

        {/* Amount in Words Line 1 */}
        {template.fields.amountWords1?.visible && wordsLine1 && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.amountWords1.x}mm`,
              top: `${template.fields.amountWords1.y}mm`,
              width: `${template.fields.amountWords1.width}mm`,
              fontSize: `${template.fields.amountWords1.fontSize}pt`,
              fontWeight: template.fields.amountWords1.fontWeight || 'bold',
              textAlign: template.fields.amountWords1.align || 'right'
            }}
          >
            {wordsLine1}
          </div>
        )}

        {/* Amount in Words Line 2 */}
        {template.fields.amountWords2?.visible && wordsLine2 && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.amountWords2.x}mm`,
              top: `${template.fields.amountWords2.y}mm`,
              width: `${template.fields.amountWords2.width}mm`,
              fontSize: `${template.fields.amountWords2.fontSize}pt`,
              fontWeight: template.fields.amountWords2.fontWeight || 'bold',
              textAlign: template.fields.amountWords2.align || 'right'
            }}
          >
            {wordsLine2}
          </div>
        )}

        {/* Amount in Figures */}
        {template.fields.amountFigures?.visible && chequeData.amountFigures && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.amountFigures.x}mm`,
              top: `${template.fields.amountFigures.y}mm`,
              width: `${template.fields.amountFigures.width}mm`,
              fontSize: `${template.fields.amountFigures.fontSize}pt`,
              fontWeight: template.fields.amountFigures.fontWeight || 'bold',
              fontFamily: template.fields.amountFigures.fontFamily || 'monospace',
              textAlign: template.fields.amountFigures.align || 'center'
            }}
          >
            {template.fields.amountFigures.prefix || ''}{chequeData.amountFigures}{template.fields.amountFigures.suffix || ''}
          </div>
        )}

        {/* Sign / Note optional */}
        {template.fields.signNote?.visible && chequeData.signNote && (
          <div
            style={{
              position: 'absolute',
              left: `${template.fields.signNote.x}mm`,
              top: `${template.fields.signNote.y}mm`,
              width: `${template.fields.signNote.width}mm`,
              fontSize: `${template.fields.signNote.fontSize}pt`,
              textAlign: template.fields.signNote.align || 'right'
            }}
          >
            {chequeData.signNote}
          </div>
        )}
      </div>
    </div>
  );
}
