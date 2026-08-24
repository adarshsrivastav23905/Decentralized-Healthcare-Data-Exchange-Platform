import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Activity, 
  UserCheck, 
  Stethoscope, 
  Building2, 
  History, 
  FileCheck, 
  UserPlus, 
  ShieldAlert, 
  Wallet,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

import Navbar from './components/Navbar';
import RoleRegistration from './components/RoleRegistration';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import AuditPanel from './components/AuditPanel';
import HashVerifier from './components/HashVerifier';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('patient');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMsg('MetaMask is not installed. Please install MetaMask to interact with this dApp.');
      return;
    }

    setIsConnecting(true);
    setErrorMsg('');

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const activeSigner = await browserProvider.getSigner();
      const instance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, activeSigner);

      setProvider(browserProvider);
      setSigner(activeSigner);
      setContract(instance);
      setAccount(accounts[0]);

      // Load user profile
      await loadUserProfile(instance, accounts[0]);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setErrorMsg(err?.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadUserProfile = async (instance, userAddr) => {
    try {
      const profile = await instance.getUserInfo(userAddr);
      const formatted = {
        userAddress: profile.userAddress,
        name: profile.name,
        role: Number(profile.role),
        isRegistered: profile.isRegistered
      };
      setUserProfile(formatted);

      // Auto-switch tab based on registered role
      if (formatted.isRegistered) {
        if (formatted.role === 1) setActiveTab('patient');
        else if (formatted.role === 2) setActiveTab('doctor');
        else if (formatted.role === 3) setActiveTab('hospital');
      } else {
        setActiveTab('register');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  // Listen for account/network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          setAccount('');
          setUserProfile(null);
          setContract(null);
        }
      });
    }
  }, []);

  return (
    <div className="app-container">
      <Navbar 
        account={account} 
        userProfile={userProfile} 
        isConnecting={isConnecting}
        onConnect={connectWallet}
      />

      <main className="main-content">
        {/* Banner Alert if any */}
        {errorMsg && (
          <div className="alert-banner alert-warning">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hero banner for not-connected state */}
        {!account && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(59, 130, 246, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <Activity size={32} color="var(--accent-cyan)" />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              Decentralized Healthcare Data Exchange
            </h1>
            <p style={{ maxWidth: '640px', margin: '0 auto 2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              A blockchain-native trust layer for patient consent sovereignty, off-chain medical record fingerprinting, and cryptographic auditability on Ethereum.
            </p>
            <button className="btn btn-primary" onClick={connectWallet} disabled={isConnecting} style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              <Wallet size={18} />
              {isConnecting ? 'Connecting...' : 'Connect Wallet to Launch Platform'}
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'patient' ? 'active' : ''}`}
            onClick={() => setActiveTab('patient')}
          >
            <UserCheck size={16} />
            <span>Patient Portal</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'doctor' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctor')}
          >
            <Stethoscope size={16} />
            <span>Doctor Portal</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospital')}
          >
            <Building2 size={16} />
            <span>Hospital Anchor</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'verifier' ? 'active' : ''}`}
            onClick={() => setActiveTab('verifier')}
          >
            <FileCheck size={16} />
            <span>Tamper Verifier</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <History size={16} />
            <span>Audit Trail</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <UserPlus size={16} />
            <span>Register Role</span>
          </button>
        </div>

        {/* Tab Views */}
        {!contract ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Wallet size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Wallet Disconnected</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Please connect MetaMask to read or execute smart contract transactions.
            </p>
            <button className="btn btn-primary btn-sm" onClick={connectWallet} disabled={isConnecting}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'patient' && (
              <PatientDashboard contract={contract} account={account} />
            )}

            {activeTab === 'doctor' && (
              <DoctorDashboard contract={contract} />
            )}

            {activeTab === 'hospital' && (
              <HospitalDashboard contract={contract} />
            )}

            {activeTab === 'verifier' && (
              <HashVerifier contract={contract} />
            )}

            {activeTab === 'audit' && (
              <AuditPanel contract={contract} />
            )}

            {activeTab === 'register' && (
              <RoleRegistration 
                contract={contract} 
                onRegistered={() => loadUserProfile(contract, account)}
              />
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <div>
          Decentralized Healthcare Data Exchange Platform &bull; Built with Solidity 0.8.20 &bull; Ethereum Hardhat &bull; Ethers.js v6
        </div>
        <div style={{ marginTop: '0.4rem', color: 'var(--text-muted)' }}>
          🔒 Synthetic Education Prototype &bull; Zero sensitive health information stored directly on public blockchain
        </div>
      </footer>
    </div>
  );
}
