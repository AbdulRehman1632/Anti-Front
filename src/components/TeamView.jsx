import React from 'react';
import {
  UserPlus,
  ShieldCheck,
  Check,
  X,
  Briefcase,
  Mail,
  Building,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const TeamView = ({
  users = [],
  onRefreshUsers,
  onOpenInviteModal,
  onOpenProvisionModal,
}) => {
  const { user: currentUser, canManageRoles, canInviteMembers } = useAuth();

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      const res = await api.updateUserRole(targetUserId, newRole);
      if (res.success) {
        onRefreshUsers();
      }
    } catch (err) {
      alert(`Role change failed: ${err.message}`);
    }
  };

  const matrix = [
    { capability: 'Workspace & Billing Management', owner: true, admin: false, editor: false, viewer: false },
    { capability: 'User Role Elevation & Demotion', owner: true, admin: false, editor: false, viewer: false },
    { capability: 'Invite New Team Members', owner: true, admin: true, editor: false, viewer: false },
    { capability: 'Create & Delete Channels', owner: true, admin: true, editor: false, viewer: false },
    { capability: 'Create & Edit CRM Pipeline Tasks', owner: true, admin: true, editor: true, viewer: false },
    { capability: 'Delete CRM Records / Deals', owner: true, admin: true, editor: false, viewer: false },
    { capability: 'Post Comments & Emoji Reactions', owner: true, admin: true, editor: true, viewer: false },
    { capability: 'Host WebRTC Video Conferences', owner: true, admin: true, editor: false, viewer: false },
    { capability: 'Join WebRTC Video Conferences', owner: true, admin: true, editor: true, viewer: 'Listen Only' },
    { capability: 'Read-Only Audit & Export Records', owner: true, admin: true, editor: true, viewer: true },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Team Directory & RBAC Matrix</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Enterprise Role-Based Access Control and capability permissions for {users.length} members
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canManageRoles() && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenProvisionModal}
              title="Generate new employee credentials with role breakdown"
            >
              <Key size={14} />
              <span>Provision IT Credentials</span>
            </button>
          )}

          {canInviteMembers() && (
            <button className="btn btn-secondary btn-sm" onClick={onOpenInviteModal}>
              <UserPlus size={14} />
              <span>Invite via Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {users.map((u) => {
          const isMe = u._id === currentUser?._id;

          return (
            <div
              key={u._id}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: isMe ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '18px',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        alt=""
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          border: '2px solid #0f172a',
                          background:
                            u.status === 'online' ? '#10b981' : u.status === 'away' ? '#f59e0b' : '#64748b',
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
                          {u.name}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '0.625rem', color: '#a5b4fc', fontWeight: 600 }}>
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{u.title || 'Member'}</div>
                    </div>
                  </div>

                  <span className={`persona-role-badge role-${u.role}`}>{u.role}</span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} style={{ color: '#64748b' }} />
                    <span>{u.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={13} style={{ color: '#64748b' }} />
                    <span>{u.department || 'Operations'}</span>
                  </div>
                </div>
              </div>

              {/* Role Change Dropdown (guarded: Owner only) */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                {canManageRoles() && !isMe ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                      Change Role:
                    </span>
                    <select
                      className="form-select"
                      style={{ width: '110px', padding: '4px 8px', fontSize: '0.75rem' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {u.statusMessage || 'Available'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive RBAC Capability Matrix */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={18} style={{ color: '#6366f1' }} />
          <h2 style={{ fontSize: '1.1875rem', fontWeight: 700 }}>RBAC Permission Matrix</h2>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'rgba(11, 16, 27, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: '#94a3b8' }}>Capability</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#fda4af' }}>Owner</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#d8b4fe' }}>Admin</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#93c5fd' }}>Editor</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#6ee7b7' }}>Viewer</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: '#f8fafc' }}>
                    {row.capability}
                  </td>

                  {['owner', 'admin', 'editor', 'viewer'].map((roleKey) => {
                    const val = row[roleKey];
                    return (
                      <td key={roleKey} style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {val === true ? (
                          <Check size={16} style={{ color: '#10b981', margin: '0 auto' }} />
                        ) : typeof val === 'string' ? (
                          <span style={{ fontSize: '0.6875rem', color: '#fbbf24', fontWeight: 600 }}>
                            {val}
                          </span>
                        ) : (
                          <X size={16} style={{ color: '#64748b', margin: '0 auto', opacity: 0.4 }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
