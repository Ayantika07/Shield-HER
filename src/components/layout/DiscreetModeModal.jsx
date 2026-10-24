import React, { useState } from 'react';
import { EyeOff, Calculator, FileText, Lock, X } from 'lucide-react';

export default function DiscreetModeModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [calcInput, setCalcInput] = useState('0');
  const [noteContent, setNoteContent] = useState(
    'Groceries:\n- Whole wheat bread\n- Milk & greek yogurt\n- Green tea\n- Bananas\n\nStudy checklist:\n- Chapter 4 algorithms\n- Database normalization notes'
  );

  if (!isOpen) return null;

  const handleCalcClick = (val) => {
    if (val === 'C') {
      setCalcInput('0');
    } else if (val === '=') {
      try {
        // Safe evaluation for basic math
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch {
        setCalcInput('Error');
      }
    } else {
      setCalcInput(prev => prev === '0' || prev === 'Error' ? val : prev + val);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Discreet Header resembling a generic utility app */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('notes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'notes' ? '#e2e8f0' : 'transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#334155'
            }}
          >
            <FileText size={16} /> Quick Notes
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: activeTab === 'calc' ? '#e2e8f0' : 'transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#334155'
            }}
          >
            <Calculator size={16} /> Calculator
          </button>
        </div>

        {/* Discreet Return Button (looks like a normal sync or exit icon) */}
        <button
          onClick={onClose}
          title="Exit Privacy Disguise"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <EyeOff size={14} /> Exit Disguise
        </button>
      </div>

      {/* Disguise Content */}
      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
        {activeTab === 'notes' ? (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>
              Personal Notepad
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{
                width: '100%',
                height: '70vh',
                padding: '1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                backgroundColor: '#ffffff',
                color: '#334155',
                resize: 'none'
              }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '320px', marginTop: '2rem' }}>
            <div style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '1.25rem',
              borderRadius: '12px 12px 0 0',
              fontSize: '2rem',
              textAlign: 'right',
              fontFamily: 'monospace',
              minHeight: '70px',
              wordBreak: 'break-all'
            }}>
              {calcInput}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2px',
              backgroundColor: '#cbd5e1',
              padding: '2px',
              borderRadius: '0 0 12px 12px'
            }}>
              {['C', '(', ')', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcClick(btn)}
                  style={{
                    padding: '1rem 0',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    backgroundColor: btn === '=' ? '#3b82f6' : '#ffffff',
                    color: btn === '=' ? '#ffffff' : '#1e293b',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#64748b',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f1f5f9'
      }}>
        Privacy Disguise Mode active. Click "Exit Disguise" at the top right to return to SHIELD HER.
      </div>
    </div>
  );
}
