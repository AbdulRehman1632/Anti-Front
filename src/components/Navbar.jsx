import React, { useState } from 'react';
import {
  Search,
  Plus,
  PhoneCall,
  ChevronDown,
  ShieldAlert,
  Zap,
  UserCheck,
  Check,
  Building,
  LogOut,
  Key,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCall } from '../context/CallContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export const Navbar = ({
  onOpenNewTask,
  searchQuery,
  setSearchQuery,
  onNavigate,
  onOpenProvisionModal,
}) => {
  const { user, changeStatus, logout, canEditTasks, canManageRoles, canInviteMembers } = useAuth();
  const { activeCall, leaveCall } = useCall();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statuses = [
    { status: 'online', label: 'Online & Available', color: '#10b981' },
    { status: 'away', label: 'Away / In Meeting', color: '#f59e0b' },
    { status: 'offline', label: 'Offline / Do Not Disturb', color: '#64748b' },
  ];

  const statusColor =
    user?.status === 'online' ? '#10b981'
    : user?.status === 'away' ? '#f59e0b'
    : '#64748b';

  return (
    <header className="top-navbar">
      {/* ── Left: Brand ── */}
      <div className="top-navbar-left">
        <div
          className="brand-badge"
          onClick={() => onNavigate('list')}
          title="Devdrip CRM Workspace"
        >
          <div className="brand-icon-wrapper">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.15, fontSize: '1.1875rem' }}>Devdrip CRM</span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Building size={10} /> {user?.organizationName || 'Enterprise Workspace'}
            </span>
          </div>
        </div>

        <div className="search-bar-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search deals, tags, clients (Ctrl+K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Right: Controls ── */}
      <div className="top-navbar-right">
        {/* Active WebRTC Call Banner */}
        {activeCall && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              color: '#fee2e2',
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('calls')}
          >
            <PhoneCall size={14} className="animate-pulse" style={{ color: '#ef4444' }} />
            <span>Call: #{activeCall.channelName}</span>
            <button
              onClick={(e) => { e.stopPropagation(); leaveCall(); }}
              className="btn btn-sm btn-danger"
              style={{ padding: '2px 8px', fontSize: '0.6875rem' }}
            >
              End
            </button>
          </div>
        )}

        {/* Status Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }} />
            <span style={{ textTransform: 'capitalize' }}>{user?.status || 'Online'}</span>
            <ChevronDown size={14} style={{ color: '#94a3b8' }} />
          </div>

          {showStatusMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '200px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: '10px',
                padding: '6px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
              }}
            >
              {statuses.map((s) => (
                <div
                  key={s.status}
                  onClick={() => { changeStatus(s.status, user?.statusMessage || 'Available'); setShowStatusMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    background: user?.status === s.status ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: user?.status === s.status ? 'var(--primary)' : 'var(--text-main)',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                  <span>{s.label}</span>
                  {user?.status === s.status && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accessible Day / Night Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          className="theme-toggle-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: isDark ? '#fbbf24' : '#6366f1',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Account Menu */}
        <div style={{ position: 'relative' }}>
          <div
            className="persona-switcher"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="Account & Settings"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}`}
              alt={user?.name}
              className="persona-avatar"
            />
            <div className="persona-info">
              <span className="persona-name">{user?.name || 'User'}</span>
              <span className={`persona-role-badge role-${user?.role || 'Viewer'}`}>
                {user?.role || 'Viewer'}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: '#94a3b8' }} />
          </div>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
              }}
            >
              {/* User Info Card */}
              <div
                style={{
                  padding: '10px 12px',
                  background: 'rgba(99,102,241,0.08)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid rgba(99,102,241,0.18)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'user')}`}
                    alt={user?.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                      {user?.organizationName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--bg-active)',
                  marginBottom: '6px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <UserCheck size={14} style={{ color: '#6366f1' }} />
                <span>
                  {user?.title || user?.role} &mdash; {user?.department || ''}
                </span>
              </div>

              {/* Provision Credentials (Owner/Admin only) */}
              {(canManageRoles() || canInviteMembers()) && (
                <div
                  onClick={() => { setShowUserMenu(false); onOpenProvisionModal(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#a5b4fc',
                    background: 'rgba(255,255,255,0.04)',
                    marginBottom: '4px',
                  }}
                >
                  <Key size={14} style={{ color: '#6366f1' }} />
                  <span>Provision Employee Credentials</span>
                </div>
              )}

              {/* Theme Switcher in Settings Dropdown */}
              <div
                onClick={() => { toggleTheme(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: isDark ? '#fbbf24' : '#6366f1',
                  background: 'rgba(255,255,255,0.04)',
                  marginBottom: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </div>
                <span style={{ fontSize: '0.6875rem', opacity: 0.7, textTransform: 'uppercase' }}>
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </div>

              {/* Log Out */}
              <div
                onClick={() => { logout(); setShowUserMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#fca5a5',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  marginTop: '4px',
                }}
              >
                <LogOut size={14} />
                <span>Log Out of Workspace</span>
              </div>
            </div>
          )}
        </div>

        {/* Create Deal CTA */}
        {canEditTasks() ? (
          <button className="btn btn-primary" onClick={onOpenNewTask} id="btn-create-task">
            <Plus size={16} />
            <span>Create Deal</span>
          </button>
        ) : (
          <div
            title="Read-only mode active for Viewer role"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#94a3b8',
              background: 'rgba(255,255,255,0.05)',
              padding: '6px 12px',
              borderRadius: '8px',
            }}
          >
            <ShieldAlert size={14} style={{ color: '#10b981' }} />
            <span>Viewer (Read-Only)</span>
          </div>
        )}
      </div>
    </header>
  );
};
