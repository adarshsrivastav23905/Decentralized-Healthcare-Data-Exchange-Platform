import React from 'react';
import { Activity, Shield, Wallet, CheckCircle2, UserCircle2 } from 'lucide-react';
import { ROLE_NAMES } from '../contractConfig';

export default function Navbar({ account, userProfile, isConnecting, onConnect }) {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 1: return 'badge-patient';
      case 2: return 'badge-doctor';
      case 3: return 'badge-hospital';
      default: return 'badge-neutral';
    }
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <a href="#" className="brand">
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <div>
            <div>HealthVault<span style={{ color: 'var(--accent-cyan)' }}>.io</span></div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>Decentralized Data Exchange</div>
          </div>
        </a>

        <div className="nav-actions">
          {account ? (
            <>
              {userProfile && userProfile.isRegistered ? (
                <span className={`badge ${getRoleBadgeClass(userProfile.role)}`}>
                  <Shield size={12} />
                  {ROLE_NAMES[userProfile.role]} ({userProfile.name})
                </span>
              ) : (
                <span className="badge badge-neutral">
                  <UserCircle2 size={12} />
                  Not Registered
                </span>
              )}

              <div className="address-pill">
                <CheckCircle2 size={14} color="#10b981" />
                <span>{formatAddress(account)}</span>
              </div>
            </>
          ) : (
            <button 
              className="btn btn-primary btn-sm" 
              onClick={onConnect} 
              disabled={isConnecting}
            >
              <Wallet size={16} />
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
