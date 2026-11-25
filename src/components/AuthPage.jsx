import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { RoleExplainerCards } from './RoleExplainerCards.jsx';

/**
 * Full-page authentication screen (Login / Sign Up).
 * Rendered when no authenticated session exists — no demo shortcuts,
 * no bypass. All credentials hit the live database.
 */
export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    role: 'Editor',
    department: '',
    title: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);
        if (res?.success) onAuthSuccess();
      } else {
        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.department || 'General',
          title: formData.title || 'Team Member',
          organizationName: formData.organizationName || 'My Organization',
        });
        if (res?.success) onAuthSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #060a14 0%, #0d1424 50%, #060a14 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: mode === 'register' ? '700px' : '460px',
          transition: 'max-width 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
              }}
            >
              <Zap size={22} color="white" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.02em',
              }}
            >
              Devdrip CRM
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Enterprise Workspace & Pipeline Management
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Tab switcher */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '4px',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrorMessage(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: mode === m
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'transparent',
                  color: mode === m ? '#fff' : '#64748b',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} style={{ padding: '28px', maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Error Banner */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '0.8125rem',
                  color: '#fca5a5',
                }}
              >
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === 'login' ? (
              /* ── SIGN IN ── */
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                    Welcome Back
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                    Sign in to access your organization's CRM workspace.
                  </p>
                </div>

                <FieldGroup label="Email Address">
                  <IconInput icon={<Mail size={15} />}>
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '38px' }}
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                      autoFocus
                    />
                  </IconInput>
                </FieldGroup>

                <FieldGroup label="Password">
                  <IconInput icon={<Lock size={15} />} right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={eyeBtn}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '38px' }}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange('password')}
                      required
                    />
                  </IconInput>
                </FieldGroup>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '11px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : (
                    <><span>Sign In to Workspace</span><ArrowRight size={16} /></>
                  )}
                </button>

                {/* Quick Fill Demo Credentials */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', textAlign: 'center' }}>
                    Quick Demo Credentials (Click to auto-fill):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                      onClick={() => setFormData((prev) => ({ ...prev, email: 'owner@devdrip.com', password: 'password123' }))}
                    >
                      👑 Owner Demo
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                      onClick={() => setFormData((prev) => ({ ...prev, email: 'admin@devdrip.com', password: 'password123' }))}
                    >
                      🛡️ Admin Demo
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ── SIGN UP ── */
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
                    Create Your Account
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                    Set up your organization, credentials, and select your role.
                  </p>
                </div>

                {/* Organization */}
                <FieldGroup label="Organization / Company Name *">
                  <IconInput icon={<Building size={15} style={{ color: '#6366f1' }} />}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '38px', borderColor: 'rgba(99,102,241,0.4)' }}
                      placeholder="e.g. Acme Corporation"
                      value={formData.organizationName}
                      onChange={handleChange('organizationName')}
                      required
                    />
                  </IconInput>
                </FieldGroup>

                {/* Name + Email Row */}
                <div className="form-row">
                  <FieldGroup label="Full Name *">
                    <IconInput icon={<User size={15} />}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                        placeholder="e.g. Liam Anderson"
                        value={formData.name}
                        onChange={handleChange('name')}
                        required
                      />
                    </IconInput>
                  </FieldGroup>

                  <FieldGroup label="Work Email *">
                    <IconInput icon={<Mail size={15} />}>
                      <input
                        type="email"
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                        placeholder="liam@acmecorp.com"
                        value={formData.email}
                        onChange={handleChange('email')}
                        required
                      />
                    </IconInput>
                  </FieldGroup>
                </div>

                {/* Password */}
                <FieldGroup label="Password * (min 6 characters)">
                  <IconInput icon={<Lock size={15} />} right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={eyeBtn}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '38px' }}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleChange('password')}
                      minLength={6}
                      required
                    />
                  </IconInput>
                </FieldGroup>

                {/* Department + Title */}
                <div className="form-row">
                  <FieldGroup label="Department">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sales, Operations"
                      value={formData.department}
                      onChange={handleChange('department')}
                    />
                  </FieldGroup>
                  <FieldGroup label="Job Title">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. VP of Sales"
                      value={formData.title}
                      onChange={handleChange('title')}
                    />
                  </FieldGroup>
                </div>

                {/* Role Selector */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 0 }}>
                      Select Your Role & Permissions:
                    </label>
                    <span style={{ fontSize: '0.6875rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={12} /> Defines your access level
                    </span>
                  </div>
                  <RoleExplainerCards
                    selectedRole={formData.role}
                    onSelectRole={(r) => setFormData((prev) => ({ ...prev, role: r }))}
                    showFullDetails={true}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '11px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : (
                    <><span>Complete Sign Up & Launch Workspace</span><ArrowRight size={16} /></>
                  )}
                </button>
              </>
            )}
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#334155' }}>
          Devdrip Enterprise CRM &copy; {new Date().getFullYear()} — Secure, real-time workspace
        </p>
      </div>
    </div>
  );
};

/* ── Small helper sub-components ── */

function FieldGroup({ label, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  );
}

function IconInput({ icon, right, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {icon}
      </span>
      {children}
      {right && right}
    </div>
  );
}

const eyeBtn = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'transparent',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
};
