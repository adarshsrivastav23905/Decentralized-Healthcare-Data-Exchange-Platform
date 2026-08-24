import React, { useState, useEffect } from 'react';
import { History, UserPlus, PlusCircle, Key, Lock, Unlock, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ROLE_NAMES } from '../contractConfig';

export default function AuditPanel({ contract }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditEvents = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const eventList = [];

      // Query past events from block 0
      const regEvents = await contract.queryFilter(contract.filters.UserRegistered());
      for (const ev of regEvents) {
        eventList.push({
          type: 'UserRegistered',
          title: `User Registered: ${ev.args[1]}`,
          desc: `Address: ${ev.args[0]} | Role: ${ROLE_NAMES[Number(ev.args[2])] || ev.args[2]}`,
          blockNumber: ev.blockNumber,
          txHash: ev.transactionHash
        });
      }

      const recordEvents = await contract.queryFilter(contract.filters.MedicalRecordAdded());
      for (const ev of recordEvents) {
        eventList.push({
          type: 'MedicalRecordAdded',
          title: `Medical Record Anchored: Record #${Number(ev.args[0])}`,
          desc: `Patient: ${ev.args[1]} | Type: ${ev.args[3]} | Issuer: ${ev.args[2]}`,
          blockNumber: ev.blockNumber,
          txHash: ev.transactionHash
        });
      }

      const grantEvents = await contract.queryFilter(contract.filters.AccessGranted());
      for (const ev of grantEvents) {
        eventList.push({
          type: 'AccessGranted',
          title: `Consent Granted: Record #${Number(ev.args[0])}`,
          desc: `Patient ${ev.args[1].slice(0, 8)}... granted Doctor ${ev.args[2].slice(0, 8)}...`,
          blockNumber: ev.blockNumber,
          txHash: ev.transactionHash
        });
      }

      const revokeEvents = await contract.queryFilter(contract.filters.AccessRevoked());
      for (const ev of revokeEvents) {
        eventList.push({
          type: 'AccessRevoked',
          title: `Consent Revoked: Record #${Number(ev.args[0])}`,
          desc: `Patient ${ev.args[1].slice(0, 8)}... revoked Doctor ${ev.args[2].slice(0, 8)}...`,
          blockNumber: ev.blockNumber,
          txHash: ev.transactionHash
        });
      }

      const accessEvents = await contract.queryFilter(contract.filters.RecordAccessed());
      for (const ev of accessEvents) {
        eventList.push({
          type: 'RecordAccessed',
          title: `Clinical Data Accessed: Record #${Number(ev.args[0])}`,
          desc: `Accessed by authorized party: ${ev.args[1]}`,
          blockNumber: ev.blockNumber,
          txHash: ev.transactionHash
        });
      }

      // Sort newest block first
      eventList.sort((a, b) => b.blockNumber - a.blockNumber);
      setEvents(eventList);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, [contract]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'UserRegistered':
        return <div className="audit-icon" style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-cyan)' }}><UserPlus size={18} /></div>;
      case 'MedicalRecordAdded':
        return <div className="audit-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)' }}><PlusCircle size={18} /></div>;
      case 'AccessGranted':
        return <div className="audit-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}><Unlock size={18} /></div>;
      case 'AccessRevoked':
        return <div className="audit-icon" style={{ background: 'rgba(244, 63, 94, 0.2)', color: 'var(--accent-rose)' }}><Lock size={18} /></div>;
      case 'RecordAccessed':
        return <div className="audit-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}><Eye size={18} /></div>;
      default:
        return <div className="audit-icon" style={{ background: 'rgba(148, 163, 184, 0.2)' }}><CheckCircle2 size={18} /></div>;
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <History size={22} color="var(--accent-cyan)" />
            Immutable Blockchain Audit Trail
          </h2>
          <p className="card-subtitle">Permanent cryptographic event logs emitted for all ledger state mutations</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchAuditEvents} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Loading on-chain event stream...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <History size={36} className="empty-icon" />
          <p>No audit events recorded on this network yet.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>Register accounts, add records, or grant consent to populate the audit trail.</p>
        </div>
      ) : (
        <div className="audit-list">
          {events.map((ev, idx) => (
            <div key={`${ev.txHash}-${idx}`} className="audit-item">
              {getEventIcon(ev.type)}
              <div className="audit-details">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="audit-title">{ev.title}</div>
                  <div className="audit-time">Block #{ev.blockNumber}</div>
                </div>
                <div className="audit-desc">{ev.desc}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontFamily: 'var(--font-mono)' }}>
                  Tx: {ev.txHash}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
