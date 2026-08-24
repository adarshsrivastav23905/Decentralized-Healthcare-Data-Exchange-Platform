import React, { useState } from 'react';
import { UserPlus, UserCheck, Stethoscope, Building2, ShieldAlert } from 'lucide-react';

export default function RoleRegistration({ contract, onRegistered }) {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a valid name or organization title');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let tx;
      if (selectedRole === 'Patient') {
        tx = await contract.registerPatient(name.trim());
      } else if (selectedRole === 'Doctor') {
        tx = await contract.registerDoctor(name.trim());
      } else if (selectedRole === 'Hospital') {
        tx = await contract.registerHospital(name.trim());
      }
      await tx.wait();
      setName('');
      if (onRegistered) onRegistered();
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err?.reason || err?.message || 'Transaction failed or was rejected');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <UserPlus size={22} color="var(--accent-cyan)" />
            Account Registration
          </h2>
          <p className="card-subtitle">Register your connected wallet with a specific healthcare role</p>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-warning">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label">Select Your Role</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn ${selectedRole === 'Patient' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flexDirection: 'column', padding: '1rem 0.5rem', gap: '0.4rem' }}
              onClick={() => setSelectedRole('Patient')}
            >
              <UserCheck size={20} />
              <span>Patient</span>
            </button>
            <button
              type="button"
              className={`btn ${selectedRole === 'Doctor' ? 'btn-emerald' : 'btn-outline'}`}
              style={{ flexDirection: 'column', padding: '1rem 0.5rem', gap: '0.4rem' }}
              onClick={() => setSelectedRole('Doctor')}
            >
              <Stethoscope size={20} />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              className={`btn ${selectedRole === 'Hospital' ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                flexDirection: 'column', 
                padding: '1rem 0.5rem', 
                gap: '0.4rem',
                background: selectedRole === 'Hospital' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent' 
              }}
              onClick={() => setSelectedRole('Hospital')}
            >
              <Building2 size={20} />
              <span>Hospital</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Full Name / Facility Name</label>
          <input
            type="text"
            className="form-input"
            placeholder={selectedRole === 'Hospital' ? 'e.g., Metro Medical Center' : selectedRole === 'Doctor' ? 'e.g., Dr. Sarah Smith' : 'e.g., John Doe'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Processing Transaction...' : `Register as ${selectedRole}`}
        </button>
      </form>
    </div>
  );
}
