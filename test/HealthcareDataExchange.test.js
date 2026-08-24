// test/HealthcareDataExchange.test.js
// ============================================================
//  Automated Test Suite for HealthcareDataExchange Contract
// ============================================================
//  Run with: npx hardhat test
//
//  Tests cover:
//    1.  Patient registration
//    2.  Doctor registration
//    3.  Hospital registration
//    4.  Duplicate registration rejected
//    5.  Hospital adds patient record
//    6.  Non-hospital tries to add record (rejected)
//    7.  Record with invalid patient address (rejected)
//    8.  Doctor accesses without permission (rejected)
//    9.  Patient grants doctor access
//    10. Authorized doctor accesses record
//    11. Patient revokes doctor access
//    12. Doctor access fails after revocation
//    13. Invalid record ID query (rejected)
//    14. Record hash verification — match
//    15. Record hash verification — mismatch
// ============================================================

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthcareDataExchange", function () {
  // Contract instance and signers
  let contract;
  let admin, patient, doctor, hospital, unauthorized;

  // Sample data
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("sample_medical_record_data"));
  const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("tampered_data"));
  const storageRef = "ipfs://QmSimulatedCID12345";
  const recordType = "Lab Report";

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [admin, patient, doctor, hospital, unauthorized] = await ethers.getSigners();

    const HealthcareDataExchange = await ethers.getContractFactory("HealthcareDataExchange");
    contract = await HealthcareDataExchange.deploy();
    await contract.waitForDeployment();
  });

  // ========================================================
  //  1. USER REGISTRATION TESTS
  // ========================================================

  describe("User Registration", function () {

    // Test 1: Patient registration
    it("1. Should register a patient successfully", async function () {
      const tx = await contract.connect(patient).registerPatient("John Doe");

      // Verify event emission
      await expect(tx)
        .to.emit(contract, "UserRegistered")
        .withArgs(patient.address, "John Doe", 1); // 1 = Role.Patient

      // Verify user data
      const user = await contract.getUserInfo(patient.address);
      expect(user.name).to.equal("John Doe");
      expect(user.role).to.equal(1); // Patient
      expect(user.isRegistered).to.be.true;
    });

    // Test 2: Doctor registration
    it("2. Should register a doctor successfully", async function () {
      const tx = await contract.connect(doctor).registerDoctor("Dr. Sarah Smith");

      await expect(tx)
        .to.emit(contract, "UserRegistered")
        .withArgs(doctor.address, "Dr. Sarah Smith", 2); // 2 = Role.Doctor

      const user = await contract.getUserInfo(doctor.address);
      expect(user.name).to.equal("Dr. Sarah Smith");
      expect(user.role).to.equal(2); // Doctor
      expect(user.isRegistered).to.be.true;
    });

    // Test 3: Hospital registration
    it("3. Should register a hospital successfully", async function () {
      const tx = await contract.connect(hospital).registerHospital("City General Hospital");

      await expect(tx)
        .to.emit(contract, "UserRegistered")
        .withArgs(hospital.address, "City General Hospital", 3); // 3 = Role.Hospital

      const user = await contract.getUserInfo(hospital.address);
      expect(user.name).to.equal("City General Hospital");
      expect(user.role).to.equal(3); // Hospital
      expect(user.isRegistered).to.be.true;
    });

    // Test 4: Duplicate registration rejected
    it("4. Should reject duplicate registration", async function () {
      await contract.connect(patient).registerPatient("John Doe");

      // Try registering again as patient
      await expect(
        contract.connect(patient).registerPatient("John Doe Again")
      ).to.be.revertedWith("User is already registered");

      // Try registering as doctor with same address
      await expect(
        contract.connect(patient).registerDoctor("Dr. John")
      ).to.be.revertedWith("User is already registered");
    });
  });

  // ========================================================
  //  2. MEDICAL RECORD TESTS
  // ========================================================

  describe("Medical Record Management", function () {

    beforeEach(async function () {
      // Register users for record tests
      await contract.connect(patient).registerPatient("John Doe");
      await contract.connect(doctor).registerDoctor("Dr. Sarah Smith");
      await contract.connect(hospital).registerHospital("City General Hospital");
    });

    // Test 5: Hospital adds patient record
    it("5. Should allow hospital to add a medical record", async function () {
      const tx = await contract
        .connect(hospital)
        .addMedicalRecord(patient.address, recordType, sampleHash, storageRef);

      // Verify event
      await expect(tx)
        .to.emit(contract, "MedicalRecordAdded")
        .withArgs(1, patient.address, hospital.address, recordType, sampleHash);

      // Verify record count
      expect(await contract.getRecordCount()).to.equal(1);

      // Verify patient's record list
      const patientRecords = await contract.getPatientRecords(patient.address);
      expect(patientRecords.length).to.equal(1);
      expect(patientRecords[0]).to.equal(1);
    });

    // Test 6: Non-hospital tries to add record
    it("6. Should reject record creation by non-hospital", async function () {
      await expect(
        contract
          .connect(doctor)
          .addMedicalRecord(patient.address, recordType, sampleHash, storageRef)
      ).to.be.revertedWith("Only hospitals can perform this action");

      await expect(
        contract
          .connect(patient)
          .addMedicalRecord(patient.address, recordType, sampleHash, storageRef)
      ).to.be.revertedWith("Only hospitals can perform this action");
    });

    // Test 7: Record with invalid patient address
    it("7. Should reject record with invalid patient address", async function () {
      // Zero address
      await expect(
        contract
          .connect(hospital)
          .addMedicalRecord(ethers.ZeroAddress, recordType, sampleHash, storageRef)
      ).to.be.revertedWith("Invalid patient address");

      // Unregistered address
      await expect(
        contract
          .connect(hospital)
          .addMedicalRecord(unauthorized.address, recordType, sampleHash, storageRef)
      ).to.be.revertedWith("Patient is not registered");
    });

    // Test 13: Invalid record ID query
    it("13. Should reject query for invalid record ID", async function () {
      await expect(
        contract.connect(patient).getRecord(999)
      ).to.be.revertedWith("Record does not exist");

      await expect(
        contract.connect(patient).getRecord(0)
      ).to.be.revertedWith("Record does not exist");
    });
  });

  // ========================================================
  //  3. ACCESS CONTROL TESTS
  // ========================================================

  describe("Consent & Access Control", function () {

    beforeEach(async function () {
      // Register users
      await contract.connect(patient).registerPatient("John Doe");
      await contract.connect(doctor).registerDoctor("Dr. Sarah Smith");
      await contract.connect(hospital).registerHospital("City General Hospital");

      // Hospital adds a record for the patient
      await contract
        .connect(hospital)
        .addMedicalRecord(patient.address, recordType, sampleHash, storageRef);
    });

    // Test 8: Doctor accesses without permission
    it("8. Should deny doctor access without permission", async function () {
      // Check permission returns false
      expect(await contract.hasAccess(doctor.address, 1)).to.be.false;

      // Attempting to get record should revert
      await expect(
        contract.connect(doctor).getRecord(1)
      ).to.be.revertedWith("Access denied: You do not have permission");
    });

    // Test 9: Patient grants doctor access
    it("9. Should allow patient to grant doctor access", async function () {
      const tx = await contract.connect(patient).grantAccess(doctor.address, 1);

      // Verify event
      await expect(tx)
        .to.emit(contract, "AccessGranted")
        .withArgs(1, patient.address, doctor.address);

      // Verify permission is now true
      expect(await contract.hasAccess(doctor.address, 1)).to.be.true;
    });

    // Test 10: Authorized doctor accesses record
    it("10. Should allow authorized doctor to access record", async function () {
      // Grant access first
      await contract.connect(patient).grantAccess(doctor.address, 1);

      // Doctor can now access the record
      const tx = await contract.connect(doctor).getRecord(1);

      // Verify RecordAccessed event
      await expect(tx)
        .to.emit(contract, "RecordAccessed")
        .withArgs(1, doctor.address);
    });

    // Test 11: Patient revokes doctor access
    it("11. Should allow patient to revoke doctor access", async function () {
      // Grant then revoke
      await contract.connect(patient).grantAccess(doctor.address, 1);
      const tx = await contract.connect(patient).revokeAccess(doctor.address, 1);

      // Verify event
      await expect(tx)
        .to.emit(contract, "AccessRevoked")
        .withArgs(1, patient.address, doctor.address);

      // Verify permission is now false
      expect(await contract.hasAccess(doctor.address, 1)).to.be.false;
    });

    // Test 12: Doctor access fails after revocation
    it("12. Should deny doctor access after revocation", async function () {
      // Grant access
      await contract.connect(patient).grantAccess(doctor.address, 1);

      // Doctor CAN access
      await contract.connect(doctor).getRecord(1);

      // Revoke access
      await contract.connect(patient).revokeAccess(doctor.address, 1);

      // Doctor can NO LONGER access
      await expect(
        contract.connect(doctor).getRecord(1)
      ).to.be.revertedWith("Access denied: You do not have permission");
    });

    // Additional: Patient can always access own records
    it("Should always allow patient to access own records", async function () {
      const tx = await contract.connect(patient).getRecord(1);

      await expect(tx)
        .to.emit(contract, "RecordAccessed")
        .withArgs(1, patient.address);
    });
  });

  // ========================================================
  //  4. HASH VERIFICATION TESTS
  // ========================================================

  describe("Hash Verification", function () {

    beforeEach(async function () {
      await contract.connect(patient).registerPatient("John Doe");
      await contract.connect(hospital).registerHospital("City General Hospital");

      await contract
        .connect(hospital)
        .addMedicalRecord(patient.address, recordType, sampleHash, storageRef);
    });

    // Test 14: Hash verification — match
    it("14. Should return true when hash matches stored hash", async function () {
      const result = await contract.verifyRecordHash(1, sampleHash);
      expect(result).to.be.true;
    });

    // Test 15: Hash verification — mismatch (tamper detection)
    it("15. Should return false when hash does not match (tamper detected)", async function () {
      const result = await contract.verifyRecordHash(1, wrongHash);
      expect(result).to.be.false;
    });
  });

  // ========================================================
  //  5. EVENT EMISSION TESTS
  // ========================================================

  describe("Event Emission Verification", function () {

    it("Should emit all expected events in a complete workflow", async function () {
      // Register Patient
      await expect(contract.connect(patient).registerPatient("John Doe"))
        .to.emit(contract, "UserRegistered");

      // Register Doctor
      await expect(contract.connect(doctor).registerDoctor("Dr. Sarah"))
        .to.emit(contract, "UserRegistered");

      // Register Hospital
      await expect(contract.connect(hospital).registerHospital("City Hospital"))
        .to.emit(contract, "UserRegistered");

      // Add Record
      await expect(
        contract
          .connect(hospital)
          .addMedicalRecord(patient.address, recordType, sampleHash, storageRef)
      ).to.emit(contract, "MedicalRecordAdded");

      // Grant Access
      await expect(contract.connect(patient).grantAccess(doctor.address, 1))
        .to.emit(contract, "AccessGranted");

      // Access Record
      await expect(contract.connect(doctor).getRecord(1))
        .to.emit(contract, "RecordAccessed");

      // Revoke Access
      await expect(contract.connect(patient).revokeAccess(doctor.address, 1))
        .to.emit(contract, "AccessRevoked");
    });
  });
});
