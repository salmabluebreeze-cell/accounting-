import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { Users, Plus, Edit, Trash2, Search, Building2, Phone, MapPin, Briefcase } from 'lucide-react';

export default function CustomerManager() {
  const { customers, saveCustomer, deleteCustomer } = useBilling();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    companyName: '',
    contact: '',
    countryCity: 'Jordan - AMMAN',
    phone: '',
    project: '',
  });

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.project || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contact || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (cust) => {
    setEditingCustomer(cust);
    setFormData({ ...cust });
  };

  const handleCreateClick = () => {
    setEditingCustomer({ isNew: true });
    setFormData({
      id: `c-${Date.now()}`,
      companyName: '',
      contact: '',
      countryCity: 'Jordan - AMMAN',
      phone: '',
      project: '',
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Company Name is required.');
      return;
    }
    saveCustomer(formData);
    setEditingCustomer(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete customer ${name}?`)) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="customers-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Customers & Projects Directory
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Save customer profiles and associate project names for smart auto-filling.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCreateClick}>
          <Plus size={16} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search customers or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Grid of Customer Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {filtered.map((cust) => (
          <div className="card" key={cust.id} style={{ marginBottom: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={18} style={{ color: '#0284c7' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
                    {cust.companyName}
                  </h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {cust.contact || 'No contact specified'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEditClick(cust)}
                >
                  <Edit size={14} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(cust.id, cust.companyName)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Briefcase size={15} style={{ color: '#0284c7' }} />
                <span>
                  <strong>Project:</strong> {cust.project || 'N/A'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <MapPin size={15} style={{ color: '#64748b' }} />
                <span>{cust.countryCity || 'Jordan - AMMAN'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <Phone size={15} style={{ color: '#64748b' }} />
                <span>{cust.phone || 'No phone'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingCustomer && (
        <div className="modal-overlay" onClick={() => setEditingCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#1e3a8a' }}>
              {editingCustomer.isNew ? 'Add New Customer Profile' : 'Edit Customer Profile'}
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                  Company Name:
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                  Contact or Department:
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                  Associated Project Name:
                </label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                  Country - City:
                </label>
                <input
                  type="text"
                  value={formData.countryCity}
                  onChange={(e) => setFormData({ ...formData, countryCity: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                  Phone Number:
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingCustomer(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
