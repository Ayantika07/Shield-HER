import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Send,
  RotateCcw,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Info,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { analyzeHarassmentMessage, SAMPLE_MESSAGES } from '../services/analyzerService';
import { saveIncident } from '../services/db';

export default function Detector() {
  const navigate = useNavigate();

  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [savedToEvidence, setSavedToEvidence] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError('Please paste or type a digital message to evaluate.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    setSavedToEvidence(false);

    try {
      const apiKey = localStorage.getItem('shield_her_gemini_key') || '';
      // Simulate quick natural evaluation delay
      await new Promise(r => setTimeout(r, 600));
      const analysis = await analyzeHarassmentMessage(inputText, apiKey);
      setResult(analysis);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please check input.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setError('');
    setSavedToEvidence(false);
  };

  const handleLoadSample = (sample) => {
    setInputText(sample.text);
    setError('');
    setResult(null);
    setSavedToEvidence(false);
  };

  const handleSaveToEvidence = async () => {
    if (!result) return;
    try {
      const newIncident = {
        title: `Flagged Message (${result.classification}) - ${new Date().toLocaleDateString()}`,
        category: 'Cyber Harassment',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Online Messaging / Social Media',
        suspect: 'Digital Sender / Handle',
        description: `Message Content: "${inputText}"\n\nAI Analysis: ${result.classification} (Risk Score: ${result.riskScore}/100)\nDetected Flags: ${result.detectedFlags.join(', ')}`,
        analysisReport: result,
        evidenceCount: 1,
        evidenceFiles: [
          { name: 'analyzed_message_transcript.txt', size: `${inputText.length} bytes`, type: 'text/plain' }
        ]
      };
      await saveIncident(newIncident);
      setSavedToEvidence(true);
    } catch {
      alert('Could not save incident to local Evidence Locker.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={28} color="#fb7185" />
          AI Cyber Harassment & Threat Detector
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Evaluate unwanted digital messages, identify extortion or stalking patterns, and prepare forensic reports.
        </p>
      </div>

      {/* Preset Sample Messages for Hackathon Judges */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-lavender)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} /> Quick Test Presets (Click to evaluate sample message):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {SAMPLE_MESSAGES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(sample)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.8rem',
                borderLeft: `3px solid ${
                  sample.type === 'Safe' ? '#10b981' : sample.type === 'Suspicious' ? '#f59e0b' : '#ef4444'
                }`
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span>Message Content for Risk Assessment</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Local Analysis (Not shared publicly)
          </span>
        </div>

        <textarea
          rows={6}
          className="form-textarea"
          placeholder="Paste suspected SMS, Instagram DM, WhatsApp message, email, or threatening text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ resize: 'vertical', fontSize: '0.95rem', lineHeight: 1.6 }}
        />

        {error && (
          <div className="form-error" style={{ marginTop: '0.5rem' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            onClick={handleReset}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <RotateCcw size={14} /> Reset Form
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="btn btn-primary"
            style={{ minWidth: '160px', gap: '0.5rem', fontWeight: 700 }}
          >
            {isAnalyzing ? (
              <span>Scanning Patterns...</span>
            ) : (
              <>
                <Send size={16} /> Analyze Message
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${result.classification === 'Potentially Dangerous' ? '#ef4444' : result.classification === 'Suspicious' ? '#f59e0b' : '#10b981'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 200ms ease'
        }}>
          {/* Header & Risk Classification */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span className={`badge badge-${result.badgeColor}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', marginBottom: '0.5rem' }}>
                Classification: {result.classification}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {result.severityLevel}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Engine: {result.engine} • Evaluated at {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>

            {/* Score & Confidence */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              backgroundColor: 'var(--bg-card)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Threat Score</div>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: result.riskScore >= 40 ? '#ef4444' : result.riskScore >= 15 ? '#f59e0b' : '#10b981'
                }}>
                  {result.riskScore}/100
                </div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-purple-light)' }}>
                  {result.confidencePercent}%
                </div>
              </div>
            </div>
          </div>

          {/* Trigger Flags & Highlighted Words */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Specific Detected Flags & Indicators:
            </div>
            {result.detectedFlags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.detectedFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    ⚠️ {flag}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No overt threat patterns or harassment triggers were detected in this text.
              </div>
            )}
          </div>

          {/* Highlighted Terms */}
          {result.highlightedTerms.length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
              fontSize: '0.825rem'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>Matched Keyword Phrases:</strong>{' '}
              <span style={{ color: '#fb7185' }}>{result.highlightedTerms.join(', ')}</span>
            </div>
          )}

          {/* Practical Next Steps */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Actionable Safety Guidance & Next Steps:
            </div>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
              {result.practicalAdvice.map((step, idx) => (
                <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Row: Save to Evidence Locker + Cyber Portal Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleSaveToEvidence}
                disabled={savedToEvidence}
                className="btn btn-primary btn-sm"
                style={{ gap: '0.4rem' }}
              >
                {savedToEvidence ? (
                  <>
                    <CheckCircle2 size={15} color="#10b981" /> Preserved in Evidence Locker
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Save Report to Evidence Locker
                  </>
                )}
              </button>

              {savedToEvidence && (
                <button
                  onClick={() => navigate('/evidence')}
                  className="btn btn-secondary btn-sm"
                >
                  View in Locker →
                </button>
              )}
            </div>

            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              National Cyber Crime Portal <ExternalLink size={14} />
            </a>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            ℹ️ {result.disclaimer}
          </div>
        </div>
      )}

      {/* Safety Notice */}
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
          <strong>Privacy & Forensic Preservation:</strong> Messages analyzed here are processed locally on your client machine. They are never sent to external servers unless an optional Gemini API key is configured. Always save full screenshots showing timestamps and usernames as legal court evidence.
        </div>
      </div>
    </div>
  );
}
