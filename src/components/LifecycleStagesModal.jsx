import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Lock,
  Layers,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';

const PRESET_COLORS = [
  '#94a3b8', // Gray
  '#38bdf8', // Sky
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#fbbf24', // Amber
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export const LifecycleStagesModal = ({
  isOpen,
  onClose,
  stages = [],
  onStagesChanged,
}) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please provide a stage label.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createLifecycleStage({
        label: label.trim(),
        color,
        description: description.trim(),
      });

      if (res.success) {
        setLabel('');
        setDescription('');
        setColor('#6366f1');
        if (onStagesChanged) {
          await onStagesChanged();
        }
      } else {
        setError(res.message || 'Failed to create lifecycle stage');
      }
    } catch (err) {
      setError(err.message || 'Error creating lifecycle stage');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, stageLabel) => {
    if (!window.confirm(`Are you sure you want to delete stage "${stageLabel}"?`)) {
      return;
    }

    try {
      const res = await api.deleteLifecycleStage(id);
      if (res.success && onStagesChanged) {
        await onStagesChanged();
      }
    } catch (err) {
      alert(`Failed to delete stage: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '100%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1875rem', fontWeight: 800 }}>
              Custom Client Lifecycle Stages
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

          {/* Form to Add New Stage */}
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
              <span>Add New Lifecycle Stage</span>
            </div>

            <div className="form-group">
              <label className="form-label">Stage Label *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Discovery & Pitch, Negotiation, Closed Lost, Renewal Pending"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>

            {/* Stage Color Swatches */}
            <div className="form-group">
              <label className="form-label">Stage Indicator Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '3px solid #f8fafc' : '2px solid transparent',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'transform 0.15s ease',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  title="Custom Color"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Stage SLA or tracking criteria"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !label.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              <span>{loading ? 'Creating Stage...' : 'Create Stage'}</span>
            </button>
          </form>

          {/* Existing Stages List */}
          <div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '10px',
              }}
            >
              Active Lifecycle Stages ({stages.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stages.map((stage) => {
                const stageColor = stage.color || '#94a3b8';
                return (
                  <div
                    key={stage._id}
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
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: stageColor,
                          boxShadow: `0 0 8px ${stageColor}66`,
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#f8fafc' }}>
                            {stage.label}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: `${stageColor}22`,
                              color: stageColor,
                              border: `1px solid ${stageColor}44`,
                            }}
                          >
                            {stage.key}
                          </span>
                        </div>
                        {stage.description && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {stage.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {stage.isSystem ? (
                        <span
                          title="Core System Stage (Locked)"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.6875rem',
                            color: '#64748b',
                          }}
                        >
                          <Lock size={12} />
                          <span>System</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(stage._id, stage.label)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Delete Custom Stage"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

