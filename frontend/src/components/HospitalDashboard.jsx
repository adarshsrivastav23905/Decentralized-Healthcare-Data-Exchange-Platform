import React, { useState } from 'react';
import { Building2, PlusCircle, CheckCircle2, ShieldAlert, FileText, Hash, ExternalLink, HelpCircle } from 'lucide-react';

export default function HospitalDashboard({ contract }) {
  const [patientAddress, setPatientAddress] = useState('');
  const [recordType, setRecordType] = useState('Lab Report');
  const [fileHash, setFileHash] = useState('');
  const [storageReference, setStorageReference] = useState('ipfs://QmSampleCID.../record.json');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [createdRecordId, setCreatedRecordId] = useState(null);

  const RECORD_TYPES = [
    'Lab Report',
    'Prescription',
    'Discharge Summary',
    'Vaccination Record',
    'Imaging',
    'General Medical Record'
  ];

  // Helper to autofill sample dummy hashes
  const handleUseSampleHash = () => {
    setFileHash('0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');
    setStorageReference('local://sample_records/medical_record_001.json');
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!patientAddress.trim() || !fileHash.trim() || !storageReference.trim()) {
      setStatusMsg({ type: 'warning', text: 'Please fill out all required record fields.' });
      return;
    }
    if (!fileHash.startsWith('0x') || fileHash.length !== 66) {
      setStatusMsg({ type: 'warning', text: 'File hash must be a valid 32-byte hexadecimal string (starting with 0x and 66 chars long).' });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    setCreatedRecordId(null);

    try {
      const tx = await contract.addMedicalRecord(
        patientAddress.trim(),
        recordType,
        fileHash.trim(),
        storageReference.trim()
      );
      const receipt = await tx.wait();

      // Find record ID from events
      let recId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'MedicalRecordAdded') {
            recId = parsed.args.recordId;
            break;
          }
        } catch (e) {}
      }

      setCreatedRecordId(recId ? Number(recId) : 'Confirmed');
      setStatusMsg({ type: 'success', text: `Medical record entry successfully anchored on blockchain!` });
      
      // Clear inputs
      setPatientAddress('');
      setFileHash('');
    } catch (err) {
      console.error('Add record error:', err);
      setStatusMsg({ type: 'error', text: err?.reason || err?.message || 'Failed to add medical record.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="card-title">
            <Building2 size={22} color="var(--role-hospital)" />
            Hospital Clinical Data Anchor
          </h2>
          <p className="card-subtitle">Anchor new patient medical record metadata and cryptographic fingerprints to the ledger</p>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`alert-banner ${statusMsg.type === 'success' ? 'alert-info' : 'alert-warning'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {createdRecordId && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                New On-Chain Record Created: Record #{createdRecordId}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                The record fingerprint has been permanently bound to the patient's wallet address.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Creation Form */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <PlusCircle size={18} color="var(--accent-purple)" />
            Issue Medical Record Entry
          </h3>

          <form onSubmit={handleAddRecord}>
            <div className="form-group">
              <label className="form-label">Registered Patient Wallet Address</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Record Classification / Type</label>
              <select
                className="form-select"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                disabled={loading}
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Off-Chain File Hash (SHA-256 / Bytes32)</label>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  onClick={handleUseSampleHash}
                >
                  Use Sample Hash
                </button>
              </div>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                value={fileHash}
                onChange={(e) => setFileHash(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Storage Reference / IPFS CID URI</label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
                value={storageReference}
                onChange={(e) => setStorageReference(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              disabled={loading}
            >
              <PlusCircle size={16} />
              {loading ? 'Submitting to Blockchain...' : 'Anchor Record on Blockchain'}
            </button>
          </form>
        </div>

        {/* Clinical Best Practices & Privacy Guidelines */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <HelpCircle size={18} color="var(--accent-cyan)" />
            Hospital Protocol Guidelines
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <div style={{ background: 'rgba(10, 15, 29, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              📌 <strong>Step 1: Save Off-Chain</strong><br />
              Generate the diagnostic PDF or lab JSON report and store it in your secure institutional repository or encrypted IPFS node.
            </div>

            <div style={{ background: 'rgba(10, 15, 29, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              🔐 <strong>Step 2: Generate Hash</strong><br />
              Compute the SHA-256 hash using <code>npm run hash</code> or your secure clinical pipeline to establish an immutable fingerprint.
            </div>

            <div style={{ background: 'rgba(10, 15, 29, 0.6)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              📜 <strong>Step 3: Anchor Metadata</strong><br />
              Submit the hash and reference URI. The patient is instantly designated the sole sovereign owner with access delegation rights.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
