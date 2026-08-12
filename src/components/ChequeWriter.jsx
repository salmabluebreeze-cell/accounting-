import React, { useState, useEffect } from 'react';
import { useBilling } from '../context/BillingContext';
import { tafqeetArabic, tafqeetEnglish } from '../utils/tafqeet';
import {
  DEFAULT_TEMPLATES,
  CROSSING_STAMP_OPTIONS,
  DEFAULT_PRINTER_CALIBRATION
} from '../utils/chequeTemplates';
import ChequeDesigner from './ChequeDesigner';
import ChequePrintView from './ChequePrintView';
import ChequeHistory from './ChequeHistory';
import {
  Printer,
  Sliders,
  Save,
  RotateCcw,
  Layout,
  History,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Lock,
  ChevronDown,
  Layers,
  Settings
} from 'lucide-react';

export default function ChequeWriter() {
  const { customers } = useBilling();

  // Active View Mode: 'editor', 'designer', 'calibration', 'history'
  const [activeSubTab, setActiveSubTab] = useState('editor');

  // Templates state
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('cheque_templates');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);

  // Active Template
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Printer Calibration state
  const [calibration, setCalibration] = useState(() => {
    const saved = localStorage.getItem('cheque_printer_calibration');
    return saved ? JSON.parse(saved) : DEFAULT_PRINTER_CALIBRATION;
  });

  // Current Cheque Form State
  const [chequeData, setChequeData] = useState({
    date: new Date().toISOString().split('T')[0].split('-').reverse().join('/'), // DD/MM/YYYY
    payee: '',
    amountFigures: '1450.500',
    currency: 'JOD',
    amountWords: '',
    amountWordsLine2: '',
    useManualWords: false,
    crossingStampId: 'payee_only', // Default to 'يصرف للمستفيد الأول'
    crossingStampText: 'يصرف للمستفيد الأول',
    customStampText: '',
    chequeNumber: '000001',
    bankName: 'Arab Bank - البنك العربي',
    signNote: '',
    status: 'printed'
  });

  // Cheque History / Logs state
  const [chequeLogs, setChequeLogs] = useState(() => {
    const saved = localStorage.getItem('cheque_logs_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-1',
        chequeNumber: '000001',
        date: '12/08/2026',
        payee: 'شركة النسيم الأزرق لتجارة أجهزة الطاقة المتجددة',
        amountFigures: '1450.500',
        currency: 'JOD',
        amountWords: 'فقط ألف وأربعمائة وخمسون ديناراً أردنياً وخمسمائة فلس لا غير',
        crossingStampText: 'يصرف للمستفيد الأول',
        bankName: 'Arab Bank - البنك العربي',
        status: 'printed'
      }
    ];
  });

  // Designer active field
  const [activeFieldId, setActiveFieldId] = useState('payee');
  const [showBgImage, setShowBgImage] = useState(true);

  // Auto Tafqeet effect
  useEffect(() => {
    if (!chequeData.useManualWords) {
      const num = parseFloat(chequeData.amountFigures);
      if (!isNaN(num) && num > 0) {
        const words = tafqeetArabic(num, chequeData.currency);
        setChequeData((prev) => ({
          ...prev,
          amountWords: words
        }));
      } else {
        setChequeData((prev) => ({ ...prev, amountWords: '' }));
      }
    }
  }, [chequeData.amountFigures, chequeData.currency, chequeData.useManualWords]);

  // Persist Templates & Calibration
  useEffect(() => {
    localStorage.setItem('cheque_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('cheque_printer_calibration', JSON.stringify(calibration));
  }, [calibration]);

  useEffect(() => {
    localStorage.setItem('cheque_logs_history', JSON.stringify(chequeLogs));
  }, [chequeLogs]);

  // Handle Template Property Updates
  const handleUpdateTemplate = (updatedTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  };

  // Handle Crossing Stamp Change
  const handleStampChange = (stampId) => {
    const found = CROSSING_STAMP_OPTIONS.find((opt) => opt.id === stampId);
    let stampText = found ? found.label : '';
    if (stampId === 'none') stampText = '';
    if (stampId === 'custom') stampText = chequeData.customStampText || 'ختم مخصص';

    setChequeData((prev) => ({
      ...prev,
      crossingStampId: stampId,
      crossingStampText: stampText
    }));
  };

  // Handle Print Action
  const handlePrint = () => {
    // Add to history if new
    const newLog = {
      id: `log-${Date.now()}`,
      ...chequeData,
      bankName: activeTemplate.bankName || activeTemplate.name,
      printedAt: new Date().toISOString()
    };

    setChequeLogs((prev) => [newLog, ...prev]);

    // Trigger browser native print dialog
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Save to Registry without print
  const handleSaveToRegistry = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      ...chequeData,
      bankName: activeTemplate.bankName || activeTemplate.name,
      status: 'saved'
    };
    setChequeLogs((prev) => [newLog, ...prev]);
    alert('Cheque record saved successfully to history.');
  };

  return (
    <div className="cheque-writer-module">
      {/* Module Header Bar */}
      <div className="module-header no-print">
        <div className="module-title-box">
          <div className="cheque-badge-icon">
            <Printer size={24} />
          </div>
          <div>
            <h1>محرر وطابعة الشيكات المحترفة (Universal Cheque Writer)</h1>
            <p>طباعة الشيكات البنكية بدقة عالية على جميع أنواع الطابعات</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="module-top-actions">
          <button className="btn btn-secondary" onClick={handleSaveToRegistry}>
            <Save size={16} />
            <span>Save Entry</span>
          </button>
          <button className="btn btn-primary btn-lg" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print Cheque (طباعة الشيك)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="subtab-navigation no-print">
        <button
          className={`subtab-btn ${activeSubTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('editor')}
        >
          <Layers size={16} />
          <span>Cheque Form (بيانات الشيك)</span>
        </button>

        <button
          className={`subtab-btn ${activeSubTab === 'designer' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('designer')}
        >
          <Layout size={16} />
          <span>Layout Designer (مصمم القالب والخطوط)</span>
        </button>

        <button
          className={`subtab-btn ${activeSubTab === 'calibration' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('calibration')}
        >
          <Sliders size={16} />
          <span>Printer Calibration (معايرة الطابعة)</span>
        </button>

        <button
          className={`subtab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <History size={16} />
          <span>Registry & History ({chequeLogs.length})</span>
        </button>
      </div>

      {/* Main Sub-Tab Content Views */}
      <div className="subtab-content-area">
        {/* SUBTAB 1: CHEQUE EDITOR FORM */}
        {activeSubTab === 'editor' && (
          <div className="editor-tab-layout">
            {/* Form Section */}
            <div className="card editor-card">
              <div className="card-header">
                <h3>بيانات وتفاصيل الشيك (Cheque Details)</h3>
                <div className="template-selector-header">
                  <label>قالب البنك (Bank Template):</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="form-control"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card-body">
                <form onSubmit={(e) => e.preventDefault()} className="cheque-form">
                  {/* Row 1: Date & Cheque Number */}
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label className="form-label">
                        التاريخ (Date):
                        <span
                          className="btn-link-sm"
                          onClick={() =>
                            setChequeData((prev) => ({
                              ...prev,
                              date: new Date().toISOString().split('T')[0].split('-').reverse().join('/')
                            }))
                          }
                        >
                          (تاريخ اليوم)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={chequeData.date}
                        onChange={(e) => setChequeData({ ...chequeData, date: e.target.value })}
                        placeholder="DD/MM/YYYY"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">رقم الشيك (Cheque No.):</label>
                      <input
                        type="text"
                        value={chequeData.chequeNumber}
                        onChange={(e) => setChequeData({ ...chequeData, chequeNumber: e.target.value })}
                        placeholder="e.g. 000001"
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Row 2: Crossing Stamp Dropdown (ختم التسطير) */}
                  <div className="form-group highlight-box">
                    <label className="form-label fw-bold color-primary">
                      ختم التسطير (Crossing Stamp):
                    </label>
                    <div className="grid-2-col">
                      <select
                        value={chequeData.crossingStampId}
                        onChange={(e) => handleStampChange(e.target.value)}
                        className="form-control lg-select"
                      >
                        {CROSSING_STAMP_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label} ({opt.en})
                          </option>
                        ))}
                      </select>

                      {chequeData.crossingStampId === 'custom' && (
                        <input
                          type="text"
                          value={chequeData.customStampText}
                          onChange={(e) => {
                            setChequeData({
                              ...chequeData,
                              customStampText: e.target.value,
                              crossingStampText: e.target.value
                            });
                          }}
                          placeholder="اكتب النص المخصص لختم التسطير هنا..."
                          className="form-control"
                        />
                      )}
                    </div>
                  </div>

                  {/* Row 3: Payee Name (ادفعوا بموجب هذا الشيك لأمر) */}
                  <div className="form-group">
                    <label className="form-label">
                      اسم المستفيد (Payee Name - ادفعوا بموجب هذا الشيك لأمر):
                    </label>
                    <div className="payee-input-wrapper">
                      <input
                        type="text"
                        value={chequeData.payee}
                        onChange={(e) => setChequeData({ ...chequeData, payee: e.target.value })}
                        placeholder="اسم الشريكة / الشركة / الشخص..."
                        className="form-control payee-input"
                        list="customer-suggestions"
                      />
                      <datalist id="customer-suggestions">
                        {customers.map((c) => (
                          <option key={c.id} value={c.companyName} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Row 4: Amount Figures & Currency */}
                  <div className="grid-2-col">
                    <div className="form-group">
                      <label className="form-label">المبلغ بالأرقام (Amount in Figures):</label>
                      <input
                        type="number"
                        step="0.001"
                        value={chequeData.amountFigures}
                        onChange={(e) => setChequeData({ ...chequeData, amountFigures: e.target.value })}
                        placeholder="1450.500"
                        className="form-control amount-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">العملة (Currency):</label>
                      <select
                        value={chequeData.currency}
                        onChange={(e) => setChequeData({ ...chequeData, currency: e.target.value })}
                        className="form-control"
                      >
                        <option value="JOD">JOD - دينار أردني (فلس)</option>
                        <option value="USD">USD - دولار أمريكي (سنت)</option>
                        <option value="SAR">SAR - ريال سعودي (هللة)</option>
                        <option value="AED">AED - درهم إماراتي (فلس)</option>
                        <option value="EGP">EGP - جنيه مصري (قرش)</option>
                        <option value="KWD">KWD - دينار كويتي (فلس)</option>
                        <option value="EUR">EUR - يورو (سنت)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Amount in Words (Tafqeet) */}
                  <div className="form-group">
                    <div className="label-with-checkbox">
                      <label className="form-label">
                        المبلغ بالحروف (Tafqeet - مبلغ وقدره):
                      </label>
                      <label className="checkbox-inline">
                        <input
                          type="checkbox"
                          checked={chequeData.useManualWords}
                          onChange={(e) =>
                            setChequeData({ ...chequeData, useManualWords: e.target.checked })
                          }
                        />
                        <span>تعديل التفقيط يدوياً</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={chequeData.amountWords}
                      onChange={(e) => setChequeData({ ...chequeData, amountWords: e.target.value })}
                      disabled={!chequeData.useManualWords}
                      className="form-control tafqeet-textarea"
                      placeholder="التفقيط التلقائي يظهر هنا..."
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Side Live Cheque Preview */}
            <div className="card preview-card">
              <div className="card-header">
                <h3>معاينة مباشرة للشيك (Live Preview)</h3>
                <span className="badge-info">{activeTemplate.name}</span>
              </div>
              <div className="card-body center-flex">
                <ChequeDesigner
                  template={activeTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  chequeData={chequeData}
                  activeFieldId={activeFieldId}
                  setActiveFieldId={setActiveFieldId}
                  showBgImage={showBgImage}
                  setShowBgImage={setShowBgImage}
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: LAYOUT DESIGNER */}
        {activeSubTab === 'designer' && (
          <div className="designer-subtab-wrapper">
            <ChequeDesigner
              template={activeTemplate}
              onUpdateTemplate={handleUpdateTemplate}
              chequeData={chequeData}
              activeFieldId={activeFieldId}
              setActiveFieldId={setActiveFieldId}
              showBgImage={showBgImage}
              setShowBgImage={setShowBgImage}
            />
          </div>
        )}

        {/* SUBTAB 3: PRINTER CALIBRATION */}
        {activeSubTab === 'calibration' && (
          <div className="calibration-container card">
            <div className="card-header">
              <h2>إعدادات وتعديل معايرة الطابعة (Universal Printer Calibration)</h2>
              <p>تعديل الإزاحة بالأفقي والعمودي (ملم) لضمان الطباعة في المكان المخصص بالضبط على أي نوع طابعة</p>
            </div>

            <div className="card-body calibration-body">
              <div className="grid-2-col">
                {/* Horizontal Offset Slider */}
                <div className="calibration-control-box">
                  <label className="calibration-label">
                    الإزاحة الأفقية X-Offset (يمين / يسار):
                    <span className="offset-val">{calibration.offsetX} mm</span>
                  </label>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="0.5"
                    value={calibration.offsetX}
                    onChange={(e) =>
                      setCalibration({ ...calibration, offsetX: parseFloat(e.target.value) })
                    }
                    className="range-slider"
                  />
                  <div className="range-hints">
                    <span>-40 mm (إلى اليسار)</span>
                    <span>0 mm</span>
                    <span>+40 mm (إلى اليمين)</span>
                  </div>
                </div>

                {/* Vertical Offset Slider */}
                <div className="calibration-control-box">
                  <label className="calibration-label">
                    الإزاحة العمودية Y-Offset (أعلى / أسفل):
                    <span className="offset-val">{calibration.offsetY} mm</span>
                  </label>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    step="0.5"
                    value={calibration.offsetY}
                    onChange={(e) =>
                      setCalibration({ ...calibration, offsetY: parseFloat(e.target.value) })
                    }
                    className="range-slider"
                  />
                  <div className="range-hints">
                    <span>-40 mm (إلى الأعلى)</span>
                    <span>0 mm</span>
                    <span>+40 mm (إلى الأسفل)</span>
                  </div>
                </div>
              </div>

              {/* Feed Orientation & Paper Tray Mode */}
              <div className="feed-orientation-section">
                <h4>اتجاه تغذية الورق بالطابعة (Printer Paper Tray Orientation):</h4>
                <div className="orientation-grid">
                  <div
                    className={`orientation-card ${calibration.feedOrientation === 'landscape' ? 'active' : ''}`}
                    onClick={() => setCalibration({ ...calibration, feedOrientation: 'landscape' })}
                  >
                    <div className="icon-box">📄</div>
                    <div className="orient-title">Landscape (تغذية عرضية)</div>
                    <p>تلقيم الشيك بالاتجاه العرضي الأفقي القياسي (16.5 سم)</p>
                  </div>

                  <div
                    className={`orientation-card ${calibration.feedOrientation === 'portrait_center' ? 'active' : ''}`}
                    onClick={() => setCalibration({ ...calibration, feedOrientation: 'portrait_center' })}
                  >
                    <div className="icon-box">📩</div>
                    <div className="orient-title">Portrait Center (تلقيم طولي بالمنتصف)</div>
                    <p>تلقيم الشيك في منتصف صينية ورق الطابعة</p>
                  </div>
                </div>
              </div>

              <div className="calibration-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCalibration(DEFAULT_PRINTER_CALIBRATION)}
                >
                  <RotateCcw size={16} /> Reset Default Calibration
                </button>

                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={16} /> Test Calibration Print Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: CHEQUE HISTORY & REGISTRY */}
        {activeSubTab === 'history' && (
          <ChequeHistory
            chequeLogs={chequeLogs}
            onPrintCheque={(item) => {
              setChequeData(item);
              setTimeout(() => window.print(), 100);
            }}
            onDeleteLog={(id) => setChequeLogs((prev) => prev.filter((l) => l.id !== id))}
            onClearAllLogs={() => {
              if (confirm('Are you sure you want to clear all cheque registry logs?')) {
                setChequeLogs([]);
              }
            }}
            onLoadChequeToEditor={(item) => {
              setChequeData(item);
              setActiveSubTab('editor');
            }}
          />
        )}
      </div>

      {/* Hidden Print Container for CSS @media print */}
      <ChequePrintView
        template={activeTemplate}
        chequeData={chequeData}
        calibration={calibration}
      />
    </div>
  );
}
