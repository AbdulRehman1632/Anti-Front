import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield } from 'lucide-react';
import { api } from '../services/api.js';
import { RoleExplainerCards } from './RoleExplainerCards.jsx';

export const InviteModal = ({ isOpen, onClose, onMemberInvited }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Editor',
    department: 'Sales & CRM',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    try {
      setLoading(true);
      const res = await api.inviteMember(formData);
      if (res.success) {
        onMemberInvited();
        onClose();
      }
    } catch (err) {
      alert(`Invite error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Invite Team Member</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jordan Hayes"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="jordan@devdrip.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sales, Operations, Compliance"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          {/* Interactive Role Selector with Capabilities */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc' }}>
                Role Level & Capabilities:
              </label>
              <span style={{ fontSize: '0.6875rem', color: '#a5b4fc' }}>
                Defines what this user can do
              </span>
            </div>

            <RoleExplainerCards
              selectedRole={formData.role}
              onSelectRole={(r) => setFormData({ ...formData, role: r })}
              showFullDetails={true}
            />
          </div>

          <div className="modal-footer" style={{ margin: '10px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Dispatching...' : 'Dispatch Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
