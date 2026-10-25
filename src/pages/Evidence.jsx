import React, { useState, useEffect } from 'react';
import {
  Lock,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  MapPin,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  Clock,
  Download,
  ShieldCheck
} from 'lucide-react';
import { getAllIncidents, saveIncident, deleteIncident } from '../services/db';

export default function Evidence() {
  const [incidents, setIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'view' | 'edit' | null
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cyber Harassment',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: '',
    suspect: '',
    description: '',
    notes: '',
    evidenceFiles: []
  });

  const categories = [
    'All',
    'Cyber Harassment',
    'Physical Safety',
    'Stalking & Surveillance',
    'Workplace Misconduct',
    'Coercion & Extortion',
    'Other'
  ];

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    const list = await getAllIncidents();
    setIncidents(list);
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Cyber Harassment',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: '',
      suspect: '',
      description: '',
      notes: '',
      evidenceFiles: []
    });
    setActiveModal('create');
  };

  const handleOpenEdit = (inc) => {
    setSelectedIncident(inc);
    setFormData({
      title: inc.title || '',
      category: inc.category || 'Cyber Harassment',
      date: inc.date || new Date().toISOString().split('T')[0],
      time: inc.time || '',
      location: inc.location || '',
      suspect: inc.suspect || '',
      description: inc.description || '',
      notes: inc.notes || '',
      evidenceFiles: inc.evidenceFiles || []
    });
    setActiveModal('edit');
  };

  const handleOpenView = (inc) => {
    setSelectedIncident(inc);
    setActiveModal('view');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          evidenceFiles: [
            ...prev.evidenceFiles,
            {
              name: file.name,
              size: `${Math.round(file.size / 1024)} KB`,
              type: file.type,
              dataUrl: event.target.result
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const payload = {
      ...formData,
      id: activeModal === 'edit' && selectedIncident ? selectedIncident.id : undefined,
      evidenceCount: formData.evidenceFiles.length
    };

    await saveIncident(payload);
    setActiveModal(null);
    loadIncidents();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident record from your device? This cannot be undone.')) {
      await deleteIncident(id);
      if (activeModal === 'view') setActiveModal(null);
      loadIncidents();
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesCategory = selectedCategory === 'All' || inc.category === selectedCategory;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.location && inc.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.suspect && inc.suspect.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.notes && inc.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={28} color="var(--brand-lavender)" />
            Private Evidence Locker
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Log and catalog incident notes, screenshots, suspect handles, and timelines privately on your device.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} /> Record Incident
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by keywords, suspects, handles, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
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
      </div>

      {/* Incidents List Grid */}
      {filteredIncidents.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                transition: 'border-color var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-purple">{incident.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> {incident.date} {incident.time ? `at ${incident.time}` : ''}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {incident.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenView(incident)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.3rem' }}
                  >
                    <Eye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => handleOpenEdit(incident)}
                    className="btn btn-outline btn-sm"
                    title="Edit record"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(incident.id)}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--status-danger)' }}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '0.75rem'
              }}>
                {incident.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                {incident.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} /> {incident.location}
                  </span>
                )}
                {incident.suspect && (
                  <span>
                    <strong>Suspect / Handle:</strong> {incident.suspect}
                  </span>
                )}
                <span>
                  📎 {incident.evidenceFiles?.length || 0} attached file{incident.evidenceFiles?.length === 1 ? '' : 's'}
                </span>
                {incident.analysisReport && (
                  <span style={{ color: incident.analysisReport.riskScore >= 60 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                    ⚠️ Threat Level: {incident.analysisReport.classification}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <Lock size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No incident records found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.35rem auto 1.25rem auto' }}>
            {searchTerm || selectedCategory !== 'All'
              ? 'No records match your search filter.'
              : 'Your Evidence Locker is empty. Click below to document an occurrence.'}
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            Record Incident
          </button>
        </div>
      )}

      {/* Honest Local Storage Notice */}
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
        <ShieldCheck size={18} color="var(--brand-purple-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Local Storage & Privacy Note:</strong> Incidents and attached files are stored locally in your browser's IndexedDB database on this device. They are not uploaded to any remote server or cloud service. Keep original screenshot files backed up safely on your phone or computer.
        </div>
      </div>

      {/* CREATE / EDIT INCIDENT MODAL */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {activeModal === 'create' ? 'Record Safety Incident' : 'Edit Incident Record'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Incident Title / Summary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Threatening message from unknown Instagram profile"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Cyber Harassment">Cyber Harassment / DMs</option>
                    <option value="Physical Safety">Physical Safety / Confrontation</option>
                    <option value="Stalking & Surveillance">Stalking & Surveillance</option>
                    <option value="Workplace Misconduct">Workplace Misconduct</option>
                    <option value="Coercion & Extortion">Coercion & Extortion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Occurred</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approximate Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Location / Platform</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Instagram DM, Janpath Metro Gate 2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Suspect Name / Handle / Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. @anonymous_99, or unknown male on two-wheeler"
                    value={formData.suspect}
                    onChange={(e) => setFormData({ ...formData, suspect: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Chronological Description</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  placeholder="Describe what occurred. Include direct quotes, actions, witnesses, or immediate reactions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Notes / Follow-up Actions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Blocked profile on Instagram; reported to college proctor"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* File Attachment Upload */}
              <div className="form-group">
                <label className="form-label">
                  <Paperclip size={14} /> Attach Screenshots or Supporting Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,text/*"
                  onChange={handleFileUpload}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    color: 'var(--text-secondary)'
                  }}
                />
                <span className="form-hint">Files are stored locally in your browser storage.</span>

                {formData.evidenceFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {formData.evidenceFiles.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.65rem',
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          📄 {file.name} ({file.size})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          style={{ background: 'transparent', color: 'var(--status-danger)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {activeModal === 'create' ? 'Save Record' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW INCIDENT DETAILS MODAL */}
      {activeModal === 'view' && selectedIncident && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '0.35rem' }}>
                  {selectedIncident.category}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedIncident.title}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-card)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                  <div style={{ fontWeight: 600 }}>{selectedIncident.date} {selectedIncident.time || ''}</div>
                </div>
                {selectedIncident.location && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Location/Platform:</span>
                    <div style={{ fontWeight: 600 }}>{selectedIncident.location}</div>
                  </div>
                )}
                {selectedIncident.suspect && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Suspect / Handle:</span>
                    <div style={{ fontWeight: 600 }}>{selectedIncident.suspect}</div>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>Description:</h4>
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-secondary)'
                }}>
                  {selectedIncident.description}
                </div>
              </div>

              {selectedIncident.notes && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>Follow-up Notes:</h4>
                  <div style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {selectedIncident.notes}
                  </div>
                </div>
              )}

              {/* Evidence attachments preview */}
              {selectedIncident.evidenceFiles && selectedIncident.evidenceFiles.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Attached Files ({selectedIncident.evidenceFiles.length}):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedIncident.evidenceFiles.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.65rem 0.85rem',
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{file.size} • {file.type || 'Attachment'}</div>
                        </div>
                        {file.dataUrl && (
                          <a
                            href={file.dataUrl}
                            download={file.name}
                            className="btn btn-outline btn-sm"
                            style={{ gap: '0.3rem' }}
                          >
                            <Download size={13} /> View / Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handleDelete(selectedIncident.id)}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--status-danger)' }}
              >
                <Trash2 size={14} /> Delete Record
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedIncident)}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
