import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Users,
  Activity,
  Sliders,
  Hash,
  ToggleLeft,
  FileText,
} from 'lucide-react';

export const AnalyticsView = ({
  tasks = [],
  users = [],
  customFields = [],
  lifecycleStages = [],
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const urgent = tasks.filter((t) => t.priority === 'URGENT').length;

  const categories = ['Business', 'Individuals', 'Payroll Client', 'Fee Structure', 'List'];
  const categoryCounts = categories.map((c) => ({
    name: c,
    count: tasks.filter((t) => (t.listCategory || '').toLowerCase() === c.toLowerCase()).length,
  }));

  const estimatedARR = total * 45000 + completed * 60000;

  // Active custom fields marked for charts
  const chartCustomFields = customFields.filter((f) => f.showInCharts !== false);

  // Resolved dynamic stages
  const resolvedStages =
    lifecycleStages && lifecycleStages.length > 0
      ? lifecycleStages
      : [
          { _id: 's1', key: 'TO DO', label: 'TO DO', color: '#94a3b8' },
          { _id: 's2', key: 'IN PROGRESS', label: 'IN PROGRESS', color: '#38bdf8' },
          { _id: 's3', key: 'REVIEW', label: 'REVIEW', color: '#fbbf24' },
          { _id: 's4', key: 'COMPLETED', label: 'COMPLETED / WON', color: '#10b981' },
        ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
          Pipeline & ARR Performance Analytics
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px', marginBottom: 0 }}>
          Real-time metrics, custom lifecycle velocity, dynamic schema analytics, and revenue forecasts
        </p>
      </div>

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Total ARR */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>Total Pipeline ARR</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>
            ${(estimatedARR / 1000).toFixed(0)}k
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            <TrendingUp size={13} />
            <span>+14.2% from last quarter</span>
          </div>
        </div>

        {/* Won Deals */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>Closed / Won Deals</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>
            {completed} / {total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {total > 0 ? ((completed / total) * 100).toFixed(1) : 0}% win conversion rate
          </div>
        </div>

        {/* Urgent Action Needed */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>Urgent Priority Items</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>{urgent}</div>
          <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>
            Requires immediate executive review
          </div>
        </div>

        {/* Team Members */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>Active Team Seats</span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>{users.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
            100% online presence & signaling ready
          </div>
        </div>
      </div>

      {/* Dynamic Custom Schema Metrics & Analytics */}
      {chartCustomFields.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sliders size={18} style={{ color: '#818cf8' }} />
            <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Dynamic Custom Schema & Columns Analytics
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {chartCustomFields.map((field) => {
              if (field.type === 'number') {
                const numericValues = tasks
                  .map((t) => t.customFields?.[field.key])
                  .filter((v) => v !== undefined && v !== null && v !== '' && !isNaN(Number(v)))
                  .map((v) => Number(v));

                const sum = numericValues.reduce((a, b) => a + b, 0);
                const avg = numericValues.length > 0 ? (sum / numericValues.length).toFixed(1) : 0;
                const max = numericValues.length > 0 ? Math.max(...numericValues) : 0;

                return (
                  <div
                    key={field._id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '14px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Hash size={16} style={{ color: '#38bdf8' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                          {field.label}
                        </span>
                      </div>
                      <span className="category-tag">Number Metric</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
                        {sum.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Aggregate</span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div>
                        <span style={{ color: '#94a3b8' }}>Average:</span>{' '}
                        <strong style={{ color: '#f8fafc' }}>{avg.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Highest:</span>{' '}
                        <strong style={{ color: '#f8fafc' }}>{max.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                );
              }

              if (field.type === 'boolean') {
                const trueCount = tasks.filter((t) => t.customFields?.[field.key] === true).length;
                const totalEvaluated = tasks.filter(
                  (t) => t.customFields?.[field.key] !== undefined && t.customFields?.[field.key] !== null
                ).length;
                const pct = totalEvaluated > 0 ? ((trueCount / totalEvaluated) * 100).toFixed(0) : 0;

                return (
                  <div
                    key={field._id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      borderRadius: '14px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ToggleLeft size={16} style={{ color: '#fbbf24' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                          {field.label}
                        </span>
                      </div>
                      <span className="category-tag">Boolean Ratio</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>
                        {pct}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {trueCount} True of {totalEvaluated} entries
                      </span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: '#fbbf24',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              }

              // Text or Textarea
              const filledCount = tasks.filter(
                (t) => t.customFields?.[field.key] && String(t.customFields[field.key]).trim()
              ).length;
              const fillPct = total > 0 ? ((filledCount / total) * 100).toFixed(0) : 0;

              return (
                <div
                  key={field._id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(167, 139, 250, 0.25)',
                    borderRadius: '14px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: '#a78bfa' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                        {field.label}
                      </span>
                    </div>
                    <span className="category-tag">{field.type}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a78bfa' }}>
                      {filledCount}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Populated ({fillPct}%)</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {field.description || 'Custom field populated across client entries'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage Breakdown & Category Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Dynamic Lifecycle Stage Velocity */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '22px',
          }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
            Lifecycle Stage Velocity ({resolvedStages.length} Stages)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {resolvedStages.map((st) => {
              const count = tasks.filter(
                (t) => (t.status || '').toUpperCase() === (st.key || '').toUpperCase()
              ).length;
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              const stageColor = st.color || '#94a3b8';

              return (
                <div key={st._id || st.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{st.label || st.key}</span>
                    <span style={{ color: '#94a3b8' }}>
                      {count} deals ({pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: stageColor,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Categories */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '22px',
          }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
            Portfolio Category Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryCounts.map((cat) => {
              const pct = total > 0 ? ((cat.count / total) * 100).toFixed(0) : 0;
              return (
                <div
                  key={cat.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                    {cat.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="category-tag">{cat.count} deals</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '35px', textAlign: 'right' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
