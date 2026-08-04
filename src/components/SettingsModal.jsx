import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { Building, CreditCard, Save } from 'lucide-react';

export default function SettingsModal() {
  const { companyInfo, setCompanyInfo } = useBilling();
  const [form, setForm] = useState({ ...companyInfo });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setCompanyInfo(form);
    alert('Company & Bank Information successfully updated!');
  };

  return (
    <div className="settings-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
          Company & Bank Account Settings
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
          Configure company branding, address, and bank account information printed on Proforma Invoices and Invoices.
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Company Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building style={{ color: '#1e3a8a' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
              Company Details (BLUE BREEZE)
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Company Name (English):
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Company Name (Arabic):
              </label>
              <input
                type="text"
                value={form.nameArabic}
                onChange={(e) => handleChange('nameArabic', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Physical Address:
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Phone Line 1:
              </label>
              <input
                type="text"
                value={form.phone1}
                onChange={(e) => handleChange('phone1', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Phone Line 2 (Footer):
              </label>
              <input
                type="text"
                value={form.phone2}
                onChange={(e) => handleChange('phone2', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Website:
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Default Sales Tax Rate (e.g. 0.16 = 16%):
              </label>
              <input
                type="number"
                step="0.01"
                value={form.taxRate}
                onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CreditCard style={{ color: '#0284c7' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
              Bank Account Information
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Account Name:
              </label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Bank Name:
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Branch Name:
              </label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => handleChange('branch', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                Account Number:
              </label>
              <input
                type="text"
                value={form.accountNo}
                onChange={(e) => handleChange('accountNo', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                IBAN Number:
              </label>
              <input
                type="text"
                value={form.iban}
                onChange={(e) => handleChange('iban', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                SWIFT Code:
              </label>
              <input
                type="text"
                value={form.swift}
                onChange={(e) => handleChange('swift', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                CliQ Alias:
              </label>
              <input
                type="text"
                value={form.cliq}
                onChange={(e) => handleChange('cliq', e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0284c7' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
            <Save size={18} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
