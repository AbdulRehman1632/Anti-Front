import React, { useState } from 'react';
import { X, Hash, Lock, Users, Check, Plus } from 'lucide-react';
import { api } from '../services/api.js';

export const ChannelModal = ({ isOpen, onClose, onChannelCreated, users = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    type: 'public',
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleToggleMember = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMemberIds(users.map((u) => u._id));
  };

  const handleClearAll = () => {
    setSelectedMemberIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      const res = await api.createChannel({
        ...formData,
        name: formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
        members: selectedMemberIds,
      });
      if (res.success) {
        onChannelCreated();
        onClose();
        setFormData({ name: '', description: '', topic: '', type: 'public' });
        setSelectedMemberIds([]);
      }
    } catch (err) {
      alert(`Create group error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 800 }}>Create Chat Group & Channel</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          <div className="form-group">
            <label className="form-label">Group / Channel Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. strategic-partnerships, design-crew"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="What is this channel about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Channel Topic</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Q4 Growth & Account Expansion"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Group Visibility</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="public">Public (Open to all organization members)</option>
              <option value="private">Private (Restricted to added members only)</option>
            </select>
          </div>

          {/* Member Selection Section */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} style={{ color: '#6366f1' }} />
                <span>Add Members to Group ({selectedMemberIds.length} selected)</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Select All
                </button>
                <span style={{ color: '#475569', fontSize: '0.6875rem' }}>|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {users.length === 0 ? (
                <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                  No members found in workspace
                </div>
              ) : (
                users.map((u) => {
                  const isChecked = selectedMemberIds.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleToggleMember(u._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: isChecked ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#312e81',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#fff',
                            overflow: 'hidden',
                          }}
                        >
                          {u.avatar ? (
                            <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            u.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: '#f8fafc', fontWeight: isChecked ? 600 : 400 }}>
                          {u.name}
                        </span>
                        <span className={`persona-role-badge role-${u.role}`} style={{ fontSize: '0.5625rem' }}>
                          {u.role}
                        </span>
                      </div>

                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: isChecked ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.2)',
                          background: isChecked ? '#6366f1' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '16px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating Group...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
