import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  CheckCircle2,
  AlertCircle,
  Table,
  BarChart3,
} from 'lucide-react';
import { api } from '../services/api.js';

export const FIELD_TYPES = [
  {
    type: 'text',
    label: 'Text',
    badge: 'Single Line',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.3)',
    icon: Type,
    description: 'Short text values, names, codes, external IDs',
  },
  {
    type: 'textarea',
    label: 'Textarea',
    badge: 'Multi-line',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.15)',
    border: 'rgba(167, 139, 250, 0.3)',
    icon: AlignLeft,
    description: 'Detailed client notes, executive summaries, multi-line feedback',
  },
  {
    type: 'number',
    label: 'Number',
    badge: 'Numeric / Metric',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.15)',
    border: 'rgba(52, 211, 153, 0.3)',
    icon: Hash,
    description: 'Contract values, scores, rates, quantities, currency',
  },
  {
    type: 'boolean',
    label: 'Boolean',
    badge: 'True / False Toggle',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.3)',
    icon: ToggleLeft,
    description: 'Yes/No switches, verification flags, VIP indicators',
  },
];

export const CustomFieldsModal = ({
  isOpen,
  onClose,
  customFields = [],
  onFieldsChanged,
}) => {
  const [selectedType, setSelectedType] = useState('text');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [showInTable, setShowInTable] = useState(true);
  const [showInCharts, setShowInCharts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please provide a column / field label.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createCustomField({
        label: label.trim(),
        type: selectedType,
        description: description.trim(),
        showInTable,
        showInCharts,
      });

      if (res.success) {
        setLabel('');
        setDescription('');
        setSelectedType('text');
        if (onFieldsChanged) {
          await onFieldsChanged();
        }
      } else {
        setError(res.message || 'Failed to create custom field');
      }
    } catch (err) {
      setError(err.message || 'Error creating custom field');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, fieldLabel) => {
    if (!window.confirm(`Are you sure you want to delete column "${fieldLabel}"?`)) {
      return;
    }

    try {
      const res = await api.deleteCustomField(id);
      if (res.success && onFieldsChanged) {
        await onFieldsChanged();
      }
    } catch (err) {
      alert(`Failed to delete custom field: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '100%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1875rem', fontWeight: 800 }}>
              Dynamic Custom Columns & Schema Fields
            </span>
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

        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.8125rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form to Add New Custom Column */}
          <form
            onSubmit={handleCreate}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={16} style={{ color: '#6366f1' }} />
              <span>Add New Custom Column</span>
            </div>

            {/* Input Type Selector */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Select Field Type *
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {FIELD_TYPES.map((ft) => {
                  const Icon = ft.icon;
                  const isSelected = selectedType === ft.type;
                  return (
                    <button
                      key={ft.type}
                      type="button"
                      onClick={() => setSelectedType(ft.type)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${ft.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? ft.bg : 'rgba(255, 255, 255, 0.03)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={15} style={{ color: ft.color }} />
                          <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc' }}>
                            {ft.label}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={14} style={{ color: ft.color }} />}
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                        {ft.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field Label */}
            <div className="form-group">
              <label className="form-label">Column / Field Label *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Contract Value ($), KYC Verified, Strategic Notes"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>

            {/* Field Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief purpose or tooltip for this field"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Target Options */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={showInTable}
                  onChange={(e) => setShowInTable(e.target.checked)}
                />
                <Table size={13} style={{ color: '#38bdf8' }} />
                <span>Display in Record Tables</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={showInCharts}
                  onChange={(e) => setShowInCharts(e.target.checked)}
                />
                <BarChart3 size={13} style={{ color: '#a78bfa' }} />
                <span>Include in Charts / Analytics</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !label.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              <span>{loading ? 'Adding Column...' : 'Add Custom Column'}</span>
            </button>
          </form>

          {/* Existing Columns List */}
          <div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '10px',
              }}
            >
              Active Custom Columns ({customFields.length})
            </div>

            {customFields.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                }}
              >
                No custom columns added yet. Use the form above to add your first column!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customFields.map((field) => {
                  const ftConfig = FIELD_TYPES.find((t) => t.type === field.type) || FIELD_TYPES[0];
                  const Icon = ftConfig.icon;

                  return (
                    <div
                      key={field._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: ftConfig.bg,
                            color: ftConfig.color,
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>
                              {field.label}
                            </span>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: ftConfig.bg,
                                color: ftConfig.color,
                                border: `1px solid ${ftConfig.border}`,
                              }}
                            >
                              {ftConfig.label}
                            </span>
                          </div>
                          {field.description && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {field.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {field.showInTable && (
                          <span title="Visible in Record Table" style={{ color: '#38bdf8' }}>
                            <Table size={13} />
                          </span>
                        )}
                        {field.showInCharts && (
                          <span title="Included in Charts" style={{ color: '#a78bfa' }}>
                            <BarChart3 size={13} />
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(field._id, field.label)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px',
                          }}
                          title="Delete Column"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

