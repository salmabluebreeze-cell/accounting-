import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { Share2, Check, Copy, Users, X, Info } from 'lucide-react';

export default function SyncModal({ onClose }) {
  const { roomId, setRoomId, peerCount } = useBilling();
  const [inputRoom, setInputRoom] = useState(roomId);
  const [copied, setCopied] = useState(false);

  const handleSaveRoom = (e) => {
    e.preventDefault();
    if (inputRoom.trim()) {
      setRoomId(inputRoom.trim());
      alert(`Connected to Room: ${inputRoom.trim()}`);
      onClose();
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay no-print" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Share2 style={{ color: '#0284c7' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Real-Time Multi-User Collaboration</h3>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
            Share this room code or link with your 2 teammates. Any edits made by you or them to Invoices, Proforma Invoices, Quotations, or Customer data will update <strong>live in real-time</strong> on everyone's screen.
          </p>

          <div
            style={{
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              padding: '14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users style={{ color: '#0369a1' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.95rem' }}>
                  Current Active Room Status
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0284c7' }}>
                  {peerCount} active user{peerCount > 1 ? 's' : ''} connected
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Link' : 'Copy Invite Link'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveRoom}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px' }}>
              Collaboration Room ID:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                placeholder="e.g. BLUE-BREEZE-TEAM-ROOM"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
              <button type="submit" className="btn btn-primary">
                Switch Room
              </button>
            </div>
          </form>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: '10px' }}>
          <Info size={18} style={{ flexShrink: 0, color: '#3b82f6' }} />
          <span>
            <strong>Cross-Tab & P2P Sync Active:</strong> Edits sync automatically across tabs and devices connected to this exact Room ID. No manual refresh needed.
          </span>
        </div>
      </div>
    </div>
  );
}
