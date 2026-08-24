import React, { useState } from 'react';
import { Stethoscope, Search, ShieldAlert, CheckCircle2, FileText, Calendar, Hash, ExternalLink, Lock } from 'lucide-react';

export default function DoctorDashboard({ contract }) {
  const [recordIdInput, setRecordIdInput] = useState('');
  const [patientAddressInput, setPatientAddressInput] = useState('');
  const [queriedRecord, setQueriedRecord] = useState(null);
  const [patientRecordIds, setPatientRecordIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Query single record by ID
  const handleQueryRecord = async (e) => {
    e.preventDefault();
    if (!recordIdInput.trim()) {
      setError('Please enter a valid Record ID');
      return;
    }
    setError('');
    setLoading(true);
    setQueriedRecord(null);

    try {
      // In Solidity, calling getRecord performs a permission check and emits RecordAccessed event
      const rec = await contract.getRecord.staticCall(Number(recordIdInput.trim()));
      setQueriedRecord({
        recordId: Number(rec.recordId),
        patient: rec.patient,
        createdBy: rec.createdBy,
        recordType: rec.recordType,
        fileHash: rec.fileHash,
        storageReference: rec.storageReference,
        timestamp: new Date(Number(rec.timestamp) * 1000).toLocaleString(),
        active: rec.active
      });
    } catch (err) {
      console.error('Record query failed:', err);
      setError(err?.reason || err?.message || 'Access Denied: You do not have patient consent to view this record.');
    } finally {
      setLoading(false);
    }
  };

  // Query all record IDs of a patient
  const handleQueryPatientRecords = async (e) => {
    e.preventDefault();
    if (!patientAddressInput.trim()) {
      setError('Please enter a valid patient wallet address');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    setPatientRecordIds([]);

    try {
      const ids = await contract.getPatientRecords(patientAddressInput.trim());
      setPatientRecordIds(ids.map((id) => Number(id)));
    } catch (err) {
      console.error('Patient record search failed:', err);
      setError(err?.reason || err?.message || 'Failed to fetch patient records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title">
            <Stethoscope size={22} color="var(--role-doctor)" />
            Doctor Clinical Portal
          </h2>
          <p className="card-subtitle">Request and inspect authorized patient records with verifiable consent</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Search Patient Records by Wallet */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Search size={18} color="var(--accent-cyan)" />
            Find Patient Record IDs
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Query the public on-chain registry for all record IDs linked to a specific patient wallet.
          </p>

          <form onSubmit={handleQueryPatientRecords}>
            <div className="form-group">
              <label className="form-label">Patient Wallet Address</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
                value={patientAddressInput}
                onChange={(e) => setPatientAddressInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-emerald btn-block" disabled={loading}>
              <Search size={16} />
              {loading ? 'Searching Ledger...' : 'Search Patient Records'}
            </button>
          </form>

          {searched && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Found Record IDs ({patientRecordIds.length}):
              </div>
              {patientRecordIds.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No records registered for this address.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {patientRecordIds.map((id) => (
                    <button
                      key={id}
                      className="btn btn-outline btn-sm font-mono"
                      onClick={() => {
                        setRecordIdInput(String(id));
                      }}
                    >
                      Record #{id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Access Specific Record */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Lock size={18} color="var(--accent-emerald)" />
            Access Authorized Medical Record
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Enter a Record ID to verify your permission and retrieve the metadata &amp; hash fingerprint.
          </p>

          <form onSubmit={handleQueryRecord}>
            <div className="form-group">
              <label className="form-label">Record ID</label>
              <input
                type="number"
                min="1"
                className="form-input font-mono"
                placeholder="1"
                value={recordIdInput}
                onChange={(e) => setRecordIdInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <CheckCircle2 size={16} />
              {loading ? 'Verifying Permission...' : 'Fetch Record Metadata'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-warning" style={{ marginTop: '1.5rem' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Queried Record Display */}
      {queriedRecord && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={20} />
              Access Granted — Record #{queriedRecord.recordId}
            </h3>
            <span className="badge badge-doctor">Permission Active</span>
          </div>

          <div className="record-card" style={{ background: 'rgba(10, 15, 29, 0.8)' }}>
            <div className="record-header">
              <div className="record-type">
                <FileText size={18} color="var(--accent-cyan)" />
                {queriedRecord.recordType}
              </div>
              <span className="badge badge-patient">Patient: {queriedRecord.patient.slice(0, 8)}...</span>
            </div>

            <div className="record-meta">
              <div className="meta-row">
                <Calendar size={14} />
                <span>Timestamp: {queriedRecord.timestamp}</span>
              </div>
              <div className="meta-row">
                <Hash size={14} />
                <span>Hospital Provider: {queriedRecord.createdBy}</span>
              </div>
              <div className="meta-row">
                <ExternalLink size={14} />
                <span>Storage Reference: <code style={{ color: 'var(--accent-cyan)' }}>{queriedRecord.storageReference}</code></span>
              </div>
              <div style={{ marginTop: '0.6rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>VERIFIED FILE HASH (SHA-256):</div>
                <div className="hash-display">{queriedRecord.fileHash}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
