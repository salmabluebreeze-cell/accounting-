import React, { useState, useRef, useEffect } from 'react';
import {
  Move,
  Maximize2,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Square,
  CheckSquare,
  Grid,
  Image as ImageIcon,
  Upload,
  Trash2,
  Sliders,
  RotateCcw
} from 'lucide-react';

export default function ChequeDesigner({
  template,
  onUpdateTemplate,
  chequeData,
  activeFieldId,
  setActiveFieldId,
  showBgImage = true,
  setShowBgImage
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1.4); // Visual zoom factor for editing

  const pxPerMm = 3.7795275591 * zoomLevel; // 1mm in pixels at current zoom

  // Handle Custom Cheque Image Upload from Computer/Phone
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateTemplate({
        ...template,
        bgImage: event.target.result,
        bgOpacity: template.bgOpacity || 0.65
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onUpdateTemplate({
      ...template,
      bgImage: null
    });
  };

  const handleOpacityChange = (val) => {
    onUpdateTemplate({
      ...template,
      bgOpacity: parseFloat(val)
    });
  };

  const handleMouseDown = (e, fieldId) => {
    e.stopPropagation();
    setActiveFieldId(fieldId);
    setIsDragging(true);

    const field = template.fields[fieldId];
    const rect = canvasRef.current.getBoundingClientRect();
    const clickXmm = (e.clientX - rect.left) / pxPerMm;
    const clickYmm = (e.clientY - rect.top) / pxPerMm;

    setDragOffset({
      x: clickXmm - field.x,
      y: clickYmm - field.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !activeFieldId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentXmm = (e.clientX - rect.left) / pxPerMm;
    const currentYmm = (e.clientY - rect.top) / pxPerMm;

    let newX = Math.max(0, Math.min(template.widthMm - 10, currentXmm - dragOffset.x));
    let newY = Math.max(0, Math.min(template.heightMm - 5, currentYmm - dragOffset.y));

    // Snap to 0.5mm precision
    newX = Math.round(newX * 2) / 2;
    newY = Math.round(newY * 2) / 2;

    const updatedFields = {
      ...template.fields,
      [activeFieldId]: {
        ...template.fields[activeFieldId],
        x: newX,
        y: newY
      }
    };

    onUpdateTemplate({
      ...template,
      fields: updatedFields
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeFieldId, dragOffset]);

  const activeField = template.fields[activeFieldId];

  const updateActiveFieldProperty = (prop, value) => {
    if (!activeFieldId) return;
    onUpdateTemplate({
      ...template,
      fields: {
        ...template.fields,
        [activeFieldId]: {
          ...template.fields[activeFieldId],
          [prop]: value
        }
      }
    });
  };

  return (
    <div className="cheque-designer-container">
      {/* Top Designer Toolbar */}
      <div className="designer-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-title">Zoom:</span>
          <button
            className={`btn-sm ${zoomLevel === 1 ? 'active' : ''}`}
            onClick={() => setZoomLevel(1)}
          >
            100%
          </button>
          <button
            className={`btn-sm ${zoomLevel === 1.4 ? 'active' : ''}`}
            onClick={() => setZoomLevel(1.4)}
          >
            140%
          </button>
          <button
            className={`btn-sm ${zoomLevel === 1.8 ? 'active' : ''}`}
            onClick={() => setZoomLevel(1.8)}
          >
            180%
          </button>
        </div>

        {/* Upload Custom Image Controls */}
        <div className="toolbar-section">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          <button
            className="btn-sm active"
            style={{ background: '#0284c7', borderColor: '#0284c7' }}
            onClick={() => fileInputRef.current?.click()}
            title="Upload your scanned cheque photo to align text exactly over it"
          >
            <Upload size={14} />
            <span>{template.bgImage ? 'Change Check Background Image' : 'Upload Check Background Image (رفع صورة الشيك)'}</span>
          </button>

          {template.bgImage && (
            <button
              className="btn-sm"
              style={{ background: '#ef4444', borderColor: '#ef4444' }}
              onClick={handleRemoveImage}
              title="Remove custom background image"
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            className={`btn-sm ${showBgImage ? 'active' : ''}`}
            onClick={() => setShowBgImage(!showBgImage)}
            title="Toggle background check illustration/image overlay"
          >
            <ImageIcon size={14} />
            <span>{showBgImage ? 'Hide Background' : 'Show Background'}</span>
          </button>
        </div>

        {/* Opacity Control */}
        {showBgImage && (
          <div className="toolbar-section opacity-control" style={{ gap: '6px' }}>
            <span>Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={template.bgOpacity || 0.65}
              onChange={(e) => handleOpacityChange(e.target.value)}
              style={{ width: '70px', accentColor: '#0284c7', cursor: 'pointer' }}
            />
            <span>{Math.round((template.bgOpacity || 0.65) * 100)}%</span>
          </div>
        )}

        <div className="toolbar-info">
          <span>Canvas Size: {template.widthMm}mm × {template.heightMm}mm</span>
        </div>
      </div>

      {/* Main Designer Area: Canvas + Property Panel */}
      <div className="designer-workspace">
        {/* Interactive Canvas */}
        <div className="canvas-wrapper">
          <div
            ref={canvasRef}
            className="cheque-canvas"
            style={{
              width: `${template.widthMm * pxPerMm}px`,
              height: `${template.heightMm * pxPerMm}px`,
              position: 'relative',
              backgroundColor: '#fff',
              border: '2px solid #3b82f6',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              userSelect: 'none'
            }}
          >
            {/* 1. Custom Uploaded Image Background */}
            {showBgImage && template.bgImage && (
              <img
                src={template.bgImage}
                alt="Scanned Cheque Background"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  opacity: template.bgOpacity !== undefined ? template.bgOpacity : 0.65,
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
            )}

            {/* 2. Default Arab Bank Background Illustration (Fallback if no uploaded photo) */}
            {showBgImage && !template.bgImage && (
              <div
                className="cheque-bg-sample"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  opacity: template.bgOpacity !== undefined ? template.bgOpacity : 0.55,
                  backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                  zIndex: 1
                }}
              >
                {/* Arab Bank Header & Logo */}
                <div style={{ position: 'absolute', top: '8px', right: '12px', textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    <span>ARAB BANK البنك العربي</span>
                    <span style={{ display: 'inline-block', width: '22px', height: '14px', borderRadius: '10px', background: '#0284c7', opacity: 0.8 }}></span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>فرع خلدا</div>
                </div>

                <div style={{ position: 'absolute', top: '16px', left: '12px', fontSize: '11px', color: '#475569', fontWeight: '500' }}>
                  Date ____________ التاريخ
                </div>

                <div style={{ position: 'absolute', top: '35px', left: '12px', fontSize: '11px', color: '#475569', fontWeight: '500' }}>
                  Pay Against This Cheque To __________________________________________________ لأمر / ادفعوا بموجب هذا الشيك
                </div>

                <div style={{ position: 'absolute', top: '48px', left: '12px', fontSize: '11px', color: '#475569', fontWeight: '500' }}>
                  The Sum Of ____________________________________________________________________ مبلغ وقدره
                </div>

                {/* Dinars & Fils Box sample outline */}
                <div style={{
                  position: 'absolute',
                  top: `${43 * (pxPerMm/3.7795)}px`,
                  left: `${118 * (pxPerMm/3.7795)}px`,
                  width: `${42 * (pxPerMm/3.7795)}px`,
                  height: `${14 * (pxPerMm/3.7795)}px`,
                  border: '1px solid #94a3b8',
                  borderRadius: '2px',
                  display: 'flex',
                  fontSize: '9px',
                  color: '#475569',
                  backgroundColor: 'rgba(241, 245, 249, 0.4)'
                }}>
                  <div style={{ width: '30%', borderRight: '1px solid #94a3b8', textAlign: 'center', paddingTop: '2px', fontWeight: 'bold' }}>فلس</div>
                  <div style={{ width: '70%', textAlign: 'center', paddingTop: '2px', fontWeight: 'bold' }}>دينار</div>
                </div>

                {/* Stamp Box sample outline */}
                <div style={{
                  position: 'absolute',
                  top: `${12 * (pxPerMm/3.7795)}px`,
                  left: `${62 * (pxPerMm/3.7795)}px`,
                  width: `${44 * (pxPerMm/3.7795)}px`,
                  height: `${14 * (pxPerMm/3.7795)}px`,
                  border: '1px solid #94a3b8',
                  borderRadius: '3px',
                  textAlign: 'center',
                  fontSize: '10px',
                  color: '#64748b',
                  lineHeight: `${14 * (pxPerMm/3.7795)}px`,
                  backgroundColor: 'rgba(241, 245, 249, 0.4)'
                }}>
                  ختم التسطير
                </div>

                {/* Payee Company Printed text sample bottom right */}
                <div style={{ position: 'absolute', bottom: '26px', right: '14px', fontSize: '11px', color: '#334155', fontWeight: 'bold' }}>
                  الساده شركة النسيم الازرق لتجارة اجهزة الطاقة المتجددة ●
                </div>

                {/* Sign Line sample */}
                <div style={{ position: 'absolute', bottom: '18px', left: '12px', fontSize: '10px', color: '#64748b' }}>
                  Sign. _______________________ التوقيع
                </div>

                {/* Footer Warning & MICR code */}
                <div style={{ position: 'absolute', bottom: '12px', left: '0', right: '0', textAlign: 'center', fontSize: '8px', color: '#94a3b8' }}>
                  Please do not write under this line | الرجاء عدم الكتابة تحت هذا الخط
                </div>
                <div style={{ position: 'absolute', bottom: '3px', left: '12px', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '4px', color: '#475569' }}>
                  ⑈00000 1⑈ 10⑈ 1450⑈ 270000 20 50064500⑈
                </div>
              </div>
            )}

            {/* Field Layers (Rendered on top of background image) */}
            {Object.values(template.fields).map((field) => {
              if (!field.visible) return null;
              const isSelected = activeFieldId === field.id;

              let textValue = chequeData[field.id] || field.name;
              if (field.id === 'payee' && chequeData.payee) {
                textValue = `${field.prefix || ''}${chequeData.payee}${field.suffix || ''}`;
              } else if (field.id === 'amountFigures' && chequeData.amountFigures) {
                textValue = `${field.prefix || ''}${chequeData.amountFigures}${field.suffix || ''}`;
              }

              return (
                <div
                  key={field.id}
                  onMouseDown={(e) => handleMouseDown(e, field.id)}
                  style={{
                    position: 'absolute',
                    left: `${field.x * pxPerMm}px`,
                    top: `${field.y * pxPerMm}px`,
                    width: `${field.width * pxPerMm}px`,
                    height: field.height ? `${field.height * pxPerMm}px` : 'auto',
                    fontSize: `${field.fontSize * (zoomLevel * 0.9)}px`,
                    fontWeight: field.fontWeight || 'normal',
                    fontFamily: field.fontFamily || 'inherit',
                    textAlign: field.align || 'left',
                    color: isSelected ? '#2563eb' : '#000',
                    border: isSelected
                      ? '2px solid #2563eb'
                      : field.boxBorder
                      ? '1.5px solid #1e293b'
                      : '1px dashed rgba(59, 130, 246, 0.4)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(1px)',
                    cursor: 'move',
                    padding: '2px 4px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      field.align === 'center'
                        ? 'center'
                        : field.align === 'right'
                        ? 'flex-end'
                        : 'flex-start',
                    borderRadius: '3px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    zIndex: isSelected ? 10 : 3
                  }}
                >
                  <span style={{ width: '100%', pointerEvents: 'none' }}>{textValue}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Field Inspector & Control Panel */}
        <div className="field-inspector-panel">
          <h3>Background & Alignment</h3>

          {/* Quick Upload Button in Inspector */}
          <div className="form-group highlight-box" style={{ padding: '12px' }}>
            <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>
              صورة خلفية الشيك (Cheque Background Image):
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
              >
                <Upload size={14} /> Upload Image (رفع صورة)
              </button>
              {template.bgImage && (
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  onClick={handleRemoveImage}
                  title="Remove Image"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
              رفع صورة الشيك الحقيقية لمطابقة أماكن الخطوط والنصوص 100%
            </span>
          </div>

          {/* Select Field Dropdown */}
          <div className="form-group">
            <label>Selected Element (العنصر المحدد):</label>
            <select
              value={activeFieldId || ''}
              onChange={(e) => setActiveFieldId(e.target.value)}
              className="form-control"
            >
              <option value="">-- Choose Field to Position --</option>
              {Object.values(template.fields).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.x}mm, {f.y}mm)
                </option>
              ))}
            </select>
          </div>

          {activeField ? (
            <div className="inspector-controls">
              {/* Visibility Toggle */}
              <div className="field-toggle-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={activeField.visible}
                    onChange={(e) => updateActiveFieldProperty('visible', e.target.checked)}
                  />
                  <span>Show field on cheque print</span>
                </label>
              </div>

              {/* Coordinates: X and Y in mm */}
              <div className="grid-2-col">
                <div className="form-group">
                  <label>X Position (mm):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={activeField.x}
                    onChange={(e) => updateActiveFieldProperty('x', parseFloat(e.target.value) || 0)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Y Position (mm):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={activeField.y}
                    onChange={(e) => updateActiveFieldProperty('y', parseFloat(e.target.value) || 0)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Dimensions: Width and Height in mm */}
              <div className="grid-2-col">
                <div className="form-group">
                  <label>Width (mm):</label>
                  <input
                    type="number"
                    step="1"
                    value={activeField.width}
                    onChange={(e) => updateActiveFieldProperty('width', parseFloat(e.target.value) || 10)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Font Size (pt):</label>
                  <input
                    type="number"
                    step="1"
                    value={activeField.fontSize}
                    onChange={(e) => updateActiveFieldProperty('fontSize', parseInt(e.target.value) || 12)}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Font Family & Alignment */}
              <div className="form-group">
                <label>Text Alignment:</label>
                <div className="alignment-btn-group">
                  <button
                    className={`btn-align ${activeField.align === 'left' ? 'active' : ''}`}
                    onClick={() => updateActiveFieldProperty('align', 'left')}
                  >
                    <AlignLeft size={16} /> Left
                  </button>
                  <button
                    className={`btn-align ${activeField.align === 'center' ? 'active' : ''}`}
                    onClick={() => updateActiveFieldProperty('align', 'center')}
                  >
                    <AlignCenter size={16} /> Center
                  </button>
                  <button
                    className={`btn-align ${activeField.align === 'right' ? 'active' : ''}`}
                    onClick={() => updateActiveFieldProperty('align', 'right')}
                  >
                    <AlignRight size={16} /> Right
                  </button>
                </div>
              </div>

              {/* Font Weight */}
              <div className="form-group">
                <label>Font Style:</label>
                <select
                  value={activeField.fontWeight || 'normal'}
                  onChange={(e) => updateActiveFieldProperty('fontWeight', e.target.value)}
                  className="form-control"
                >
                  <option value="normal">Normal (عادي)</option>
                  <option value="bold">Bold (عريض)</option>
                  <option value="600">Semi-Bold</option>
                </select>
              </div>

              {/* Box Border Toggle for Crossing Box */}
              {activeFieldId === 'stamp' && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!activeField.boxBorder}
                      onChange={(e) => updateActiveFieldProperty('boxBorder', e.target.checked)}
                    />
                    <span>Draw Framed Box around Crossing Stamp (مستطيل الختم)</span>
                  </label>
                </div>
              )}

              {/* Prefix / Suffix for Payee & Amount */}
              {(activeFieldId === 'payee' || activeFieldId === 'amountFigures') && (
                <div className="grid-2-col">
                  <div className="form-group">
                    <label>Prefix (بادئة):</label>
                    <input
                      type="text"
                      value={activeField.prefix || ''}
                      onChange={(e) => updateActiveFieldProperty('prefix', e.target.value)}
                      placeholder="e.g. *** "
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Suffix (لاحقة):</label>
                    <input
                      type="text"
                      value={activeField.suffix || ''}
                      onChange={(e) => updateActiveFieldProperty('suffix', e.target.value)}
                      placeholder="e.g. ***"
                      className="form-control"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-inspector-note">
              <p>Click any field on the cheque canvas above or choose a field from the dropdown to adjust position and font settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
