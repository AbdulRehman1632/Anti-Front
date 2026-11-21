import React, { useState } from 'react';
import {
  X,
  Key,
  Mail,
  User,
  Building,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { RoleExplainerCards } from './RoleExplainerCards.jsx';

export const ProvisionCredentialsModal = ({ isOpen, onClose, onCredentialsCreated }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'DevDrip@' + Math.floor(1000 + Math.random() * 9000),
    organizationName: user?.organizationName || 'Devdrip CRM',
    role: 'Editor',
    department: 'Sales & CRM',
    title: 'Account Specialist',
  });

  const [loading, setLoading] = useState(false);
  const [createdSummary, setCreatedSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.createCredentials(formData);
      if (res.success) {
        setCreatedSummary({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          organizationName: formData.organizationName,
        });
        if (onCredentialsCreated) onCredentialsCreated();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to provision credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdSummary) return;
    const text = `Devdrip CRM — Employee Credentials:\nOrganization: ${createdSummary.organizationName}\nName: ${createdSummary.name}\nEmail: ${createdSummary.email}\nTemporary Password: ${createdSummary.password}\nRole: ${createdSummary.role}\nLogin URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setCreatedSummary(null);
    setFormData({
      name: '',
      email: '',
      password: 'DevDrip@' + Math.floor(1000 + Math.random() * 9000),
      organizationName: user?.organizationName || 'Devdrip CRM',
      role: 'Editor',
      department: 'Sales & CRM',
      title: 'Account Specialist',
    });
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleReset}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>
              IT Credential Provisioning & Role Setup
            </span>
          </div>
          <button
            onClick={handleReset}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {createdSummary ? (
          /* --- SUCCESS SCREEN --- */
          <div className="modal-body" style={{ textAlign: 'center', padding: '30px 24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Check size={28} strokeWidth={3} />
            </div>

            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '6px' }}>
              Credentials Ready for {createdSummary.name}!
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '24px' }}>
              The account has been created in <strong>{createdSummary.organizationName}</strong> with{' '}
              <span className={`persona-role-badge role-${createdSummary.role}`}>
                {createdSummary.role}
              </span>{' '}
              authority.
            </p>

            {/* Credential summary card */}
            <div
              style={{
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#94a3b8' }}>Organization:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{createdSummary.organizationName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#94a3b8' }}>Login Email:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  {createdSummary.email}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#94a3b8' }}>Password:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  {createdSummary.password}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#94a3b8' }}>Role Level:</span>
                <span className={`persona-role-badge role-${createdSummary.role}`}>
                  {createdSummary.role}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCopyCredentials}
                style={{ padding: '10px 20px' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials for Employee'}</span>
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* --- PROVISIONING FORM --- */
          <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            {errorMessage && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.8125rem',
                  color: '#fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldAlert size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div style={{ marginBottom: '2px' }}>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Generate official enterprise credentials for onboarding employees into{' '}
                <strong>{formData.organizationName}</strong>.
              </p>
            </div>

            {/* Name & Email Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Employee Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rachel Adams"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rachel@devdrip.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password & Organization */}
            <div className="form-row">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Initial Password *</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#a5b4fc',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    🎲 Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
            </div>

            {/* Department & Job Title */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sales, Legal, Product"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Deal Strategist"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            {/* ROLE EXPLAINER & SELECTOR (WHAT OWNER, ADMIN, EDITOR, VIEWER DO) */}
            <div className="form-group" style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc' }}>
                  Assign Operational Role & Capabilities:
                </label>
                <span style={{ fontSize: '0.6875rem', color: '#10b981' }}>
                  Role defines exact permissions
                </span>
              </div>

              <RoleExplainerCards
                selectedRole={formData.role}
                onSelectRole={(r) => setFormData({ ...formData, role: r })}
                showFullDetails={true}
              />
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ margin: '10px -24px -24px', padding: '16px 24px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleReset}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Provisioning...' : 'Provision Credentials & Grant Role'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
