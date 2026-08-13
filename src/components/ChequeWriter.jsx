import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useBilling } from '../context/BillingContext';
import { tafqeetArabic } from '../utils/tafqeet';
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
  Layers,
  CloudOff,
  Cloud,
  CheckCircle2,
  Loader
} from 'lucide-react';

// ─── Firebase document paths ───────────────────────────────────────────────
const FB_TEMPLATES   = doc(db, 'cheque_data', 'templates');
const FB_CALIBRATION = doc(db, 'cheque_data', 'calibration');
const FB_LOGS        = doc(db, 'cheque_data', 'logs');

export default function ChequeWriter() {
  const { customers } = useBilling();

  // ─── Sync status indicator ───────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // ─── Active sub-tab ──────────────────────────────────────────────────────
  const [activeSubTab, setActiveSubTab] = useState('editor');

  // ─── Templates (Firebase-synced) ─────────────────────────────────────────
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // ─── Calibration (Firebase-synced) ───────────────────────────────────────
  const [calibration, setCalibration] = useState(DEFAULT_PRINTER_CALIBRATION);
  const [calibrationLoaded, setCalibrationLoaded] = useState(false);

  // ─── Cheque Logs / History (Firebase-synced) ─────────────────────────────
  const [chequeLogs, setChequeLogs] = useState([]);
  const [logsLoaded, setLogsLoaded] = useState(false);

  // ─── Current Cheque Form ──────────────────────────────────────────────────
  const [chequeData, setChequeData] = useState({
    date: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),
    payee: '',
    amountFigures: '',
    currency: 'JOD',
    amountWords: '',
    useManualWords: false,
    crossingStampId: 'payee_only',
    crossingStampText: 'يصرف للمستفيد الأول',
    customStampText: '',
    chequeNumber: '',
    bankName: 'Arab Bank - البنك العربي',
    signNote: '',
    status: 'printed'
  });

  const [activeFieldId, setActiveFieldId] = useState('payee');
  const [showBgImage, setShowBgImage] = useState(true);

  // ─── FIREBASE LISTENERS (real-time sync) ─────────────────────────────────

  // Templates
  useEffect(() => {
    const unsub = onSnapshot(FB_TEMPLATES, (snap) => {
      if (snap.exists() && snap.data().list) {
        setTemplates(snap.data().list);
      } else {
        // First run: seed Firebase with defaults
        setDoc(FB_TEMPLATES, { list: DEFAULT_TEMPLATES });
      }
      setTemplatesLoaded(true);
    }, (err) => {
      console.error('Templates sync error:', err);
      setTemplatesLoaded(true);
    });
    return () => unsub();
  }, []);

  // Calibration
  useEffect(() => {
    const unsub = onSnapshot(FB_CALIBRATION, (snap) => {
      if (snap.exists() && snap.data().data) {
        setCalibration(snap.data().data);
      } else {
        setDoc(FB_CALIBRATION, { data: DEFAULT_PRINTER_CALIBRATION });
      }
      setCalibrationLoaded(true);
    }, (err) => {
      console.error('Calibration sync error:', err);
      setCalibrationLoaded(true);
    });
    return () => unsub();
  }, []);

  // Cheque Logs
  useEffect(() => {
    const unsub = onSnapshot(FB_LOGS, (snap) => {
      if (snap.exists() && snap.data().list) {
        setChequeLogs(snap.data().list);
      } else {
        setDoc(FB_LOGS, { list: [] });
      }
      setLogsLoaded(true);
    }, (err) => {
      console.error('Logs sync error:', err);
      setLogsLoaded(true);
    });
    return () => unsub();
  }, []);

  // ─── FIREBASE WRITE HELPERS ───────────────────────────────────────────────

  const saveTemplates = useCallback(async (newTemplates) => {
    setSyncStatus('saving');
    try {
      await setDoc(FB_TEMPLATES, { list: newTemplates });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      console.error('Error saving templates:', e);
      setSyncStatus('error');
    }
  }, []);

  const saveCalibration = useCallback(async (newCal) => {
    setSyncStatus('saving');
    try {
      await setDoc(FB_CALIBRATION, { data: newCal });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      console.error('Error saving calibration:', e);
      setSyncStatus('error');
    }
  }, []);

  const saveLogs = useCallback(async (newLogs) => {
    setSyncStatus('saving');
    try {
      await setDoc(FB_LOGS, { list: newLogs });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      console.error('Error saving logs:', e);
      setSyncStatus('error');
    }
  }, []);

  // ─── Auto Tafqeet ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chequeData.useManualWords) {
      const num = parseFloat(chequeData.amountFigures);
      if (!isNaN(num) && num > 0) {
        setChequeData((prev) => ({ ...prev, amountWords: tafqeetArabic(num, prev.currency) }));
      } else {
        setChequeData((prev) => ({ ...prev, amountWords: '' }));
      }
    }
  }, [chequeData.amountFigures, chequeData.currency, chequeData.useManualWords]);

  // ─── Active Template ──────────────────────────────────────────────────────
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleUpdateTemplate = (updatedTemplate) => {
    const newTemplates = templates.map((t) =>
      t.id === updatedTemplate.id ? updatedTemplate : t
    );
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };

  const handleCalibrationChange = (newCal) => {
    setCalibration(newCal);
    saveCalibration(newCal);
  };

  const handleStampChange = (stampId) => {
    const found = CROSSING_STAMP_OPTIONS.find((opt) => opt.id === stampId);
    let stampText = found ? found.label : '';
    if (stampId === 'none') stampText = '';
    if (stampId === 'custom') stampText = chequeData.customStampText || 'ختم مخصص';
    setChequeData((prev) => ({ ...prev, crossingStampId: stampId, crossingStampText: stampText }));
  };

  const handlePrint = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      ...chequeData,
      bankName: activeTemplate.bankName || activeTemplate.name,
      printedAt: new Date().toISOString()
    };
    const newLogs = [newLog, ...chequeLogs];
    setChequeLogs(newLogs);
    saveLogs(newLogs);
    setTimeout(() => window.print(), 150);
  };

  const handleSaveToRegistry = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      ...chequeData,
      bankName: activeTemplate.bankName || activeTemplate.name,
      status: 'saved'
    };
    const newLogs = [newLog, ...chequeLogs];
    setChequeLogs(newLogs);
    saveLogs(newLogs);
  };

  const handleDeleteLog = (id) => {
    const newLogs = chequeLogs.filter((l) => l.id !== id);
    setChequeLogs(newLogs);
    saveLogs(newLogs);
  };

  const handleClearAllLogs = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع سجلات الشيكات؟\nAre you sure you want to clear all cheque registry logs?')) {
      setChequeLogs([]);
      saveLogs([]);
    }
  };

  // ─── Sync status indicator UI ─────────────────────────────────────────────
  const SyncIndicator = () => {
    if (syncStatus === 'saving') return (
      <div className="sync-indicator saving">
        <Loader size={14} className="spin-icon" /> Syncing to Cloud...
      </div>
    );
    if (syncStatus === 'saved') return (
      <div className="sync-indicator saved">
        <CheckCircle2 size={14} /> Synced ✓
      </div>
    );
    if (syncStatus === 'error') return (
      <div className="sync-indicator error">
        <CloudOff size={14} /> Sync Error
      </div>
    );
    return (
      <div className="sync-indicator idle">
        <Cloud size={14} /> Firebase Cloud ☁️
      </div>
    );
  };

  // ─── Loading state (waiting for Firebase first load) ─────────────────────
  const isLoading = !templatesLoaded || !calibrationLoaded || !logsLoaded;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', gap: '16px', color: '#475569'
      }}>
        <Loader size={40} className="spin-icon" style={{ color: '#0284c7' }} />
        <h3 style={{ fontWeight: 700 }}>جاري تحميل بيانات الشيكات من Firebase...</h3>
        <p style={{ fontSize: '0.9rem' }}>Loading cheque data from cloud, please wait.</p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
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
            <p>طباعة الشيكات البنكية بدقة عالية على جميع أنواع الطابعات — البيانات محفوظة على Firebase ☁️</p>
          </div>
        </div>

        <div className="module-top-actions">
          <SyncIndicator />
          <button className="btn btn-secondary" onClick={handleSaveToRegistry}>
            <Save size={16} />
            <span>Save to Registry</span>
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
          <span>Layout Designer (مصمم القالب)</span>
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

      {/* Main Sub-Tab Content */}
      <div className="subtab-content-area">

        {/* SUBTAB 1: CHEQUE EDITOR FORM */}
        {activeSubTab === 'editor' && (
          <div className="editor-tab-layout">
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
                      <option key={t.id} value={t.id}>{t.name}</option>
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

                  {/* Row 2: Crossing Stamp */}
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

                  {/* Row 3: Payee Name */}
                  <div className="form-group">
                    <label className="form-label">
                      اسم المستفيد (Payee — ادفعوا بموجب هذا الشيك لأمر):
                    </label>
                    <input
                      type="text"
                      value={chequeData.payee}
                      onChange={(e) => setChequeData({ ...chequeData, payee: e.target.value })}
                      placeholder="اسم الشركة / الشخص..."
                      className="form-control payee-input"
                      list="customer-suggestions"
                    />
                    <datalist id="customer-suggestions">
                      {customers.map((c) => (
                        <option key={c.id} value={c.companyName} />
                      ))}
                    </datalist>
                  </div>

                  {/* Row 4: Amount & Currency */}
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

                  {/* Row 5: Tafqeet */}
                  <div className="form-group">
                    <div className="label-with-checkbox">
                      <label className="form-label">
                        المبلغ بالحروف (مبلغ وقدره — Tafqeet):
                      </label>
                      <label className="checkbox-inline">
                        <input
                          type="checkbox"
                          checked={chequeData.useManualWords}
                          onChange={(e) =>
                            setChequeData({ ...chequeData, useManualWords: e.target.checked })
                          }
                        />
                        <span>تعديل يدوي</span>
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

                  {/* Optional Note */}
                  <div className="form-group">
                    <label className="form-label">ملاحظة (Note / Sign area — اختياري):</label>
                    <input
                      type="text"
                      value={chequeData.signNote}
                      onChange={(e) => setChequeData({ ...chequeData, signNote: e.target.value })}
                      placeholder="ملاحظة اختيارية..."
                      className="form-control"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Live Preview */}
            <div className="card preview-card">
              <div className="card-header">
                <h3>معاينة مباشرة (Live Preview)</h3>
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
              <h2>إعدادات معايرة الطابعة (Universal Printer Calibration)</h2>
              <p>تعديل الإزاحة بالأفقي والعمودي (ملم) — محفوظ على Firebase ويطبق على جميع الأجهزة</p>
            </div>

            <div className="card-body calibration-body">
              <div className="grid-2-col">
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
                      handleCalibrationChange({ ...calibration, offsetX: parseFloat(e.target.value) })
                    }
                    className="range-slider"
                  />
                  <div className="range-hints">
                    <span>-40 mm (يسار)</span>
                    <span>0 mm</span>
                    <span>+40 mm (يمين)</span>
                  </div>
                </div>

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
                      handleCalibrationChange({ ...calibration, offsetY: parseFloat(e.target.value) })
                    }
                    className="range-slider"
                  />
                  <div className="range-hints">
                    <span>-40 mm (أعلى)</span>
                    <span>0 mm</span>
                    <span>+40 mm (أسفل)</span>
                  </div>
                </div>
              </div>

              <div className="feed-orientation-section">
                <h4>اتجاه تغذية الورق (Printer Paper Tray Orientation):</h4>
                <div className="orientation-grid">
                  <div
                    className={`orientation-card ${calibration.feedOrientation === 'landscape' ? 'active' : ''}`}
                    onClick={() => handleCalibrationChange({ ...calibration, feedOrientation: 'landscape' })}
                  >
                    <div className="icon-box">📄</div>
                    <div className="orient-title">Landscape (تغذية عرضية)</div>
                    <p>تلقيم الشيك بالاتجاه العرضي الأفقي القياسي (16.5 سم)</p>
                  </div>

                  <div
                    className={`orientation-card ${calibration.feedOrientation === 'portrait_center' ? 'active' : ''}`}
                    onClick={() => handleCalibrationChange({ ...calibration, feedOrientation: 'portrait_center' })}
                  >
                    <div className="icon-box">📩</div>
                    <div className="orient-title">Portrait Center (تلقيم طولي)</div>
                    <p>تلقيم الشيك في منتصف صينية ورق الطابعة</p>
                  </div>
                </div>
              </div>

              <div className="calibration-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleCalibrationChange(DEFAULT_PRINTER_CALIBRATION)}
                >
                  <RotateCcw size={16} /> Reset Default Calibration
                </button>
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={16} /> Test Calibration Print
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
            onDeleteLog={handleDeleteLog}
            onClearAllLogs={handleClearAllLogs}
            onLoadChequeToEditor={(item) => {
              setChequeData(item);
              setActiveSubTab('editor');
            }}
          />
        )}
      </div>

      {/* Hidden Print Container */}
      <ChequePrintView
        template={activeTemplate}
        chequeData={chequeData}
        calibration={calibration}
      />
    </div>
  );
}
