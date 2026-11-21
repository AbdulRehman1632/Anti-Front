import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  Filter,
  Plus,
  Clock,
  Columns3,
  Layers,
  Check,
  X as XIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { CustomFieldsModal } from './CustomFieldsModal.jsx';
import { LifecycleStagesModal } from './LifecycleStagesModal.jsx';

export const ListView = ({
  tasks = [],
  onSelectTask,
  onOpenNewTask,
  onUpdateTaskStage,
  onDeleteTask,
  searchQuery = '',
  selectedCategory = 'all',
  customFields = [],
  onFieldsChanged,
  lifecycleStages = [],
  onStagesChanged,
}) => {
  const { canEditTasks, canDeleteTasks } = useAuth();
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCustomFieldsModalOpen, setIsCustomFieldsModalOpen] = useState(false);
  const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);

  // Active custom columns that should be displayed in the table
  const tableFields = customFields.filter((f) => f.showInTable !== false);

  const filtered = tasks.filter((t) => {
    const taskCat = (t.listCategory || 'General').trim().toLowerCase();
    const selCat = (selectedCategory || 'all').trim().toLowerCase();
    const matchesCategory = selCat === 'all' || taskCat === selCat;

    const matchesPriority =
      priorityFilter === 'ALL' || (t.priority && t.priority.toUpperCase() === priorityFilter);

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
      (t.assignee?.name && t.assignee.name.toLowerCase().includes(q));

    return matchesCategory && matchesPriority && matchesSearch;
  });

  const formatExactTimestamp = (dateVal) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';

    // Format date & exact time: e.g. "Nov 10, 2026, 3:15 PM"
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderCustomValue = (field, value) => {
    if (value === undefined || value === null || value === '') {
      return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    }

    if (field.type === 'boolean') {
      const isTrue = value === true || value === 'true';
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            background: isTrue ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
            color: isTrue ? '#34d399' : '#f87171',
            border: isTrue ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          {isTrue ? <Check size={11} strokeWidth={3} /> : <XIcon size={11} strokeWidth={3} />}
          {isTrue ? 'True' : 'False'}
        </span>
      );
    }

    if (field.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) return <span>{String(value)}</span>;
      return (
        <span style={{ fontWeight: 600, color: '#38bdf8' }}>
          {num.toLocaleString()}
        </span>
      );
    }

    if (field.type === 'textarea') {
      const str = String(value);
      const truncated = str.length > 45 ? str.substring(0, 45) + '...' : str;
      return (
        <span
          title={str}
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
            display: 'inline-block',
            maxWidth: '180px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {truncated}
        </span>
      );
    }

    // Default text
    return <span style={{ color: 'var(--text-main)' }}>{String(value)}</span>;
  };

  const exportCSV = () => {
    const customHeaders = tableFields.map((f) => f.label);
    const headers = [
      'Title',
      'Category',
      'Stage Status',
      'Priority',
      'Assignee',
      'Created Date & Time',
      'DueDate',
      ...customHeaders,
    ];

    const rows = filtered.map((t) => {
      const customVals = tableFields.map((f) => {
        const val = t.customFields?.[f.key];
        return `"${(val === undefined || val === null ? '' : String(val)).replace(/"/g, '""')}"`;
      });

      return [
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.listCategory || 'General'}"`,
        `"${t.status || 'TO DO'}"`,
        `"${t.priority || 'MEDIUM'}"`,
        `"${t.assignee?.name || 'Unassigned'}"`,
        `"${t.createdAt ? new Date(t.createdAt).toISOString() : ''}"`,
        `"${t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : ''}"`,
        ...customVals,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Devdrip_CRM_${selectedCategory === 'all' ? 'All' : selectedCategory}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isIsolated = selectedCategory && selectedCategory !== 'all';

  // Resolved list of lifecycle stages (fallback if DB empty)
  const resolvedStages =
    lifecycleStages && lifecycleStages.length > 0
      ? lifecycleStages
      : [
          { _id: 's1', key: 'TO DO', label: 'TO DO', color: '#94a3b8' },
          { _id: 's2', key: 'IN PROGRESS', label: 'IN PROGRESS', color: '#38bdf8' },
          { _id: 's3', key: 'REVIEW', label: 'REVIEW', color: '#fbbf24' },
          { _id: 's4', key: 'COMPLETED', label: 'COMPLETED', color: '#10b981' },
        ];

  const getStageColor = (statusKey) => {
    const match = resolvedStages.find(
      (s) => s.key?.toUpperCase() === statusKey?.toUpperCase()
    );
    return match?.color || '#94a3b8';
  };

  return (
    <div>
      {/* Header and Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {isIsolated ? `${selectedCategory} Records` : 'Deals & Records Table'}
            </h1>
            {isIsolated && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🏷️ Isolated Entity: {selectedCategory}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: 0 }}>
            {isIsolated
              ? `Strictly isolated dataset for "${selectedCategory}" • ${filtered.length} active record${filtered.length === 1 ? '' : 's'}`
              : `Comprehensive data ledger for ${filtered.length} entries with automatic timestamps`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Priority filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              style={{ width: '130px', padding: '6px 10px', fontSize: '0.8125rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Manage Columns Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCustomFieldsModalOpen(true)}
            title="Add or configure custom dynamic columns"
          >
            <Columns3 size={14} />
            <span>Custom Columns ({tableFields.length})</span>
          </button>

          {/* Manage Stages Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsStagesModalOpen(true)}
            title="Manage custom client lifecycle stages"
          >
            <Layers size={14} />
            <span>Lifecycle Stages</span>
          </button>

          {/* Export CSV */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportCSV}
            title="Export current filtered view to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {canEditTasks() && onOpenNewTask && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenNewTask}
              title={`Create new deal in ${isIsolated ? selectedCategory : 'active category'}`}
            >
              <Plus size={14} />
              <span>{isIsolated ? `+ Add ${selectedCategory}` : '+ Add Record'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Records Table matching user reference */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-medium)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                <th style={{ padding: '14px 20px' }}>Deal / Task Title</th>
                <th style={{ padding: '14px 16px' }}>Category</th>
                <th style={{ padding: '14px 16px' }}>Stage Status</th>
                <th style={{ padding: '14px 16px' }}>Priority</th>
                <th style={{ padding: '14px 16px' }}>Checklist</th>
                <th style={{ padding: '14px 16px' }}>Assignee</th>
                <th style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>Created (Timestamp)</span>
                  </div>
                </th>
                <th style={{ padding: '14px 16px' }}>Due Date</th>

                {/* Dynamically Injected Custom Columns */}
                {tableFields.map((field) => (
                  <th key={field._id} style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{field.label}</span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          background: 'rgba(255,255,255,0.08)',
                          color: 'var(--text-muted)',
                          fontWeight: 700,
                        }}
                      >
                        {field.type}
                      </span>
                    </div>
                  </th>
                ))}

                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8 + tableFields.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '2rem' }}>📂</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {isIsolated
                          ? `No records found in entity "${selectedCategory}"`
                          : 'No matching records found'}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
                        {isIsolated
                          ? `This tab is strictly isolated to "${selectedCategory}". Click below to add a deal assigned to this entity.`
                          : 'Try adjusting your search filters or create a new deal to populate this ledger.'}
                      </p>
                      {canEditTasks() && onOpenNewTask && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={onOpenNewTask}
                          style={{ marginTop: '10px' }}
                        >
                          <Plus size={14} />
                          <span>{isIsolated ? `Add First ${selectedCategory} Record` : 'Create New Deal'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const completed = (t.subtasks || []).filter((s) => s.completed).length;
                  const total = (t.subtasks || []).length;
                  const currentStageColor = getStageColor(t.status);

                  return (
                    <tr
                      key={t._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      className="table-row-hoverable"
                      onClick={() => onSelectTask(t)}
                    >
                      {/* Deal / Task Title */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '2px' }}>
                          {t.title}
                        </div>
                        {t.tags && t.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {t.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="task-tag" style={{ fontSize: '0.625rem' }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className="category-tag">{t.listCategory || 'General'}</span>
                      </td>

                      {/* Stage Status */}
                      <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                        {canEditTasks() ? (
                          <select
                            className="form-select"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              minWidth: '130px',
                              background: `${currentStageColor}20`,
                              borderColor: `${currentStageColor}50`,
                              color: '#f8fafc',
                              fontWeight: 700,
                              borderRadius: '6px',
                            }}
                            value={t.status || 'TO DO'}
                            onChange={(e) => onUpdateTaskStage(t._id, e.target.value)}
                          >
                            {resolvedStages.map((st) => (
                              <option key={st._id || st.key} value={st.key} style={{ background: '#0f172a', color: '#f8fafc' }}>
                                {st.label || st.key}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: `${currentStageColor}20`,
                              color: currentStageColor,
                            }}
                          >
                            {t.status}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`priority-badge priority-${t.priority || 'MEDIUM'}`}>
                          {t.priority || 'MEDIUM'}
                        </span>
                      </td>

                      {/* Checklist */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {total > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2
                              size={13}
                              style={{ color: completed === total ? '#10b981' : '#6366f1' }}
                            />
                            {completed}/{total}
                          </span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td style={{ padding: '14px 16px' }}>
                        {t.assignee ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                              src={
                                t.assignee.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.assignee.name}`
                              }
                              alt=""
                              className="task-assignee-avatar"
                            />
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                              {t.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>

                      {/* Automatic Timestamp: Exact Creation Date & Time */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={12} style={{ color: '#818cf8', flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {formatExactTimestamp(t.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {t.dueDate ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} />
                            {new Date(t.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Custom Dynamic Columns Cells */}
                      {tableFields.map((field) => (
                        <td key={field._id} style={{ padding: '14px 16px' }}>
                          {renderCustomValue(field, t.customFields?.[field.key])}
                        </td>
                      ))}

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => onSelectTask(t)}
                            title="View / Edit details"
                          >
                            <Edit3 size={13} />
                          </button>

                          {canDeleteTasks() && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${t.title}"?`)) {
                                  onDeleteTask(t._id);
                                }
                              }}
                              title="Delete record (Admin/Owner only)"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals for Custom Columns & Lifecycle Stages */}
      <CustomFieldsModal
        isOpen={isCustomFieldsModalOpen}
        onClose={() => setIsCustomFieldsModalOpen(false)}
        customFields={customFields}
        onFieldsChanged={onFieldsChanged}
      />

      <LifecycleStagesModal
        isOpen={isStagesModalOpen}
        onClose={() => setIsStagesModalOpen(false)}
        stages={lifecycleStages}
        onStagesChanged={onStagesChanged}
      />
    </div>
  );
};
