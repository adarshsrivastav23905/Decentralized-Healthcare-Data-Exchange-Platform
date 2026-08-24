# Decentralized Healthcare Data Exchange Platform — Project Report

---

## Abstract

This project presents a **Decentralized Healthcare Data Exchange Platform** built on Ethereum blockchain technology using Solidity smart contracts. The platform addresses the critical challenge of secure, patient-controlled medical record sharing across healthcare providers. By storing only cryptographic hashes, metadata, and access permissions on-chain — while keeping actual medical documents off-chain — the system provides an immutable audit trail, transparent consent management, and tamper-proof record verification without compromising patient privacy. The prototype demonstrates role-based access control for patients, doctors, and hospitals, automated consent enforcement through smart contracts, and hash-based integrity verification of medical documents. All data used in this project is synthetic and generated for educational demonstration purposes.

---

## 1. Introduction

The healthcare industry generates enormous volumes of patient data daily — from lab reports and prescriptions to imaging studies and discharge summaries. Despite advances in digital health, exchanging this data between providers remains a significant challenge. Patients often lack visibility into who accesses their records, and healthcare providers struggle with incompatible data systems.

Blockchain technology offers a novel approach to this problem by providing a decentralized, immutable, and transparent platform for managing medical record access and verification. This project explores how Ethereum smart contracts can be used to build a patient-controlled healthcare data exchange system.

---

## 2. Problem Statement

Current healthcare data management suffers from:
1. **Fragmented records** across multiple hospitals and systems
2. **Lack of patient control** over data access
3. **No transparent audit trail** for who accessed what and when
4. **Risk of data tampering** in centralized databases
5. **Interoperability challenges** between different Electronic Health Record (EHR) systems
6. **Privacy concerns** with centralized storage being a single point of breach

---

## 3. Existing Healthcare Data Systems

| System | Limitation |
|--------|-----------|
| Hospital EHR Systems | Siloed within individual hospitals; limited sharing |
| Health Information Exchanges (HIE) | Centralized intermediary; single point of failure |
| Cloud-based Patient Portals | Controlled by vendors; limited patient sovereignty |
| Paper Records | Not searchable, easily lost or tampered with |
| Direct Provider-to-Provider Sharing | Manual, slow, and inconsistent |

---

## 4. Challenges

- Different hospitals use incompatible EHR systems
- Patients must repeatedly share their history with each new provider
- No standardized mechanism for patients to grant/revoke consent digitally
- Audit logs in centralized systems can be modified by administrators
- Data breaches expose millions of patient records annually
- Compliance with HIPAA, GDPR, and local regulations adds complexity

---

## 5. Proposed Blockchain Solution

A decentralized platform where:
- **Patients** control access to their medical records via Ethereum wallets
- **Hospitals** create medical record metadata entries (hashes and references) on-chain
- **Doctors** access records only with explicit patient consent
- **Smart contracts** automatically enforce access rules
- **Events** create an immutable audit trail of all actions
- **Hashes** verify that off-chain documents haven't been tampered with
- **Actual medical data** remains off-chain for privacy and cost efficiency

---

## 6. Objectives

1. Design and implement a role-based user registry (Patient, Doctor, Hospital)
2. Create a medical record metadata storage system on blockchain
3. Implement patient-controlled consent management (grant/revoke access)
4. Build hash-based integrity verification for off-chain medical records
5. Generate an immutable audit trail using Ethereum events
6. Demonstrate the complete workflow through automated tests and manual simulation
7. Create a professional GitHub portfolio project

---

## 7. Architecture

The system consists of three layers:

### Frontend Layer
- Patient Dashboard: View records, manage permissions
- Doctor Dashboard: Access authorized records
- Hospital Dashboard: Add new medical record entries

### Blockchain Layer
- Smart contract (`HealthcareDataExchange.sol`) handling:
  - User/Role Registry
  - Medical Record Registry
  - Consent Manager
  - Audit Events

### Off-Chain Layer
- Synthetic medical record files (JSON format)
- Hash generation and verification utilities
- Simulated IPFS references

---

## 8. Roles

| Role | Capabilities | Restrictions |
|------|-------------|-------------|
| Patient | Own records, grant/revoke access, view audit history | Cannot add records |
| Doctor | View authorized records | Cannot access without permission |
| Hospital | Add medical record metadata | Cannot override patient consent |
| Admin | Contract deployer | No special access to medical data |

---

## 9. Smart Contract Design

### Key Components:

**Enums:**
- `Role { None, Patient, Doctor, Hospital }`

**Structs:**
- `User { address, name, role, isRegistered }`
- `MedicalRecord { recordId, patient, createdBy, recordType, fileHash, storageReference, timestamp, active }`

**Mappings:**
- `users`: address → User
- `records`: uint256 → MedicalRecord
- `patientRecordIds`: address → uint256[]
- `accessPermissions`: uint256 → (address → bool)

**Functions:**
- `registerPatient()`, `registerDoctor()`, `registerHospital()`
- `addMedicalRecord()`, `getRecord()`, `getPatientRecords()`
- `grantAccess()`, `revokeAccess()`, `hasAccess()`
- `verifyRecordHash()`, `getUserInfo()`, `getRecordCount()`

**Modifiers:**
- `onlyPatient`, `onlyDoctor`, `onlyHospital`, `onlyRegistered`, `recordExists`, `onlyRecordOwner`

---

## 10. Consent Model

The consent system implements:
1. **Explicit Consent**: Patients must actively call `grantAccess()` — no implicit permissions
2. **Granular Consent**: Access is granted per-record, per-doctor
3. **Revocable Consent**: Patients can revoke access at any time via `revokeAccess()`
4. **Automatic Self-Access**: Patients always have access to their own records
5. **Audited Consent**: Every grant and revocation emits a blockchain event

---

## 11. Off-Chain Storage

Medical files are stored off-chain because:
- **Cost**: On-chain storage is extremely expensive
- **Privacy**: Public blockchain data is visible to all nodes
- **Regulations**: Laws require ability to delete personal data
- **Size**: Medical files can be very large (especially imaging)

The system stores only a SHA-256 hash and a storage reference (simulating an IPFS CID) on-chain. Five synthetic medical record files demonstrate this approach.

---

## 12. Hash Verification

The hash verification process:
1. A medical file is created (JSON format)
2. SHA-256 hash is generated and stored on-chain via `addMedicalRecord()`
3. To verify integrity, the file is re-hashed and compared with the on-chain hash
4. Match = file is authentic; Mismatch = file has been tampered with

The `verifyRecordHash()` function enables this comparison directly on-chain.

---

## 13. Audit Trail

Five event types provide a complete audit trail:
1. `UserRegistered` — New user registered with role
2. `MedicalRecordAdded` — Hospital added a record for a patient
3. `AccessGranted` — Patient gave a doctor permission
4. `AccessRevoked` — Patient removed a doctor's permission
5. `RecordAccessed` — An authorized user accessed a record

All events are indexed for efficient querying and are permanently stored on the blockchain.

---

## 14. Implementation

### Technology Stack:
| Component | Technology |
|-----------|-----------|
| Smart Contract | Solidity 0.8.20 |
| Development Framework | Hardhat |
| Testing | Chai + Ethers.js |
| Frontend | React + Vite |
| Blockchain Interaction | Ethers.js v6 |
| Wallet | MetaMask |
| Off-Chain Storage | Local files (IPFS simulated) |

### Development Environment:
- Node.js + npm
- Hardhat for compilation, testing, and deployment
- Remix IDE for manual simulation

---

## 15. Testing

15 automated test cases were created using Hardhat and Chai:

| # | Test Case | Result |
|---|-----------|--------|
| 1 | Patient registration | ✅ Pass |
| 2 | Doctor registration | ✅ Pass |
| 3 | Hospital registration | ✅ Pass |
| 4 | Duplicate registration rejected | ✅ Pass |
| 5 | Hospital adds record | ✅ Pass |
| 6 | Non-hospital record creation rejected | ✅ Pass |
| 7 | Invalid patient address rejected | ✅ Pass |
| 8 | Doctor access without permission denied | ✅ Pass |
| 9 | Patient grants access | ✅ Pass |
| 10 | Authorized doctor accesses record | ✅ Pass |
| 11 | Patient revokes access | ✅ Pass |
| 12 | Access denied after revocation | ✅ Pass |
| 13 | Invalid record ID rejected | ✅ Pass |
| 14 | Hash verification (match) | ✅ Pass |
| 15 | Hash verification (mismatch) | ✅ Pass |

---

## 16. Simulation

The contract was tested manually using Remix IDE with three accounts:
- Account 1: Patient
- Account 2: Doctor
- Account 3: Hospital

All 14 simulation steps were executed successfully, demonstrating the complete workflow from registration through access control to audit trail verification.

---

## 17. Privacy Considerations

- Only hashes and metadata are stored on-chain — never actual medical data
- Metadata (record types, timestamps) can still leak information; production systems would encrypt this
- Wallet addresses can be linked to identities through blockchain analysis
- This prototype uses synthetic data only

---

## 18. Security Considerations

- Solidity 0.8.20 provides built-in overflow/underflow protection
- Role-based modifiers prevent unauthorized actions
- `require()` statements validate all inputs
- No ETH transfers in the contract eliminate reentrancy risk
- The contract is not upgradeable — production would use proxy patterns
- Key management remains a critical concern for wallet-based identity

---

## 19. Results

The prototype successfully demonstrates:
1. ✅ Patient-controlled medical record access
2. ✅ Role-based permission enforcement
3. ✅ Hash-based document integrity verification
4. ✅ Immutable audit trail generation
5. ✅ Consent grant and revocation
6. ✅ Unauthorized access prevention
7. ✅ Complete automated test coverage

---

## 20. Applications

The concepts demonstrated can be applied to:
- Hospital data exchange
- Diagnostic laboratory report verification
- Insurance claim processing
- Telemedicine record sharing
- Clinical research consent management
- Healthcare interoperability platforms
- Patient portal systems

---

## 21. Advantages

1. Patient sovereignty over medical data
2. Transparent, tamper-proof audit trail
3. Automated consent enforcement (no manual intervention)
4. Cross-institution data verification
5. Reduced data duplication
6. No single point of failure
7. Wallet-based identity (no username/password)

---

## 22. Limitations

1. This is an educational prototype, not a production system
2. No encryption of off-chain files
3. Metadata leakage on public blockchain
4. No key recovery mechanism
5. Scalability constraints on Ethereum mainnet
6. Cannot revoke access to already-downloaded data
7. Not compliant with specific healthcare regulations (HIPAA, GDPR)
8. Single smart contract architecture

---

## 23. Future Scope

1. AES-256 encryption for off-chain medical records
2. Real IPFS integration for decentralized file storage
3. Decentralized Identity (DID) for professional verification
4. Emergency access workflow for critical care scenarios
5. Permission expiry dates
6. Zero-knowledge proofs for selective disclosure
7. Layer 2 scaling solutions for higher throughput
8. Multi-signature approval for sensitive operations
9. Integration with HL7 FHIR standards
10. Mobile wallet application

---

## 24. Conclusion

This project successfully demonstrates how blockchain technology can be applied to healthcare data exchange by providing patient-controlled access, immutable audit trails, and document integrity verification. While the prototype uses synthetic data and has known limitations, it illustrates the core principles and design patterns used in production blockchain healthcare systems. The combination of on-chain metadata with off-chain storage addresses both the cost and privacy challenges of storing medical data on public blockchains.

The project serves as proof of work for blockchain development skills, demonstrating proficiency in Solidity smart contract development, automated testing, decentralized application architecture, and security-conscious design.

---

*Disclaimer: This is an educational prototype. All medical data is synthetic and generated for demonstration purposes only. This system is not intended for use with real patient data or in a clinical setting.*
