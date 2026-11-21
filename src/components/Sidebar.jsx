import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TableProperties,
  BarChart3,
  MessageSquare,
  Video,
  Users,
  Folder,
  Briefcase,
  User,
  ListFilter,
  CreditCard,
  Layers,
  Star,
  Target,
  Shield,
  Tag,
  Flame,
  Zap,
  Award,
  Bookmark,
  Compass,
  FileText,
  CheckCircle,
  Database,
  Radio,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCall } from '../context/CallContext.jsx';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { SectionModal, TabModal, TabPermissionsModal } from './SidebarManageModal.jsx';

// Icon Resolver map
const ICON_MAP = {
  LayoutDashboard,
  TableProperties,
  BarChart3,
  MessageSquare,
  Video,
  Users,
  Folder,
  Briefcase,
  User,
  ListFilter,
  CreditCard,
  Layers,
  Star,
  Target,
  Shield,
  Tag,
  Flame,
  Zap,
  Award,
  Bookmark,
  Compass,
  FileText,
  CheckCircle,
  Database,
  Radio,
};

export const Sidebar = ({
  currentView,
  setCurrentView,
  selectedCategory,
  setSelectedCategory,
  taskCountsByCategory = {},
  healthInfo,
  onCategoriesUpdated,
}) => {
  const { user } = useAuth();
  const { activeCall, activeCallsMap } = useCall();
  const activeCallCount = Object.keys(activeCallsMap || {}).length;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState('');

  // Granular Access Control Modal state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [permissionTargetTab, setPermissionTargetTab] = useState(null);

  // Can manage tabs & permissions: Owner or Admin
  const canManage = user?.role === 'Owner' || user?.role === 'Admin';

  const fetchSidebar = async () => {
    try {
      const res = await api.getSidebar();
      if (res.success && Array.isArray(res.sections)) {
        // Sanitize sections: completely remove any legacy Kanban board tabs
        const cleanedSections = res.sections.map((sec) => ({
          ...sec,
          tabs: (sec.tabs || [])
            .filter(
              (t) =>
                t.key !== 'kanban' &&
                t.badge?.toLowerCase() !== 'kanban' &&
                t.label?.toLowerCase() !== 'pipeline board'
            )
            .map((t) => (t.viewTarget === 'kanban' ? { ...t, viewTarget: 'list' } : t)),
        }));

        setSections(cleanedSections);

        // Notify parent of available category keys for TaskModal options
        if (onCategoriesUpdated) {
          const categoryTabs = [];
          cleanedSections.forEach((s) => {
            (s.tabs || []).forEach((t) => {
              const entityKey =
                (t.categoryKey && t.categoryKey.trim()) || (!t.isSystem ? t.label.trim() : '');
              if (entityKey && entityKey !== 'all') {
                if (!categoryTabs.some((c) => c.key.toLowerCase() === entityKey.toLowerCase())) {
                  categoryTabs.push({ key: entityKey, label: t.label || entityKey });
                }
              }
            });
          });
          onCategoriesUpdated(categoryTabs);
        }
      }
    } catch (err) {
      console.error('Failed to load dynamic sidebar navigation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebar();
  }, []);

  // Real-time synchronization: listen for sidebar:updated event
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onSidebarUpdated = () => {
      fetchSidebar();
    };

    socket.on('sidebar:updated', onSidebarUpdated);
    return () => {
      socket.off('sidebar:updated', onSidebarUpdated);
    };
  }, []);

  // Section Handlers
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (section, e) => {
    e.stopPropagation();
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (data) => {
    if (editingSection) {
      await api.updateSidebarSection(editingSection._id, data);
    } else {
      await api.createSidebarSection(data);
    }
    await fetchSidebar();
  };

  const handleDeleteSection = async (section, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete section "${section.title}" and all its tabs?`)) {
      return;
    }
    try {
      await api.deleteSidebarSection(section._id);
      await fetchSidebar();
    } catch (err) {
      alert(`Error deleting section: ${err.message}`);
    }
  };

  // Tab Handlers
  const handleOpenAddTab = (secId, e) => {
    if (e) e.stopPropagation();
    setEditingTab(null);
    setTargetSectionId(secId || (sections[0]?._id || ''));
    setIsTabModalOpen(true);
  };

  const handleOpenEditTab = (tab, e) => {
    e.stopPropagation();
    setEditingTab(tab);
    setTargetSectionId(tab.sectionId);
    setIsTabModalOpen(true);
  };

  const handleSaveTab = async (data) => {
    if (editingTab) {
      await api.updateSidebarTab(editingTab._id, data);
    } else {
      await api.createSidebarTab(data);
    }
    await fetchSidebar();
  };

  const handleDeleteTab = async (tab, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete tab "${tab.label}"?`)) {
      return;
    }
    try {
      await api.deleteSidebarTab(tab._id);
      await fetchSidebar();
    } catch (err) {
      alert(`Error deleting tab: ${err.message}`);
    }
  };

  // Granular Access Control Handler
  const handleOpenPermissions = (tab, e) => {
    if (e) e.stopPropagation();
    setPermissionTargetTab(tab);
    setIsPermissionsModalOpen(true);
  };

  // Click Handler for a tab
  const handleTabClick = (tab) => {
    // 1. Core System Tabs
    if (tab.isSystem) {
      if (tab.key === 'list' || tab.key === 'kanban') {
        setSelectedCategory('all');
        setCurrentView('list');
      } else if (tab.key === 'all') {
        setSelectedCategory('all');
        setCurrentView('list');
      } else {
        // System workspace tools: analytics, chat, calls, team
        setCurrentView(tab.viewTarget || tab.key);
      }
      return;
    }

    // 2. Custom Tabs (e.g. Individual, AI Client Work, custom section tabs)
    const rawTarget = tab.viewTarget === 'kanban' ? 'list' : (tab.viewTarget || (tab.type === 'view' ? 'list' : 'list'));
    const targetView = rawTarget === 'kanban' ? 'list' : rawTarget;
    const entityKey = (tab.categoryKey && tab.categoryKey.trim()) || tab.label.trim();

    if (targetView === 'list' || tab.type === 'category') {
      // Act as an independent view layout wrapper or entity category view!
      // Strictly isolate to this entity's records instead of duplicating general deals:
      setSelectedCategory(entityKey);
      setCurrentView('list');
    } else {
      // Direct navigation shortcut to a specific workspace tool (e.g. analytics, chat, calls, team)
      setCurrentView(targetView);
    }
  };

  // Determine if a tab is currently active
  const isTabActive = (tab) => {
    // 1. Core System Tabs
    if (tab.isSystem) {
      if (tab.key === 'list' || tab.key === 'kanban') {
        return currentView === 'list' && selectedCategory === 'all';
      }
      if (tab.key === 'all') {
        return currentView === 'list' && selectedCategory === 'all';
      }
      return currentView === (tab.viewTarget || tab.key);
    }

    // 2. Custom Tabs
    const rawTarget = tab.viewTarget === 'kanban' ? 'list' : (tab.viewTarget || (tab.type === 'view' ? 'list' : 'list'));
    const targetView = rawTarget === 'kanban' ? 'list' : rawTarget;
    const entityKey = (tab.categoryKey && tab.categoryKey.trim()) || tab.label.trim();

    if (targetView === 'list' || tab.type === 'category') {
      return (
        currentView === 'list' &&
        selectedCategory !== 'all' &&
        selectedCategory?.trim().toLowerCase() === entityKey.toLowerCase()
      );
    }

    // Custom tool shortcuts (analytics, chat, calls, team)
    return currentView === targetView;
  };

  return (
    <aside className="sidebar">
      {/* Dynamic Sections from Database */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {sections.map((section) => (
          <div key={section._id} className="sidebar-section" style={{ marginBottom: '16px' }}>
            {/* Section Header with CRUD controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px 4px 4px',
                marginBottom: '4px',
              }}
            >
              <span className="sidebar-heading" style={{ margin: 0, letterSpacing: '0.06em' }}>
                {section.title}
              </span>

              {canManage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* Add Tab to this section */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenAddTab(section._id, e)}
                    title={`Add new tab to "${section.title}"`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Plus size={13} />
                  </button>

                  {/* Edit section name */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenEditSection(section, e)}
                    title="Rename section"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Edit2 size={11} />
                  </button>

                  {/* Delete custom section */}
                  {!section.isSystem && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSection(section, e)}
                      title="Delete custom section"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Section Tabs */}
            {(section.tabs || []).map((tab) => {
              const IconComponent = ICON_MAP[tab.icon] || Folder;
              const active = isTabActive(tab);
              const isRestricted = tab.accessType === 'restricted';

              // Calculate count badge
              let badgeText = tab.badge || '';
              const entityKey = (tab.categoryKey && tab.categoryKey.trim()) || tab.label.trim();
              if (tab.type === 'category' || !tab.isSystem) {
                if (tab.key === 'all' || entityKey === 'all') {
                  const totalCount = Object.values(taskCountsByCategory).reduce((a, b) => a + b, 0);
                  badgeText = totalCount > 0 ? totalCount : 'All';
                } else if (taskCountsByCategory[entityKey] !== undefined) {
                  badgeText = taskCountsByCategory[entityKey];
                }
              } else if (tab.viewTarget === 'calls') {
                if (activeCall || activeCallCount > 0) badgeText = 'LIVE';
              }

              return (
                <div
                  key={tab._id}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                  style={{
                    position: 'relative',
                    group: 'tab-item',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="nav-item-left" style={{ minWidth: 0 }}>
                    <IconComponent size={16} style={{ color: active ? '#a5b4fc' : '#64748b', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tab.label}
                    </span>
                    {/* Visual Restricted Indicator for Admin/Owner */}
                    {canManage && isRestricted && (
                      <span
                        title={`Restricted Access: ${(tab.allowedRoles || []).join(', ')}${
                          tab.allowedUsers?.length ? ` + ${tab.allowedUsers.length} user(s)` : ''
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: '#f59e0b',
                          marginLeft: '4px',
                        }}
                      >
                        <Lock size={11} />
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {badgeText !== '' && (
                      <span className={`nav-badge ${badgeText === 'LIVE' ? 'live' : ''}`}>
                        {badgeText}
                      </span>
                    )}

                    {/* Owner/Admin Tab Controls */}
                    {canManage && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          marginLeft: '2px',
                        }}
                      >
                        {/* Manage Granular Access Control Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenPermissions(tab, e)}
                          title={
                            isRestricted
                              ? `Restricted Access: ${(tab.allowedRoles || []).join(', ')} — Click to manage permissions`
                              : 'Manage Tab Permissions (Roles & Users)'
                          }
                          style={{
                            background: isRestricted ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                            border: isRestricted ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
                            color: isRestricted ? '#fbbf24' : '#64748b',
                            cursor: 'pointer',
                            padding: '2px 3px',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Shield size={11} />
                        </button>

                        {/* Edit Tab */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditTab(tab, e)}
                          title="Edit tab"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '2px',
                            borderRadius: '3px',
                          }}
                        >
                          <Edit2 size={11} />
                        </button>

                        {/* Delete Tab (Custom only) */}
                        {!tab.isSystem && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTab(tab, e)}
                            title="Delete tab"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#f87171',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '3px',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty state for custom section */}
            {(!section.tabs || section.tabs.length === 0) && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  fontStyle: 'italic',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>No tabs in this section</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={(e) => handleOpenAddTab(section._id, e)}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                  >
                    + Add Tab
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Owner/Admin Action: Create New Section */}
        {canManage && (
          <div style={{ padding: '8px 4px 16px' }}>
            <button
              type="button"
              onClick={handleOpenAddSection}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed rgba(99, 102, 241, 0.4)',
                background: 'rgba(99, 102, 241, 0.06)',
                color: '#a5b4fc',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FolderPlus size={14} />
              <span>+ Add Custom Section</span>
            </button>
          </div>
        )}
      </div>

      {/* Backend & Socket Persistence Status Pill */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={13} style={{ color: '#10b981' }} className="animate-pulse" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
              Real-Time Sync
            </span>
          </div>
          <span style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 700 }}>
            CONNECTED
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.6875rem',
            color: '#94a3b8',
          }}
        >
          <Database size={11} />
          <span>{healthInfo?.storageMode || 'MongoDB Replica'}</span>
        </div>
      </div>

      {/* Modals for CRUD & Granular Access Control */}
      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleSaveSection}
        section={editingSection}
      />

      <TabModal
        isOpen={isTabModalOpen}
        onClose={() => setIsTabModalOpen(false)}
        onSave={handleSaveTab}
        sections={sections}
        defaultSectionId={targetSectionId}
        tab={editingTab}
      />

      <TabPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setPermissionTargetTab(null);
          fetchSidebar();
        }}
        tab={permissionTargetTab}
      />
    </aside>
  );
};
