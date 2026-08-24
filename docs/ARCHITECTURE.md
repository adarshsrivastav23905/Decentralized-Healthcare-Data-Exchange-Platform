# 5️⃣ & 6️⃣ Project Architecture & Actor Design

## Project Actors

### Roles & Permissions

| Permission | Patient | Doctor | Hospital | Admin (Optional) |
|-----------|---------|--------|----------|-----------------|
| Register self | ✅ | ✅ | ✅ | — |
| Own/control records | ✅ | ❌ | ❌ | ❌ |
| Grant doctor access | ✅ | ❌ | ❌ | ❌ |
| Revoke doctor access | ✅ | ❌ | ❌ | ❌ |
| View own records | ✅ | ❌ | ❌ | ❌ |
| View audit history | ✅ | ✅ (own actions) | ✅ (own actions) | ✅ |
| View authorized records | ❌ | ✅ (if granted) | ❌ | ❌ |
| Access unauthorized records | ❌ | ❌ | ❌ | ❌ |
| Add medical record | ❌ | ❌ | ✅ | ❌ |
| Override patient consent | ❌ | ❌ | ❌ | ❌ |
| Register verified hospitals | ❌ | ❌ | ❌ | ✅ (optional) |

---

### PATIENT
- **Identity**: Ethereum wallet address
- **Primary Role**: Data owner and access controller
- **Capabilities**:
  - Register as a patient with a display name
  - View all their own medical records
  - Grant specific doctors access to specific records
  - Revoke previously granted access
  - View permission status for their records
  - View audit history (via blockchain events)

### DOCTOR
- **Identity**: Ethereum wallet address
- **Primary Role**: Authorized data viewer
- **Capabilities**:
  - Register as a doctor with a display name
  - View records for which the patient has granted permission
  - Cannot access any record without explicit patient consent
  - Cannot add, modify, or delete medical records

### HOSPITAL
- **Identity**: Ethereum wallet address
- **Primary Role**: Record creator
- **Capabilities**:
  - Register as a hospital with a display name
  - Add new medical record entries for registered patients
  - Cannot view patient records (unless separate permission is implemented)
  - Cannot override patient consent decisions

### ADMIN (Optional)
- **Identity**: Contract deployer's wallet address
- **Primary Role**: System governance
- **Capabilities**:
  - Could be extended to verify/approve hospital and doctor registrations
  - Does NOT have unrestricted access to medical records
  - Does NOT override patient consent

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Patient     │  │   Doctor     │  │    Hospital       │   │
│  │  Dashboard    │  │  Dashboard   │  │   Dashboard       │   │
│  │              │  │              │  │                    │   │
│  │ • View Recs  │  │ • Enter Addr │  │ • Add Record      │   │
│  │ • Grant/     │  │ • View Auth  │  │ • Enter Hash      │   │
│  │   Revoke     │  │   Records   │  │ • Enter Reference  │   │
│  │ • View Perms │  │              │  │                    │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                 │                    │              │
│         └─────────────────┼────────────────────┘              │
│                           │                                   │
│                    ┌──────┴──────┐                            │
│                    │  MetaMask   │                            │
│                    │  (Wallet)   │                            │
│                    └──────┬──────┘                            │
└───────────────────────────┼──────────────────────────────────┘
                            │
                     Ethers.js / Web3
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    BLOCKCHAIN LAYER                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           HealthcareDataExchange.sol                    │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ User/Role   │  │  Medical     │  │   Consent    │  │  │
│  │  │ Registry    │  │  Record      │  │   Manager    │  │  │
│  │  │             │  │  Registry    │  │              │  │  │
│  │  │ • register  │  │ • addRecord  │  │ • grant      │  │  │
│  │  │   Patient   │  │ • getRecord  │  │ • revoke     │  │  │
│  │  │ • register  │  │ • getPatient │  │ • hasAccess  │  │  │
│  │  │   Doctor    │  │   Records   │  │              │  │  │
│  │  │ • register  │  │ • verify    │  │              │  │  │
│  │  │   Hospital  │  │   Hash      │  │              │  │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │                 AUDIT EVENTS                      │  │  │
│  │  │ UserRegistered | MedicalRecordAdded |             │  │  │
│  │  │ AccessGranted | AccessRevoked | RecordAccessed    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            │
                     Storage Reference
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                    OFF-CHAIN LAYER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               sample_records/                          │  │
│  │                                                        │  │
│  │  medical_record_001.json  (Lab Report)                 │  │
│  │  medical_record_002.json  (Prescription)               │  │
│  │  medical_record_003.json  (Discharge Summary)          │  │
│  │  medical_record_004.json  (Vaccination Record)         │  │
│  │  medical_record_005.json  (Imaging Report)             │  │
│  │                                                        │  │
│  │  ⚠️ All files contain SYNTHETIC/DUMMY data only        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  In production: IPFS, encrypted cloud storage, or hospital   │
│  internal systems would replace local files                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Stored ON-CHAIN

| Field | Type | Description |
|-------|------|-------------|
| Record ID | `uint256` | Unique auto-incrementing identifier |
| Patient Address | `address` | Wallet address of the patient |
| Created By | `address` | Wallet address of the hospital |
| Record Type | `string` | Category: "Lab Report", "Prescription", etc. |
| File Hash | `bytes32` | SHA-256 hash of the off-chain file |
| Storage Reference | `string` | Off-chain location (IPFS CID, file path) |
| Timestamp | `uint256` | Block timestamp of record creation |
| Active Status | `bool` | Whether the record is currently active |
| Access Permissions | `mapping` | Which doctors have access to which records |

## Data NOT Stored ON-CHAIN

| Data Type | Reason |
|-----------|--------|
| Full medical reports | Too large, too expensive, privacy risk |
| Diagnoses & test results | Sensitive medical information |
| Personal identification (SSN, Aadhaar) | Legal restrictions |
| Patient photos or images | Large file size, privacy |
| Confidential doctor notes | Sensitive |

---

## Data Flow

```
1. RECORD CREATION FLOW
   Hospital → addMedicalRecord() → On-chain metadata + hash
                                    Off-chain file stored locally/IPFS

2. PERMISSION FLOW
   Patient → grantAccess(doctor, recordId) → Permission = true
   Patient → revokeAccess(doctor, recordId) → Permission = false

3. ACCESS FLOW
   Doctor → getRecord(recordId) → Contract checks permission
                                   ✅ Allowed → Return metadata + emit event
                                   ❌ Denied → Transaction reverts

4. VERIFICATION FLOW
   Anyone → verifyRecordHash(recordId, hash) → true/false
           Hash of off-chain file → Compare with on-chain hash
           Match = ✅ File intact | Mismatch = ❌ Tampered

5. AUDIT FLOW
   Every action → Emit Event → Permanently recorded on blockchain
   Query events → Full history of all actions
```

---

## Folder Structure Explanation

```
Decentralized-Healthcare-Data-Exchange/
│
├── contracts/                          # Solidity smart contracts
│   └── HealthcareDataExchange.sol      # Main contract with all logic
│
├── scripts/                            # Deployment and utility scripts
│   ├── deploy.js                       # Contract deployment script
│   ├── generate-hash.js                # Generate file hash for on-chain storage
│   └── verify-hash.js                  # Verify file integrity via hash comparison
│
├── test/                               # Automated test cases
│   └── HealthcareDataExchange.test.js  # 15 test cases using Hardhat + Chai
│
├── frontend/                           # React dApp (optional)
│   ├── src/                            # Source code
│   └── components/                     # React components (dashboards)
│
├── sample_records/                     # Synthetic medical record files
│   ├── medical_record_001.json         # Lab Report (dummy)
│   ├── medical_record_002.json         # Prescription (dummy)
│   ├── medical_record_003.json         # Discharge Summary (dummy)
│   ├── medical_record_004.json         # Vaccination Record (dummy)
│   └── medical_record_005.json         # Imaging Report (dummy)
│
├── hashes/                             # Generated file hashes
├── screenshots/                        # Proof screenshots
├── reports/                            # Project report
├── docs/                               # Documentation
│
├── README.md                           # Project overview
├── hardhat.config.js                   # Hardhat configuration
├── package.json                        # Node.js dependencies
└── .gitignore                          # Git ignore rules
```
