import React, { useState, useEffect } from 'react';
import { FileText, Key, Lock, Unlock, RefreshCw, Calendar, Hash, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PatientDashboard({ contract, account }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadPatientRecords = async () => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const recordIds = await contract.getPatientRecords(account);
      const fetchedRecords = [];

      for (let i = 0; i < recordIds.length; i++) {
        const id = recordIds[i];
        // In our contract getRecord is state-changing (emits audit event), but can be called via staticCall or regular transaction
        // Using staticCall to inspect metadata without gas when browsing
        const rec = await contract.getRecord.staticCall(id);
        fetchedRecords.push({
          recordId: Number(rec.recordId),
          patient: rec.patient,
          createdBy: rec.createdBy,
          recordType: rec.recordType,
          fileHash: rec.fileHash,
          storageReference: rec.storageReference,
          timestamp: new Date(Number(rec.timestamp) * 1000).toLocaleString(),
          active: rec.active
        });
      }

      setRecords(fetchedRecords);
      if (fetchedRecords.length > 0 && !selectedRecordId) {
        setSelectedRecordId(fetchedRecords[0].recordId);
      }
    } catch (err) {
      console.error('Error loading patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientRecords();
  }, [contract, account]);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!doctorAddress || !selectedRecordId) {
      setStatusMsg({ type: 'warning', text: 'Please select a record and provide a valid doctor address.' });
      return;
    }
    setActionLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const tx = await contract.grantAccess(doctorAddress.trim(), selectedRecordId);
      await tx.wait();
      setStatusMsg({ type: 'success', text: `Access granted successfully to doctor for Record #${selectedRecordId}!` });
      setDoctorAddress('');
    } catch (err) {
      console.error('Grant access error:', err);
      setStatusMsg({ type: 'error', text: err?.reason || err?.message || 'Failed to grant access.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAccess = async (e) => {
    e.preventDefault();
    if (!doctorAddress || !selectedRecordId) {
      setStatusMsg({ type: 'warning', text: 'Please select a record and provide a valid doctor address.' });
      return;
    }
    setActionLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const tx = await contract.revokeAccess(doctorAddress.trim(), selectedRecordId);
      await tx.wait();
      setStatusMsg({ type: 'success', text: `Access revoked for doctor on Record #${selectedRecordId}!` });
      setDoctorAddress('');
    } catch (err) {
      console.error('Revoke access error:', err);
      setStatusMsg({ type: 'error', text: err?.reason || err?.message || 'Failed to revoke access.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title">
            <FileText size={22} color="var(--role-patient)" />
            Patient Health Records & Consent Manager
          </h2>
          <p className="card-subtitle">Manage your medical data fingerprints and grant/revoke doctor permissions</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadPatientRecords} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {statusMsg.text && (
        <div className={`alert-banner ${statusMsg.type === 'success' ? 'alert-info' : 'alert-warning'}`}>
          {statusMsg.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Left Column: Grant / Revoke Access Panel */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Key size={18} color="var(--accent-cyan)" />
            Consent & Access Control
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Grant or revoke permission for registered doctors to view your on-chain record metadata.
          </p>

          <form>
            <div className="form-group">
              <label className="form-label">Select Medical Record</label>
              <select
                className="form-select"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                disabled={records.length === 0}
              >
                {records.length === 0 ? (
                  <option>No records available</option>
                ) : (
                  records.map((r) => (
                    <option key={r.recordId} value={r.recordId}>
                      Record #{r.recordId} — {r.recordType} ({r.timestamp})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Doctor Ethereum Wallet Address</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                value={doctorAddress}
                onChange={(e) => setDoctorAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-emerald"
                onClick={handleGrantAccess}
                disabled={actionLoading || records.length === 0}
              >
                <Unlock size={16} />
                Grant Access
              </button>
              <button
                type="button"
                className="btn btn-rose"
                onClick={handleRevokeAccess}
                disabled={actionLoading || records.length === 0}
              >
                <Lock size={16} />
                Revoke Access
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Records Count & Quick Stats */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <ShieldCheck size={18} color="var(--accent-emerald)" />
            Decentralized Security Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(10, 15, 29, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL RECORDS OWNED</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{records.length}</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              🔒 <strong>Zero Knowledge Off-Chain Storage:</strong> Your medical diagnosis and laboratory values are never stored directly on the public blockchain.
              <br /><br />
              ⚡ <strong>Cryptographic Protection:</strong> Each record is indexed via its SHA-256 / Keccak-256 fingerprint, guaranteeing tamper detection if altered.
            </div>
          </div>
        </div>
      </div>

      {/* Record List */}
      <div className="glass-card">
        <h3 className="card-title" style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
          My Medical Records ({records.length})
        </h3>

        {loading ? (
          <div className="empty-state">Loading on-chain records...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} className="empty-icon" />
            <p>No medical records found for your wallet address.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Hospitals can add verified records for your address.</p>
          </div>
        ) : (
          <div>
            {records.map((record) => (
              <div key={record.recordId} className="record-card">
                <div className="record-header">
                  <div className="record-type">
                    <FileText size={18} color="var(--accent-cyan)" />
                    Record #{record.recordId} — {record.recordType}
                  </div>
                  <span className="badge badge-success">On-Chain Verified</span>
                </div>

                <div className="record-meta">
                  <div className="meta-row">
                    <Calendar size={14} />
                    <span>Created: {record.timestamp}</span>
                  </div>
                  <div className="meta-row">
                    <Hash size={14} />
                    <span>Hospital / Issuer: {record.createdBy}</span>
                  </div>
                  <div className="meta-row">
                    <ExternalLink size={14} />
                    <span>Storage Reference: <code style={{ color: 'var(--text-primary)' }}>{record.storageReference}</code></span>
                  </div>
                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>FILE CRYPTOGRAPHIC HASH (BYTES32):</div>
                    <div className="hash-display">{record.fileHash}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
