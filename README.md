# 🏥 Decentralized Healthcare Data Exchange Platform

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Development-yellow?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-Frontend-61dafb?logo=react)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
   
> **Blockchain-based healthcare data exchange prototype** using Solidity smart contracts for patient-controlled consent, medical record hash verification, role-based access, and immutable audit trails.   

> ⚠️ **Disclaimer**: This is an educational prototype using synthetic data only. Not intended for real patient data or clinical use.

---     

## 📋 Table of Contents
   
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Industry Relevance](#industry-relevance)
- [Blockchain Concepts](#blockchain-concepts)
- [Privacy Design](#privacy-design)
- [Actors & Roles](#actors--roles)
- [Architecture](#architecture)
- [On-Chain vs Off-Chain Data](#on-chain-vs-off-chain-data)
- [Smart Contract Functions](#smart-contract-functions)
- [Consent Workflow](#consent-workflow)
- [Record Verification](#record-verification)
- [Audit Trail](#audit-trail)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Remix Simulation](#remix-simulation)
- [Hardhat Testing](#hardhat-testing)
- [Optional Frontend](#optional-frontend)
- [Screenshots](#screenshots)
- [Security Considerations](#security-considerations)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Learning Outcomes](#learning-outcomes)
- [Author](#author)

---

## Overview

A **Decentralized Healthcare Data Exchange Platform** that enables patients, doctors, and hospitals to securely manage and share medical records using Ethereum blockchain technology.

The blockchain stores **only hashes, metadata, and access permissions** — actual medical documents remain **off-chain**. This ensures privacy, reduces cost, and provides an immutable audit trail of all data interactions.

---

## Problem Statement

Healthcare records are fragmented across hospitals, clinics, and labs. Patients have minimal control over who accesses their data, there's no transparent audit trail, and centralized systems are vulnerable to data breaches and tampering.

---

## Objectives

1. ✅ Role-based user registry (Patient, Doctor, Hospital)
2. ✅ Medical record hash + metadata storage on blockchain
3. ✅ Patient-controlled consent management
4. ✅ Hash-based document integrity verification
5. ✅ Immutable audit trail via Ethereum events
6. ✅ Off-chain storage simulation with synthetic records
7. ✅ Automated test suite (15 test cases)
8. ✅ Manual simulation with Remix IDE
9. ✅ Frontend dApp with role-based dashboards

---

## Industry Relevance

These concepts apply to: hospitals, diagnostic labs, insurance systems, telemedicine, EHR systems, clinical research, patient portals, and healthcare interoperability platforms.

**Key values:** Patient sovereignty, transparent consent, immutable audit trail, reduced data tampering, improved interoperability, hash-based verification.

---

## Blockchain Concepts

| Concept | How It's Used |
|---------|--------------|
| Smart Contract | `HealthcareDataExchange.sol` — automated permission enforcement |
| Solidity | Contract language (structs, mappings, enums, modifiers, events) |
| Wallet Address | Identity for patients, doctors, hospitals |
| msg.sender | Identifies the caller of each function |
| Hashing (keccak256/SHA-256) | File integrity verification |
| Events | Immutable audit trail |
| Modifiers | Role-based access control |
| Off-chain Storage | Medical files stored locally (IPFS simulated) |

---

## Privacy Design

| What's ON-CHAIN | What's OFF-CHAIN |
|----------------|-----------------|
| Record ID, Patient Address | Full medical reports |
| File Hash (32 bytes) | Diagnoses, test results |
| Record Type, Timestamp | Personal identification |
| Storage Reference (CID/path) | Confidential documents |
| Access Permissions | Patient photos, images |

> **Key Principle**: Blockchain controls access and provides auditability, but actual medical data stays off-chain for privacy and compliance.

---

## Actors & Roles

| Role | Capabilities | Restrictions |
|------|-------------|-------------|
| **Patient** | Own records, grant/revoke access, view history | Cannot add records |
| **Doctor** | View authorized records only | No access without permission |
| **Hospital** | Add medical record metadata | Cannot override patient consent |

---

## Architecture

```
┌─────────────────────────────────────────┐
│             FRONTEND (React)            │
│  Patient | Doctor | Hospital Dashboards │
└────────────────┬────────────────────────┘
                 │ Ethers.js + MetaMask
┌────────────────┴────────────────────────┐
│           BLOCKCHAIN (Ethereum)          │
│     HealthcareDataExchange.sol          │
│  • User Registry  • Record Registry    │
│  • Consent Manager • Audit Events      │
└────────────────┬────────────────────────┘
                 │ Storage Reference
┌────────────────┴────────────────────────┐
│         OFF-CHAIN STORAGE               │
│  sample_records/*.json (synthetic data) │
│  Local files / IPFS simulation          │
└─────────────────────────────────────────┘
```

---

## On-Chain vs Off-Chain Data

**On-Chain:** Record ID, Patient Address, File Hash, Record Type, Timestamp, Storage Reference, Access Permissions

**Off-Chain:** Full medical reports, diagnoses, personal identification, confidential documents

---

## Smart Contract Functions

### Registration
| Function | Access | Description |
|----------|--------|-------------|
| `registerPatient(name)` | Anyone | Register as a patient |
| `registerDoctor(name)` | Anyone | Register as a doctor |
| `registerHospital(name)` | Anyone | Register as a hospital |

### Medical Records
| Function | Access | Description |
|----------|--------|-------------|
| `addMedicalRecord(patient, type, hash, ref)` | Hospital only | Add record metadata |
| `getRecord(recordId)` | Patient or authorized doctor | View record (emits event) |
| `getPatientRecords(patient)` | Anyone | Get list of record IDs |

### Consent Management
| Function | Access | Description |
|----------|--------|-------------|
| `grantAccess(doctor, recordId)` | Record owner (patient) | Grant doctor access |
| `revokeAccess(doctor, recordId)` | Record owner (patient) | Revoke doctor access |
| `hasAccess(doctor, recordId)` | Anyone | Check permission status |

### Verification
| Function | Access | Description |
|----------|--------|-------------|
| `verifyRecordHash(recordId, hash)` | Anyone | Compare hash with stored hash |

---

## Consent Workflow

```
Patient → grantAccess(doctor, recordId) → Permission = TRUE → AccessGranted event
Patient → revokeAccess(doctor, recordId) → Permission = FALSE → AccessRevoked event
Doctor → getRecord(recordId) → Contract checks permission → Allow/Deny + event
```

---

## Record Verification

```
File → SHA-256 Hash → Store hash on-chain
Later: File → SHA-256 Hash → Compare with on-chain hash
Match = ✅ File authentic | Mismatch = ❌ Tampered
```

---

## Audit Trail

| Event | When Emitted |
|-------|-------------|
| `UserRegistered` | New user registers |
| `MedicalRecordAdded` | Hospital adds a record |
| `AccessGranted` | Patient grants doctor access |
| `AccessRevoked` | Patient revokes doctor access |
| `RecordAccessed` | Authorized user views a record |

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Solidity 0.8.20 |
| Development | Hardhat |
| Testing | Chai + Ethers.js |
| Frontend | React + Vite |
| Wallet | MetaMask |
| Blockchain | Local Hardhat Network / Remix VM |

---

## Folder Structure

```
Decentralized-Healthcare-Data-Exchange/
├── contracts/
│   └── HealthcareDataExchange.sol      # Smart contract
├── scripts/
│   ├── deploy.js                       # Deployment script
│   ├── generate-hash.js                # File hash generator
│   └── verify-hash.js                  # Hash verification
├── test/
│   └── HealthcareDataExchange.test.js  # 15 automated tests
├── frontend/                           # React dApp
├── sample_records/                     # Synthetic medical records
│   ├── medical_record_001.json         # Lab Report
│   ├── medical_record_002.json         # Prescription
│   ├── medical_record_003.json         # Discharge Summary
│   ├── medical_record_004.json         # Vaccination Record
│   └── medical_record_005.json         # Imaging Report
├── hashes/                             # Generated file hashes
├── screenshots/                        # Proof screenshots
├── reports/                            # Project report
├── docs/                               # Documentation
├── README.md
├── hardhat.config.js
├── package.json
└── .gitignore
```

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) browser extension (for frontend)

### Setup
```bash
# Clone the repository
git clone https://github.com/adarshsrivastav23905/Decentralized-Healthcare-Data-Exchange-Platform.git
cd Decentralized-Healthcare-Data-Exchange-Platform

# Install dependencies
npm install

# Compile the smart contract
npx hardhat compile

# Run automated tests
npx hardhat test

# Start local blockchain node
npx hardhat node

# Deploy contract (in a new terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Hash Generation
```bash
# Generate hash for a sample record
node scripts/generate-hash.js sample_records/medical_record_001.json

# Verify hash integrity
node scripts/verify-hash.js sample_records/medical_record_001.json
```

---

## Remix Simulation

See [docs/REMIX_SIMULATION.md](docs/REMIX_SIMULATION.md) for a detailed 14-step walkthrough.

Quick steps:
1. Open [Remix IDE](https://remix.ethereum.org)
2. Create and paste `HealthcareDataExchange.sol`
3. Compile (Solidity 0.8.20)
4. Deploy on Remix VM
5. Register Patient (Account 1), Doctor (Account 2), Hospital (Account 3)
6. Hospital adds record → Doctor denied → Patient grants → Doctor allowed → Patient revokes → Doctor denied again
7. Check event logs for complete audit trail

---

## Hardhat Testing

```bash
npx hardhat test
```

15 test cases covering:
- ✅ User registration (Patient, Doctor, Hospital)
- ✅ Duplicate registration rejection
- ✅ Medical record creation
- ✅ Unauthorized access prevention
- ✅ Consent grant and revocation
- ✅ Post-revocation access denial
- ✅ Hash verification (match & mismatch)
- ✅ Event emission verification

---

## Optional Frontend

```bash
cd frontend
npm install
npm run dev
```

Features:
- **Patient Dashboard**: View records, grant/revoke doctor access
- **Doctor Dashboard**: View authorized records
- **Hospital Dashboard**: Add medical records
- **Audit Panel**: View event history
- **Wallet Connection**: MetaMask integration

---

## Screenshots

See [docs/PROOF_CHECKLIST.md](docs/PROOF_CHECKLIST.md) for a complete list of 20 screenshots to capture.

---

## Security Considerations

- ✅ Role-based access control via Solidity modifiers
- ✅ Input validation with `require()` statements
- ✅ Solidity 0.8.20 overflow/underflow protection
- ✅ No ETH transfers (no reentrancy risk)
- ⚠️ Public blockchain metadata is visible
- ⚠️ No encryption in this prototype
- ⚠️ Revocation doesn't delete already-downloaded data

See [docs/SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md) for full analysis.

---

## Limitations

1. Educational prototype — not production-ready
2. No encryption of off-chain files
3. Metadata leakage on public blockchain
4. No key recovery mechanism
5. Scalability constraints on Ethereum mainnet
6. Cannot control data after download
7. Not compliant with specific healthcare regulations

---

## Future Improvements

1. AES-256 encryption for off-chain files
2. Real IPFS integration
3. Decentralized Identity (DID)
4. Emergency access workflow
5. Permission expiry dates
6. Zero-knowledge proofs
7. Layer 2 scaling solutions
8. HL7 FHIR standard integration
9. Mobile wallet application
10. Multi-signature approval

---

## Learning Outcomes

Through this project, I learned:
- Solidity smart contract development
- Role-based access control on blockchain
- Off-chain storage patterns
- Hash-based integrity verification
- Ethereum event system for audit trails
- Hardhat testing framework
- dApp development with React and Ethers.js
- Privacy and security analysis for blockchain systems
- Professional project documentation

---

## Author

**Adarsh Srivastav**  
GitHub: [@adarshsrivastav23905](https://github.com/adarshsrivastav23905)  
Diploma Course — Blockchain Technology

---

## License

This project is licensed under the MIT License.

---

*⚠️ This is an educational prototype using synthetic/dummy data only. No real patient data is stored or processed. Not intended for use in production healthcare environments.*
