import React from 'react';
import {
  Crown,
  Shield,
  Edit3,
  Eye,
  Check,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { ROLE_DEFINITIONS } from '../context/AuthContext.jsx';

export const RoleExplainerCards = ({
  selectedRole = 'Editor',
  onSelectRole,
  showFullDetails = true,
}) => {
  const roleIcons = {
    Owner: Crown,
    Admin: Shield,
    Editor: Edit3,
    Viewer: Eye,
  };

  const activeDef = ROLE_DEFINITIONS[selectedRole] || ROLE_DEFINITIONS['Editor'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 4 Clickable Role Selection Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {Object.keys(ROLE_DEFINITIONS).map((roleKey) => {
          const def = ROLE_DEFINITIONS[roleKey];
          const Icon = roleIcons[roleKey] || Shield;
          const isSelected = selectedRole === roleKey;

          return (
            <div
              key={roleKey}
              onClick={() => onSelectRole(roleKey)}
              style={{
                background: isSelected ? 'rgba(99, 102, 241, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                border: isSelected ? `2px solid ${def.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? `0 0 16px ${def.color}33` : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `${def.color}22`,
                  color: def.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                }}
              >
                <Icon size={16} />
              </div>

              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                {def.name}
              </div>

              <div
                style={{
                  fontSize: '0.6875rem',
                  color: isSelected ? '#cbd5e1' : '#64748b',
                  marginTop: '2px',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {roleKey === 'Owner' && 'Highest Control'}
                {roleKey === 'Admin' && 'Ops & Invites'}
                {roleKey === 'Editor' && 'Deals & Tasks'}
                {roleKey === 'Viewer' && 'Read-Only Audit'}
              </div>

              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: def.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Role Breakdown Container */}
      {showFullDetails && activeDef && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${activeDef.color}44`,
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-sm)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '8px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: activeDef.color }}>
                  {activeDef.title}
                </span>
                <span className={`persona-role-badge ${activeDef.badgeClass}`} style={{ fontSize: '0.625rem' }}>
                  {activeDef.name}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {activeDef.summary}
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginTop: '10px' }}>
            {/* What this role CAN do */}
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#10b981',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Check size={12} strokeWidth={3} /> What {activeDef.name} CAN Do:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeDef.canDo.slice(0, 5).map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      lineHeight: 1.3,
                    }}
                  >
                    <span style={{ color: '#10b981', marginTop: '2px' }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What this role CANNOT do */}
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: activeDef.cannotDo.length > 0 ? '#f87171' : '#64748b',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={12} strokeWidth={3} /> Restrictions:
              </div>
              {activeDef.cannotDo.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeDef.cannotDo.map((item, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        color: '#fca5a5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        lineHeight: 1.3,
                      }}
                    >
                      <span style={{ color: '#f87171', marginTop: '2px' }}>✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontStyle: 'italic' }}>
                  ✨ Zero restrictions. Complete organizational oversight.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
