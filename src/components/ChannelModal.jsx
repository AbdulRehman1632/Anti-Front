import React, { useState } from 'react';
import { X, Hash, Lock } from 'lucide-react';
import { api } from '../services/api.js';

export const ChannelModal = ({ isOpen, onClose, onChannelCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic: '',
    type: 'public',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      const res = await api.createChannel(formData);
      if (res.success) {
        onChannelCreated();
        onClose();
        setFormData({ name: '', description: '', topic: '', type: 'public' });
      }
    } catch (err) {
      alert(`Create channel error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Create Team Channel</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Channel Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. strategic-partnerships"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="Purpose of this channel..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Channel Topic</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Q3 Partner Expansion"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Visibility</label>
            <select
              className="form-select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="public">Public (Open to all workspace members)</option>
              <option value="private">Private (Restricted to invited participants)</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '10px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
