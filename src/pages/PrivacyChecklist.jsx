import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  RotateCcw,
  ShieldCheck,
  Lock,
  Smartphone,
  Eye,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { getChecklistItems, toggleChecklistItem, resetChecklist } from '../services/db';

export default function PrivacyChecklist() {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    const list = await getChecklistItems();
    setItems(list);
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleChecklistItem(id, !currentStatus);
    loadChecklist();
  };

  const handleReset = async () => {
    if (window.confirm('Reset all digital privacy tasks to uncompleted?')) {
      const resetList = await resetChecklist();
      setItems(resetList);
    }
  };

  const total = items.length;
  const completedCount = items.filter(i => i.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const categories = ['All', 'Account Security', 'Social Media & Privacy', 'Device & Location', 'Phishing & Harassment', 'Account Recovery', 'Evidence & Records'];

  const filteredItems = items.filter((item) =>
    selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckSquare size={28} color="var(--brand-purple-light)" />
            Digital Privacy Guardian
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Interactive defense protocol against stalkerware, credential theft, location surveillance, and unwanted exposure.
          </p>
        </div>

        <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <RotateCcw size={14} /> Reset Progress
        </button>
      </div>

      {/* Progress Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Digital Hardening Progress
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {percent}% Privacy Shield Active
            </div>
          </div>
          <span className={`badge ${percent === 100 ? 'badge-safe' : percent > 50 ? 'badge-purple' : 'badge-warning'}`} style={{ fontSize: '0.85rem' }}>
            {completedCount} of {total} Tasks Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '10px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            height: '100%',
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #4f46e5 0%, #10b981 100%)',
            transition: 'width 300ms ease'
          }} />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="btn btn-sm"
            style={{
              backgroundColor: selectedCategory === cat ? 'var(--brand-purple)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.775rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: item.completed ? 'var(--bg-card)' : 'var(--bg-surface)',
                border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                {/* Checkbox & Title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    style={{
                      background: 'transparent',
                      color: item.completed ? 'var(--status-safe)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.completed ? (
                      <CheckSquare size={22} color="#10b981" />
                    ) : (
                      <Square size={22} />
                    )}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                        {item.category}
                      </span>
                      {item.completed && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--status-safe)', fontWeight: 600 }}>
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {item.title}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Expand / Collapse Action */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.25rem' }}
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {/* Actionable Step Expansion */}
              {isExpanded && (
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  animation: 'fadeIn 150ms ease'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)'
                  }}>
                    <strong style={{ color: 'var(--brand-lavender)' }}>🛠️ How to Complete (Practical Step):</strong>
                    <div style={{ marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {item.actionStep}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notice on Device Limitations */}
      <div style={{
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.6rem'
      }}>
        <Info size={18} color="var(--brand-purple-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>System Limitation Note:</strong> For security reasons, web applications cannot directly alter native operating system permissions on iOS or Android devices. This checklist provides human-verified step-by-step procedures to harden your actual device settings directly.
        </div>
      </div>
    </div>
  );
}
