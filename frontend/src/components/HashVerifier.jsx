import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ShieldAlert, Hash, FileCheck, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';

export default function HashVerifier({ contract }) {
  const [recordId, setRecordId] = useState('');
  const [rawText, setRawText] = useState('');
  const [inputHash, setInputHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-calculate hash from raw text/JSON if pasted
  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    if (text.trim()) {
      try {
        const computed = ethers.keccak256(ethers.toUtf8Bytes(text));
        setInputHash(computed);
      } catch (err) {
        console.error('Hash calculation error:', err);
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!recordId.trim() || !inputHash.trim()) {
      setResult({ status: 'error', message: 'Please provide both a Record ID and a file hash to test.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const isValid = await contract.verifyRecordHash(Number(recordId.trim()), inputHash.trim());
      if (isValid) {
        setResult({
          status: 'success',
          message: `VERIFICATION PASSED: The cryptographic hash matches the on-chain anchor exactly. Document integrity is 100% intact.`
        });
      } else {
        setResult({
          status: 'tampered',
          message: `VERIFICATION FAILED: Hash mismatch detected! The document content has been modified or tampered with since being anchored.`
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setResult({
        status: 'error',
        message: err?.reason || err?.message || 'Failed to verify hash against blockchain.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <FileCheck size={22} color="var(--accent-cyan)" />
            Cryptographic Integrity &amp; Tamper Verifier
          </h2>
          <p className="card-subtitle">Verify that an off-chain medical file or payload matches its permanent blockchain fingerprint</p>
        </div>
      </div>

      <form onSubmit={handleVerify}>
        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">On-Chain Record ID</label>
            <input
              type="number"
              min="1"
              className="form-input font-mono"
              placeholder="e.g. 1"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SHA-256 / Bytes32 Hash To Test</label>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Optional: Paste File Text / JSON To Auto-Compute Keccak256</label>
          <textarea
            className="form-textarea font-mono"
            rows="3"
            placeholder="Paste synthetic record JSON here..."
            value={rawText}
            onChange={handleTextChange}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          <ShieldCheck size={16} />
          {loading ? 'Checking Smart Contract...' : 'Verify File Hash on Blockchain'}
        </button>
      </form>

      {result && (
        <div
          className={`alert-banner ${
            result.status === 'success'
              ? 'alert-info'
              : result.status === 'tampered'
              ? 'alert-warning'
              : 'alert-warning'
          }`}
          style={{ marginTop: '1.5rem' }}
        >
          {result.status === 'success' ? (
            <CheckCircle2 size={22} color="var(--accent-emerald)" />
          ) : (
            <ShieldAlert size={22} color="var(--accent-rose)" />
          )}
          <div>
            <div style={{ fontWeight: 700 }}>
              {result.status === 'success' ? 'Integrity Confirmed' : result.status === 'tampered' ? 'Tamper Detected' : 'Error'}
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>{result.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
