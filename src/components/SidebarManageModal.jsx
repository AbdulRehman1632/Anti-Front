import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Folder,
  Briefcase,
  User,
  Users,
  Tag,
  Layers,
  Star,
  Target,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Check,
  LayoutDashboard,
  TableProperties,
  BarChart3,
  MessageSquare,
  Video,
  CreditCard,
  Flame,
  Zap,
  Award,
  Bookmark,
  Compass,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Search,
} from 'lucide-react';
import { api } from '../services/api.js';

export const AVAILABLE_ICONS = [
  { name: 'Folder', Icon: Folder },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'User', Icon: User },
  { name: 'Users', Icon: Users },
  { name: 'Layers', Icon: Layers },
  { name: 'Tag', Icon: Tag },
  { name: 'Star', Icon: Star },
  { name: 'Target', Icon: Target },
  { name: 'Shield', Icon: Shield },
  { name: 'CreditCard', Icon: CreditCard },
  { name: 'Flame', Icon: Flame },
  { name: 'Zap', Icon: Zap },
  { name: 'Award', Icon: Award },
  { name: 'Bookmark', Icon: Bookmark },
  { name: 'Compass', Icon: Compass },
  { name: 'FileText', Icon: FileText },
  { name: 'CheckCircle', Icon: CheckCircle },
  { name: 'LayoutDashboard', Icon: LayoutDashboard },
  { name: 'TableProperties', Icon: TableProperties },
  { name: 'BarChart3', Icon: BarChart3 },
  { name: 'MessageSquare', Icon: MessageSquare },
  { name: 'Video', Icon: Video },
];

const ROLES_LIST = [
  {
    role: 'Owner',
    title: 'Executive & Workspace Authority',
    badgeClass: 'role-Owner',
    color: '#f43f5e',
    description: 'Workspace owner with full oversight',
    locked: true, // Owner always has access
  },
  {
    role: 'Admin',
    title: 'Operations Director & Team Manager',
    badgeClass: 'role-Admin',
    color: '#a855f7',
    description: 'Manages team operations and assignments',
  },
  {
    role: 'Editor',
    title: 'Account Executive & Deal Contributor',
    badgeClass: 'role-Editor',
    color: '#3b82f6',
    description: 'Day-to-day pipeline and deals contributor',
  },
  {
    role: 'Viewer',
    title: 'Compliance Auditor & Observer',
    badgeClass: 'role-Viewer',
    color: '#10b981',
    description: 'Read-only access for compliance and audit',
  },
];

/**
 * Modal to Add or Edit a Section in the Sidebar
 */
export const SectionModal = ({ isOpen, onClose, onSave, section = null }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
    } else {
      setTitle('');
    }
    setError('');
  }, [section, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a section title.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({ title: title.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save section.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>
            {section ? 'Edit Section Title' : 'Create Custom Section'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8125rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Section Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. VIP Clients, Regional Accounts, Pipelines"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
            <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              This creates a group heading in your left sidebar navigation.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : section ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modal to Add or Edit a Tab in the Sidebar
 */
export const TabModal = ({
  isOpen,
  onClose,
  onSave,
  sections = [],
  defaultSectionId = '',
  tab = null,
}) => {
  const [label, setLabel] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [type, setType] = useState('category'); // 'category' | 'view'
  const [categoryKey, setCategoryKey] = useState('');
  const [viewTarget, setViewTarget] = useState('list');
  const [icon, setIcon] = useState('Folder');
  const [badge, setBadge] = useState('');
  const [accessType, setAccessType] = useState('everyone');
  const [allowedRoles, setAllowedRoles] = useState(['Owner', 'Admin', 'Editor', 'Viewer']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab) {
      setLabel(tab.label || '');
      setSectionId(tab.sectionId || defaultSectionId || (sections[0]?._id || ''));
      setType(tab.type || 'category');
      setCategoryKey(tab.categoryKey || tab.label || '');
      setViewTarget(tab.viewTarget === 'kanban' ? 'list' : (tab.viewTarget || 'list'));
      setIcon(tab.icon || 'Folder');
      setBadge(tab.badge || '');
      setAccessType(tab.accessType || 'everyone');
      setAllowedRoles(Array.isArray(tab.allowedRoles) && tab.allowedRoles.length > 0 ? tab.allowedRoles : ['Owner', 'Admin', 'Editor', 'Viewer']);
    } else {
      setLabel('');
      setSectionId(defaultSectionId || (sections[0]?._id || ''));
      setType('category');
      setCategoryKey('');
      setViewTarget('list');
      setIcon('Folder');
      setBadge('');
      setAccessType('everyone');
      setAllowedRoles(['Owner', 'Admin', 'Editor', 'Viewer']);
    }
    setError('');
  }, [tab, defaultSectionId, sections, isOpen]);

  if (!isOpen) return null;

  const handleRoleToggle = (role) => {
    if (role === 'Owner') return; // Owner cannot be unselected
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please provide a tab name.');
      return;
    }
    if (!sectionId) {
      setError('Please select a target section.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const resolvedCategory = (categoryKey && categoryKey.trim()) ? categoryKey.trim() : label.trim();
      const payload = {
        sectionId,
        label: label.trim(),
        type,
        categoryKey: resolvedCategory,
        viewTarget: type === 'view' ? viewTarget : 'list',
        icon,
        badge: badge.trim(),
        accessType,
        allowedRoles: accessType === 'restricted' ? Array.from(new Set(['Owner', ...allowedRoles])) : ['Owner', 'Admin', 'Editor', 'Viewer'],
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save tab.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>
            {tab ? 'Edit Navigation Tab' : 'Add Custom Navigation Tab'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8125rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Target Section */}
          <div className="form-group">
            <label className="form-label">Parent Section *</label>
            <select
              className="form-input"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              required
            >
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Label */}
          <div className="form-group">
            <label className="form-label">Tab Label / Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Enterprise Deals, EMEA Renewals, Strategic Accounts"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!categoryKey || categoryKey === label) {
                  setCategoryKey(e.target.value);
                }
              }}
              required
              autoFocus
            />
          </div>

          {/* Tab Type Switcher */}
          <div className="form-group">
            <label className="form-label">Tab Action Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setType('category')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: type === 'category' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: type === 'category' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: type === 'category' ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 700, color: type === 'category' ? '#a5b4fc' : '#f8fafc' }}>
                  Portfolio / Category Filter
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Filters entity records in table ledger
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('view')}
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: type === 'view' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: type === 'view' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: type === 'view' ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 700, color: type === 'view' ? '#a5b4fc' : '#f8fafc' }}>
                  Workspace View Link
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Navigates to CRM view
                </div>
              </button>
            </div>
          </div>

          {/* If View: Target selector */}
          {type === 'view' && (
            <div className="form-group">
              <label className="form-label">Target View Layout</label>
              <select
                className="form-input"
                value={viewTarget}
                onChange={(e) => setViewTarget(e.target.value)}
              >
                <option value="list">Deals & Records (Table Ledger Layout)</option>
                <option value="analytics">ARR & Analytics</option>
                <option value="chat">Team Discussion Channels</option>
                <option value="calls">Video Conferences & Calls</option>
                <option value="team">Team Members & RBAC</option>
              </select>
              <span style={{ fontSize: '0.6875rem', color: '#6366f1', marginTop: '4px', display: 'block' }}>
                {viewTarget === 'list'
                  ? `💡 View Layout Wrapper: Opens the Table layout strictly isolated for "${label || 'this tab'}" records, without duplicating the general deals ledger.`
                  : `🚀 Navigation Shortcut: Directly switches to the ${viewTarget} tool layout.`}
              </span>
            </div>
          )}

          {/* Category Match Key */}
          <div className="form-group">
            <label className="form-label">
              {type === 'view' ? 'Entity Identifier (Optional)' : 'Category Match Key *'}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={label ? `Default: ${label}` : 'Matches deal category (e.g. Individual)'}
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
            />
            <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Deals under this tab will be saved and isolated under "{categoryKey || label || 'this entity'}".
            </span>
          </div>

          {/* Badge (optional) */}
          <div className="form-group">
            <label className="form-label">Badge Tag (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. VIP, Q4, NEW"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              maxLength={10}
            />
          </div>

          {/* Access Control Permission Mode */}
          <div className="form-group">
            <label className="form-label">Tab Access Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setAccessType('everyone')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: accessType === 'everyone' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: accessType === 'everyone' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: accessType === 'everyone' ? '#6ee7b7' : '#94a3b8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Unlock size={14} />
                <span>All Members</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('restricted')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: accessType === 'restricted' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: accessType === 'restricted' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: accessType === 'restricted' ? '#a5b4fc' : '#94a3b8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Lock size={14} />
                <span>Restricted Roles</span>
              </button>
            </div>

            {accessType === 'restricted' && (
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  Select Roles Granted Access:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {ROLES_LIST.map((r) => {
                    const isChecked = allowedRoles.includes(r.role);
                    return (
                      <label
                        key={r.role}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          color: '#f8fafc',
                          cursor: r.locked ? 'default' : 'pointer',
                          opacity: r.locked ? 0.8 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={r.locked}
                          onChange={() => handleRoleToggle(r.role)}
                        />
                        <span className={`persona-role-badge ${r.badgeClass}`} style={{ fontSize: '0.625rem' }}>
                          {r.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Icon Selector Grid */}
          <div className="form-group">
            <label className="form-label">Choose Tab Icon</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '6px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {AVAILABLE_ICONS.map(({ name, Icon: IconComponent }) => {
                const isSelected = icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    title={name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #6366f1' : '1px solid transparent',
                      background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#a5b4fc' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={18} />
                    <span style={{ fontSize: '0.5625rem', marginTop: '3px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : tab ? 'Update Tab' : 'Add Tab to Sidebar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Dedicated Tab Permissions Modal for Granular Role & User Access Management
 */
export const TabPermissionsModal = ({ isOpen, onClose, tab = null }) => {
  const [accessType, setAccessType] = useState('everyone');
  const [allowedRoles, setAllowedRoles] = useState(['Owner', 'Admin', 'Editor', 'Viewer']);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch workspace users list on open
  useEffect(() => {
    if (!isOpen) return;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await api.getUsers();
        if (res.success && Array.isArray(res.users)) {
          setUsersList(res.users);
        }
      } catch (err) {
        console.error('Failed to load users for permission assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isOpen]);

  // Sync tab data when tab changes
  useEffect(() => {
    if (tab) {
      setAccessType(tab.accessType || 'everyone');
      setAllowedRoles(
        Array.isArray(tab.allowedRoles) && tab.allowedRoles.length > 0
          ? tab.allowedRoles
          : ['Owner', 'Admin', 'Editor', 'Viewer']
      );

      // Extract allowed user IDs (whether populated objects or string IDs)
      const userIds = Array.isArray(tab.allowedUsers)
        ? tab.allowedUsers.map((u) => (u?._id ? u._id.toString() : u.toString()))
        : [];
      setAllowedUsers(userIds);
    }
    setError('');
    setSuccessMsg('');
    setSearchQuery('');
  }, [tab, isOpen]);

  if (!isOpen || !tab) return null;

  const handleToggleRole = (role) => {
    if (role === 'Owner') return; // Owner always required
    setAllowedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleToggleUser = (userId) => {
    setAllowedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllRoles = () => {
    setAllowedRoles(['Owner', 'Admin', 'Editor', 'Viewer']);
  };

  const handleManagementOnlyRoles = () => {
    setAllowedRoles(['Owner', 'Admin']);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        accessType,
        allowedRoles: accessType === 'restricted' ? Array.from(new Set(['Owner', ...allowedRoles])) : ['Owner', 'Admin', 'Editor', 'Viewer'],
        allowedUsers: accessType === 'restricted' ? allowedUsers : [],
      };

      const res = await api.updateSidebarTabPermissions(tab._id, payload);
      if (res.success) {
        setSuccessMsg('Permissions updated and synced successfully!');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Failed to update tab permissions.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered users for individual access assignment
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: accessType === 'restricted' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: accessType === 'restricted' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accessType === 'restricted' ? '#f87171' : '#34d399',
              }}
            >
              {accessType === 'restricted' ? <Lock size={18} /> : <Unlock size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>
                Tab Access & Permissions
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Tab: <strong style={{ color: '#f8fafc' }}>{tab.label}</strong> {tab.isSystem ? '(System Tab)' : '(Custom Tab)'}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '20px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8125rem', marginBottom: '14px' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#6ee7b7', fontSize: '0.8125rem', marginBottom: '14px' }}>
              <CheckCircle size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Access Policy Selector */}
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label" style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              Who can view and use this tab?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Option 1: Everyone */}
              <div
                onClick={() => setAccessType('everyone')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: accessType === 'everyone' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  background: accessType === 'everyone' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Unlock size={16} color={accessType === 'everyone' ? '#34d399' : '#94a3b8'} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: accessType === 'everyone' ? '#6ee7b7' : '#f8fafc' }}>
                    All Members
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                  Open to all workspace roles and authenticated team members.
                </p>
              </div>

              {/* Option 2: Restricted */}
              <div
                onClick={() => setAccessType('restricted')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: accessType === 'restricted' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: accessType === 'restricted' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={16} color={accessType === 'restricted' ? '#a5b4fc' : '#94a3b8'} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: accessType === 'restricted' ? '#c7d2fe' : '#f8fafc' }}>
                    Restricted Access
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                  Grant access only to specific roles and designated individuals.
                </p>
              </div>
            </div>
          </div>

          {/* Granular Controls when Restricted */}
          {accessType === 'restricted' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 1. Role-based Access Section */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={15} style={{ color: '#a5b4fc' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                      Allowed Roles
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={handleManagementOnlyRoles}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                    >
                      Owner & Admin Only
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllRoles}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                    >
                      All Roles
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ROLES_LIST.map((r) => {
                    const isGranted = allowedRoles.includes(r.role);
                    return (
                      <div
                        key={r.role}
                        onClick={() => !r.locked && handleToggleRole(r.role)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: isGranted ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                          border: isGranted ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: r.locked ? 'default' : 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="checkbox"
                            checked={isGranted}
                            disabled={r.locked}
                            onChange={() => handleToggleRole(r.role)}
                            style={{ cursor: r.locked ? 'default' : 'pointer' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className={`persona-role-badge ${r.badgeClass}`} style={{ fontSize: '0.6875rem' }}>
                                {r.role}
                              </span>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                                {r.title}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{r.description}</span>
                          </div>
                        </div>

                        {r.locked && (
                          <span style={{ fontSize: '0.6875rem', color: '#f43f5e', fontWeight: 600 }}>
                            Always Granted
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Specific Individual Users Assignment */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                      Specific User Assignment (Individual Overrides)
                    </span>
                  </div>
                  <span className="nav-badge" style={{ color: '#38bdf8' }}>
                    {allowedUsers.length} assigned
                  </span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.6875rem', color: '#94a3b8' }}>
                  Explicitly grant access to specific members regardless of their role.
                </p>

                {/* User Search Bar */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search members by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px', fontSize: '0.75rem', padding: '6px 10px 6px 32px' }}
                  />
                </div>

                {/* Users List with Checkbox */}
                <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {filteredUsers.map((u) => {
                    const isUserAssigned = allowedUsers.includes(u._id);
                    const isRoleAlreadyCovered = allowedRoles.includes(u.role);

                    return (
                      <div
                        key={u._id}
                        onClick={() => handleToggleUser(u._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: isUserAssigned ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                          border: isUserAssigned ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.04)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={isUserAssigned}
                            onChange={() => handleToggleUser(u._id)}
                          />
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                          />
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                              {u.name}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: '#64748b', marginLeft: '6px' }}>
                              {u.email}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isRoleAlreadyCovered && (
                            <span style={{ fontSize: '0.625rem', color: '#a5b4fc', fontStyle: 'italic' }}>
                              (via {u.role})
                            </span>
                          )}
                          <span className={`persona-role-badge role-${u.role}`} style={{ fontSize: '0.5625rem' }}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '0.75rem' }}>
                      {loading ? 'Loading team members...' : 'No matching members found.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Access Policy Summary Card */}
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={18} style={{ color: accessType === 'everyone' ? '#10b981' : '#6366f1', flexShrink: 0 }} />
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              {accessType === 'everyone' ? (
                <span>All authenticated users in this organization can view and use this tab.</span>
              ) : (
                <span>
                  Visible to roles:{' '}
                  <strong style={{ color: '#a5b4fc' }}>{allowedRoles.join(', ')}</strong>
                  {allowedUsers.length > 0 && (
                    <span> + <strong>{allowedUsers.length}</strong> specific member(s)</span>
                  )}
                  . Other users will not see this tab in their navigation.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSavePermissions} disabled={saving}>
            {saving ? 'Saving Permissions...' : 'Save Permissions & Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};
