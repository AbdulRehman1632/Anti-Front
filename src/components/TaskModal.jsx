import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Send,
  Calendar,
  Tag,
  Paperclip,
  Trash2,
  UserCheck,
  Clock,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const TaskModal = ({
  task, // null if creating new
  isOpen,
  onClose,
  onSaveTask,
  onDeleteTask,
  users = [],
  categories = [],
  selectedCategory = 'all',
  customFields = [],
  lifecycleStages = [],
}) => {
  const { user, canEditTasks, canDeleteTasks } = useAuth();

  const defaultCategory =
    selectedCategory && selectedCategory !== 'all'
      ? selectedCategory
      : categories[0]?.key || 'General';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TO DO',
    priority: 'MEDIUM',
    listCategory: defaultCategory,
    assignee: users[0]?._id || '',
    dueDate: '',
    tags: '',
  });

  const [customFieldValues, setCustomFieldValues] = useState({});
  const [customFieldErrors, setCustomFieldErrors] = useState({});
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const activeCategory =
      selectedCategory && selectedCategory !== 'all'
        ? selectedCategory
        : categories[0]?.key || 'General';

    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TO DO',
        priority: task.priority || 'MEDIUM',
        listCategory: task.listCategory || activeCategory,
        assignee: task.assignee?._id || task.assignee || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        tags: (task.tags || []).join(', '),
      });
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
      setCustomFieldValues(task.customFields ? { ...task.customFields } : {});
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TO DO',
        priority: 'MEDIUM',
        listCategory: activeCategory,
        assignee: user?._id || users[0]?._id || '',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        tags: 'CRM, Enterprise',
      });
      setSubtasks([]);
      setComments([]);
      // Initialize boolean defaults or blank
      const initialCF = {};
      customFields.forEach((cf) => {
        if (cf.type === 'boolean') {
          initialCF[cf.key] = false;
        } else {
          initialCF[cf.key] = '';
        }
      });
      setCustomFieldValues(initialCF);
    }
    setCustomFieldErrors({});
  }, [task, isOpen, users, user, selectedCategory, categories, customFields]);

  if (!isOpen) return null;

  // Resolved list of lifecycle stages
  const resolvedStages =
    lifecycleStages && lifecycleStages.length > 0
      ? lifecycleStages
      : [
          { _id: 's1', key: 'TO DO', label: 'TO DO' },
          { _id: 's2', key: 'IN PROGRESS', label: 'IN PROGRESS' },
          { _id: 's3', key: 'REVIEW', label: 'REVIEW' },
          { _id: 's4', key: 'COMPLETED', label: 'COMPLETED / WON' },
        ];

  const handleCustomFieldChange = (key, val) => {
    setCustomFieldValues((prev) => ({ ...prev, [key]: val }));
    if (customFieldErrors[key]) {
      setCustomFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Validate custom dynamic fields according to their selected field types
    const errors = {};
    const processedCF = { ...customFieldValues };

    customFields.forEach((field) => {
      const val = processedCF[field.key];

      if (field.required && (val === undefined || val === null || val === '')) {
        errors[field.key] = `${field.label} is required`;
      }

      if (field.type === 'number' && val !== '' && val !== undefined && val !== null) {
        const num = Number(val);
        if (isNaN(num)) {
          errors[field.key] = `${field.label} must be a valid number`;
        } else {
          processedCF[field.key] = num;
        }
      }

      if (field.type === 'boolean') {
        processedCF[field.key] = Boolean(val);
      }
    });

    if (Object.keys(errors).length > 0) {
      setCustomFieldErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      customFields: processedCF,
    };

    onSaveTask(task?._id, payload);
    onClose();
  };

  const handleToggleSubtask = async (subtaskId) => {
    if (!task?._id || !canEditTasks()) return;
    try {
      const res = await api.toggleSubtask(task._id, subtaskId);
      if (res.success && res.task) {
        setSubtasks(res.task.subtasks || []);
      }
    } catch (err) {
      console.error('Toggle subtask error:', err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task?._id || !canEditTasks()) return;
    try {
      const res = await api.addSubtask(task._id, newSubtaskTitle.trim());
      if (res.success && res.task) {
        setSubtasks(res.task.subtasks || []);
        setNewSubtaskTitle('');
      }
    } catch (err) {
      console.error('Add subtask error:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task?._id) return;
    try {
      const res = await api.addComment(task._id, newCommentText.trim());
      if (res.success && res.task) {
        setComments(res.task.comments || []);
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>
              {task ? 'Edit CRM Record / Deal' : 'Create New CRM Deal'}
            </span>
            {task && (
              <span className={`priority-badge priority-${formData.priority}`}>
                {formData.priority}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Automatic Timestamps Notice / Indicator */}
          {task?.createdAt ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '8px',
                color: '#a5b4fc',
                fontSize: '0.75rem',
                marginBottom: '14px',
              }}
            >
              <Clock size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
              <div>
                <strong>Creation Timestamp:</strong>{' '}
                {new Date(task.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}{' '}
                <em>(Automatically recorded upon creation)</em>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                color: '#7dd3fc',
                fontSize: '0.75rem',
                marginBottom: '14px',
              }}
            >
              <Clock size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <strong>Automatic Timestamp:</strong> Exact creation date and time will be automatically recorded upon creation.
              </div>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Deal / Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Finalize Enterprise SaaS SLA terms with Apex Corp"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={!canEditTasks()}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description & Deliverables</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Key notes, agreement terms, client requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!canEditTasks()}
            />
          </div>

          {/* Category & Status */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Portfolio / Category</label>
              <select
                className="form-select"
                value={formData.listCategory}
                onChange={(e) => setFormData({ ...formData, listCategory: e.target.value })}
                disabled={!canEditTasks()}
              >
                {categories.filter((c) => c.key !== 'all').map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label || c.key}
                  </option>
                ))}
                {!categories.some((c) => c.key === formData.listCategory) && formData.listCategory && (
                  <option value={formData.listCategory}>{formData.listCategory}</option>
                )}
                {categories.length === 0 && (
                  <>
                    <option value="General">General</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Accounts">Accounts</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lifecycle Stage</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={!canEditTasks()}
              >
                {resolvedStages.map((st) => (
                  <option key={st._id || st.key} value={st.key}>
                    {st.label || st.key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Assignee */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={!canEditTasks()}
              >
                <option value="URGENT">Urgent (Immediate attention)</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Account Owner</label>
              <select
                className="form-select"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                disabled={!canEditTasks()}
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date & Tags */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                disabled={!canEditTasks()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enterprise, SLA, Legal"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                disabled={!canEditTasks()}
              />
            </div>
          </div>

          {/* Dynamic Custom Columns / Schema Fields */}
          {customFields.length > 0 && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '16px',
                marginTop: '12px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                }}
              >
                <Sliders size={15} style={{ color: '#818cf8' }} />
                <span>Custom Schema Fields ({customFields.length})</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {customFields.map((field) => {
                  const val = customFieldValues[field.key];
                  const hasError = customFieldErrors[field.key];

                  return (
                    <div
                      key={field._id}
                      className="form-group"
                      style={{
                        margin: 0,
                        gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1',
                      }}
                    >
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {field.label} {field.required && '*'}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'capitalize' }}>
                          {field.type}
                        </span>
                      </label>

                      {/* Render according to selected field type */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          className="form-input"
                          placeholder={field.description || `Enter ${field.label}...`}
                          value={val !== undefined && val !== null ? String(val) : ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          disabled={!canEditTasks()}
                          style={{ borderColor: hasError ? '#ef4444' : undefined }}
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          className="form-textarea"
                          rows={3}
                          placeholder={field.description || `Enter ${field.label}...`}
                          value={val !== undefined && val !== null ? String(val) : ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          disabled={!canEditTasks()}
                          style={{ borderColor: hasError ? '#ef4444' : undefined }}
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          placeholder={field.description || '0'}
                          value={val !== undefined && val !== null ? val : ''}
                          onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                          disabled={!canEditTasks()}
                          style={{ borderColor: hasError ? '#ef4444' : undefined }}
                        />
                      )}

                      {field.type === 'boolean' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleCustomFieldChange(field.key, true)}
                            disabled={!canEditTasks()}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: val === true ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                              background: val === true ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                              color: val === true ? '#34d399' : '#94a3b8',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: canEditTasks() ? 'pointer' : 'default',
                            }}
                          >
                            ✓ True / Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomFieldChange(field.key, false)}
                            disabled={!canEditTasks()}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: val === false ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                              background: val === false ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                              color: val === false ? '#f87171' : '#94a3b8',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: canEditTasks() ? 'pointer' : 'default',
                            }}
                          >
                            ✗ False / No
                          </button>
                        </div>
                      )}

                      {hasError && (
                        <span style={{ fontSize: '0.6875rem', color: '#f87171', marginTop: '3px', display: 'block' }}>
                          {hasError}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtasks Checklist Section (only for existing tasks) */}
          {task && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '16px',
                marginTop: '4px',
              }}
            >
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Checklist Deliverables ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {subtasks.map((st) => (
                  <div
                    key={st._id}
                    onClick={() => handleToggleSubtask(st._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      cursor: canEditTasks() ? 'pointer' : 'default',
                    }}
                  >
                    {st.completed ? (
                      <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <Circle size={16} style={{ color: '#64748b' }} />
                    )}
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: st.completed ? '#94a3b8' : '#f8fafc',
                        textDecoration: st.completed ? 'line-through' : 'none',
                      }}
                    >
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              {canEditTasks() && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                    placeholder="Add deliverable step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleAddSubtask}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comments Thread Section (only for existing tasks) */}
          {task && (
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '16px',
                marginTop: '4px',
              }}
            >
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Activity & Comments ({comments.length})
              </label>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  marginBottom: '10px',
                }}
              >
                {comments.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>No comments yet.</div>
                ) : (
                  comments.map((cm) => (
                    <div
                      key={cm._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a5b4fc' }}>
                          {cm.user?.name || 'Team Member'}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                          {cm.createdAt ? new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{cm.text}</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                  placeholder="Post comment / update..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleAddComment}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="modal-footer" style={{ margin: '16px -24px -24px', padding: '16px 24px' }}>
            {task && canDeleteTasks() && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  if (confirm(`Delete "${task.title}"?`)) {
                    onDeleteTask(task._id);
                    onClose();
                  }
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            {canEditTasks() && (
              <button type="submit" className="btn btn-primary">
                {task ? 'Save Changes' : 'Create Record'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
