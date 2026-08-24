# 2️⃣0️⃣ & 2️⃣1️⃣ Proof-Building Strategy & Screenshot Checklist

---

## Day-Wise Proof Building Plan

### DAY 1: Architecture & Setup
**Files:** `docs/ARCHITECTURE.md`, `docs/PROJECT_EXPLANATION.md`, `package.json`, `hardhat.config.js`, `.gitignore`
**Commit:** `"Initialize healthcare blockchain project"`
**Screenshot:** `screenshots/01_project_folder_structure.png`
**What it proves:** Project is properly structured with professional folder layout

---

### DAY 2: Role Registry
**Files:** `contracts/HealthcareDataExchange.sol` (registration functions + Role enum + User struct)
**Commit:** `"Add role-based user registry (Patient, Doctor, Hospital)"`
**Screenshots:**
- `screenshots/02_solidity_contract_code.png` — Contract code in editor
- `screenshots/03_successful_compilation.png` — Contract compiles without errors

---

### DAY 3: Medical Record Registry
**Files:** `contracts/HealthcareDataExchange.sol` (MedicalRecord struct + addMedicalRecord)
**Commit:** `"Implement medical record hash storage"`
**Screenshot:** `screenshots/04_contract_deployment.png` — Contract deployed in Remix VM

---

### DAY 4: Hash-Based Verification
**Files:** `scripts/generate-hash.js`, `scripts/verify-hash.js`, `sample_records/*.json`
**Commit:** `"Add off-chain record hash generation and verification"`
**Screenshots:**
- `screenshots/05_dummy_record_file.png` — Sample JSON medical record
- `screenshots/06_hash_generation_output.png` — Hash generated from file

---

### DAY 5: Patient Consent
**Files:** `contracts/HealthcareDataExchange.sol` (grantAccess, consent logic)
**Commit:** `"Add patient consent management (grant/revoke access)"`
**Screenshots:**
- `screenshots/07_patient_registration.png` — Patient registered in Remix
- `screenshots/08_doctor_registration.png` — Doctor registered in Remix
- `screenshots/09_hospital_registration.png` — Hospital registered in Remix

---

### DAY 6: Access Revocation
**Files:** `contracts/HealthcareDataExchange.sol` (revokeAccess, hasAccess)
**Commit:** `"Implement access verification and hash checking"`
**Screenshots:**
- `screenshots/10_medical_record_added.png` — Hospital adds record via Remix
- `screenshots/11_unauthorized_access_rejected.png` — Doctor denied before grant
- `screenshots/12_patient_grants_access.png` — Patient grants doctor access
- `screenshots/13_authorized_access.png` — Doctor successfully accesses record

---

### DAY 7: Audit Events
**Files:** `contracts/HealthcareDataExchange.sol` (all events finalized)
**Commit:** `"Add healthcare audit events for all actions"`
**Screenshots:**
- `screenshots/14_patient_revokes_access.png` — Patient revokes access
- `screenshots/15_access_rejected_after_revocation.png` — Doctor denied after revoke
- `screenshots/16_event_logs.png` — Remix event/log output showing audit trail

---

### DAY 8: Hardhat Tests
**Files:** `test/HealthcareDataExchange.test.js`, `scripts/deploy.js`
**Commit:** `"Add Hardhat test suite (15 test cases)"`
**Screenshot:** `screenshots/17_hardhat_test_results.png` — All 15 tests passing

---

### DAY 9: Remix Simulation
**Files:** `docs/REMIX_SIMULATION.md`
**Commit:** `"Add Remix simulation proof and screenshots"`
**Screenshot:** Collection of all Remix screenshots verifying the complete workflow

---

### DAY 10: Frontend (Optional)
**Files:** `frontend/` directory
**Commit:** `"Add React frontend dApp with role-based dashboards"`
**Screenshot:** `screenshots/18_frontend_dapp.png` — Frontend UI screenshot

---

### DAY 11: README & GitHub
**Files:** `README.md`, `docs/GITHUB_STRATEGY.md`, `reports/PROJECT_REPORT.md`
**Commit:** `"Complete README and documentation"`
**Screenshots:**
- `screenshots/19_github_repository.png` — GitHub repo page
- `screenshots/20_readme_preview.png` — README rendering on GitHub

---

## Complete Screenshot Checklist

| # | Screenshot | Filename | What It Proves |
|---|-----------|----------|---------------|
| 1 | Project folder structure | `01_project_folder_structure.png` | Professional project organization |
| 2 | Solidity contract code | `02_solidity_contract_code.png` | Contract was written |
| 3 | Successful compilation | `03_successful_compilation.png` | Contract has no syntax/compile errors |
| 4 | Contract deployment | `04_contract_deployment.png` | Contract can be deployed to blockchain |
| 5 | Patient registration | `05_patient_registration.png` | Role registration works |
| 6 | Doctor registration | `06_doctor_registration.png` | Multiple roles supported |
| 7 | Hospital registration | `07_hospital_registration.png` | Hospital role works |
| 8 | Dummy record file | `08_dummy_record_file.png` | Off-chain records exist (synthetic data) |
| 9 | File hash generation | `09_hash_generation_output.png` | Hashing utility works |
| 10 | Medical record added | `10_medical_record_added.png` | Hospital can add record metadata |
| 11 | Unauthorized access rejected | `11_unauthorized_access_rejected.png` | Access control works (denied without permission) |
| 12 | Patient grants access | `12_patient_grants_access.png` | Consent mechanism works |
| 13 | Authorized access | `13_authorized_access.png` | Authorized doctor can view records |
| 14 | Patient revokes access | `14_patient_revokes_access.png` | Revocation mechanism works |
| 15 | Access rejected after revocation | `15_access_rejected_after_revocation.png` | Revocation is enforced |
| 16 | Event logs | `16_event_logs.png` | Audit trail is created |
| 17 | Hardhat test results | `17_hardhat_test_results.png` | All automated tests pass |
| 18 | Frontend dApp (optional) | `18_frontend_dapp.png` | Full-stack dApp works |
| 19 | GitHub repository | `19_github_repository.png` | Project is uploaded to GitHub |
| 20 | README preview | `20_readme_preview.png` | Documentation renders properly |

---

## How to Take Screenshots

### On Windows:
- **Full screen**: `Win + Print Screen` (saves to Pictures/Screenshots)
- **Active window**: `Alt + Print Screen`
- **Snipping Tool**: `Win + Shift + S` for custom region

### On Mac:
- **Full screen**: `Cmd + Shift + 3`
- **Custom region**: `Cmd + Shift + 4`

### Tips:
1. Save all screenshots in the `screenshots/` folder
2. Use the numbered naming convention above
3. Crop to show only the relevant portion
4. Include the browser URL bar where applicable (shows Remix URL)
5. Make sure transaction details and event logs are visible
