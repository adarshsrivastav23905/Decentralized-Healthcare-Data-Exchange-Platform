// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
//  HealthcareDataExchange.sol
//  Decentralized Healthcare Data Exchange Platform
// ============================================================
//  This smart contract manages:
//    1. Role-based user registration (Patient, Doctor, Hospital)
//    2. Medical record hash + metadata storage (on-chain)
//    3. Patient-controlled consent & access management
//    4. Immutable audit trail via Ethereum events
//
//  IMPORTANT: No actual medical data is stored on-chain.
//  Only hashes, metadata references, and access permissions
//  are recorded. Actual medical files remain off-chain.
// ============================================================

contract HealthcareDataExchange {

    // ========================================================
    //  ENUMS
    // ========================================================

    /// @notice Roles available in the system
    enum Role {
        None,       // 0 — Not registered
        Patient,    // 1 — Patient: owns records, controls access
        Doctor,     // 2 — Doctor: views authorized records
        Hospital    // 3 — Hospital: creates medical record entries
    }

    // ========================================================
    //  STRUCTS
    // ========================================================

    /// @notice Represents a registered user in the system
    struct User {
        address userAddress;   // Wallet address of the user
        string  name;          // Display name
        Role    role;          // Assigned role
        bool    isRegistered;  // Registration status
    }

    /// @notice Represents a medical record's on-chain metadata
    /// @dev Actual medical data is stored off-chain; only the
    ///      hash and a storage reference are kept here.
    struct MedicalRecord {
        uint256 recordId;          // Unique record identifier
        address patient;           // Patient who owns this record
        address createdBy;         // Hospital that created this record
        string  recordType;        // e.g., "Lab Report", "Prescription"
        bytes32 fileHash;          // SHA-256 / keccak256 hash of the off-chain file
        string  storageReference;  // Off-chain location (IPFS CID, file path, URL)
        uint256 timestamp;         // Block timestamp when record was created
        bool    active;            // Whether the record is active
    }

    // ========================================================
    //  STATE VARIABLES
    // ========================================================

    /// @notice Contract deployer / admin address
    address public admin;

    /// @notice Auto-incrementing record ID counter
    uint256 public recordCount;

    /// @notice Mapping of wallet address → User profile
    mapping(address => User) public users;

    /// @notice Mapping of record ID → MedicalRecord
    mapping(uint256 => MedicalRecord) public records;

    /// @notice Mapping of patient address → array of their record IDs
    mapping(address => uint256[]) public patientRecordIds;

    /// @notice Nested mapping for access control:
    ///         recordId → (doctorAddress → hasPermission)
    mapping(uint256 => mapping(address => bool)) public accessPermissions;

    // ========================================================
    //  EVENTS (Immutable Audit Trail)
    // ========================================================

    /// @notice Emitted when a new user registers
    event UserRegistered(
        address indexed user,
        string  name,
        Role    role
    );

    /// @notice Emitted when a hospital adds a medical record for a patient
    event MedicalRecordAdded(
        uint256 indexed recordId,
        address indexed patient,
        address indexed createdBy,
        string  recordType,
        bytes32 fileHash
    );

    /// @notice Emitted when a patient grants a doctor access to a record
    event AccessGranted(
        uint256 indexed recordId,
        address indexed patient,
        address indexed doctor
    );

    /// @notice Emitted when a patient revokes a doctor's access to a record
    event AccessRevoked(
        uint256 indexed recordId,
        address indexed patient,
        address indexed doctor
    );

    /// @notice Emitted when an authorized user accesses a record
    event RecordAccessed(
        uint256 indexed recordId,
        address indexed accessor
    );

    // ========================================================
    //  MODIFIERS
    // ========================================================

    /// @notice Restricts function to registered users only
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User is not registered");
        _;
    }

    /// @notice Restricts function to patients only
    modifier onlyPatient() {
        require(
            users[msg.sender].role == Role.Patient,
            "Only patients can perform this action"
        );
        _;
    }

    /// @notice Restricts function to doctors only
    modifier onlyDoctor() {
        require(
            users[msg.sender].role == Role.Doctor,
            "Only doctors can perform this action"
        );
        _;
    }

    /// @notice Restricts function to hospitals only
    modifier onlyHospital() {
        require(
            users[msg.sender].role == Role.Hospital,
            "Only hospitals can perform this action"
        );
        _;
    }

    /// @notice Ensures a record with the given ID exists
    modifier recordExists(uint256 _recordId) {
        require(_recordId > 0 && _recordId <= recordCount, "Record does not exist");
        _;
    }

    /// @notice Ensures the caller is the owner (patient) of the record
    modifier onlyRecordOwner(uint256 _recordId) {
        require(
            records[_recordId].patient == msg.sender,
            "Only the record owner can perform this action"
        );
        _;
    }

    // ========================================================
    //  CONSTRUCTOR
    // ========================================================

    /// @notice Sets the deployer as the contract admin
    constructor() {
        admin = msg.sender;
    }

    // ========================================================
    //  USER REGISTRATION FUNCTIONS
    // ========================================================

    /// @notice Register the caller as a Patient
    /// @param _name The display name of the patient
    function registerPatient(string memory _name) external {
        require(!users[msg.sender].isRegistered, "User is already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        users[msg.sender] = User({
            userAddress: msg.sender,
            name: _name,
            role: Role.Patient,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, _name, Role.Patient);
    }

    /// @notice Register the caller as a Doctor
    /// @param _name The display name of the doctor
    function registerDoctor(string memory _name) external {
        require(!users[msg.sender].isRegistered, "User is already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        users[msg.sender] = User({
            userAddress: msg.sender,
            name: _name,
            role: Role.Doctor,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, _name, Role.Doctor);
    }

    /// @notice Register the caller as a Hospital
    /// @param _name The display name of the hospital
    function registerHospital(string memory _name) external {
        require(!users[msg.sender].isRegistered, "User is already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        users[msg.sender] = User({
            userAddress: msg.sender,
            name: _name,
            role: Role.Hospital,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, _name, Role.Hospital);
    }

    // ========================================================
    //  MEDICAL RECORD FUNCTIONS
    // ========================================================

    /// @notice Add a new medical record for a patient (Hospital only)
    /// @param _patient     The patient's wallet address
    /// @param _recordType  Type of record (e.g., "Lab Report")
    /// @param _fileHash    Hash of the off-chain medical file
    /// @param _storageRef  Off-chain storage reference (IPFS CID, URL, path)
    /// @return recordId    The ID assigned to the new record
    function addMedicalRecord(
        address _patient,
        string  memory _recordType,
        bytes32 _fileHash,
        string  memory _storageRef
    )
        external
        onlyHospital
        returns (uint256)
    {
        // Validate patient address
        require(_patient != address(0), "Invalid patient address");
        require(
            users[_patient].isRegistered && users[_patient].role == Role.Patient,
            "Patient is not registered"
        );
        require(_fileHash != bytes32(0), "File hash cannot be empty");
        require(bytes(_recordType).length > 0, "Record type cannot be empty");

        // Increment record counter
        recordCount++;
        uint256 newRecordId = recordCount;

        // Create the record
        records[newRecordId] = MedicalRecord({
            recordId:         newRecordId,
            patient:          _patient,
            createdBy:        msg.sender,
            recordType:       _recordType,
            fileHash:         _fileHash,
            storageReference: _storageRef,
            timestamp:        block.timestamp,
            active:           true
        });

        // Link record to patient
        patientRecordIds[_patient].push(newRecordId);

        // Emit audit event
        emit MedicalRecordAdded(
            newRecordId,
            _patient,
            msg.sender,
            _recordType,
            _fileHash
        );

        return newRecordId;
    }

    /// @notice Retrieve a medical record's metadata
    /// @dev    Only the patient (owner) or an authorized doctor can access
    /// @param _recordId The ID of the record to retrieve
    /// @return The MedicalRecord struct
    function getRecord(uint256 _recordId)
        external
        onlyRegistered
        recordExists(_recordId)
        returns (MedicalRecord memory)
    {
        MedicalRecord memory record = records[_recordId];

        // Check: caller is the patient OR has been granted access
        require(
            record.patient == msg.sender ||
            accessPermissions[_recordId][msg.sender],
            "Access denied: You do not have permission"
        );

        // Emit audit event for record access
        emit RecordAccessed(_recordId, msg.sender);

        return record;
    }

    /// @notice Get all record IDs belonging to a patient
    /// @param _patient The patient's wallet address
    /// @return Array of record IDs
    function getPatientRecords(address _patient)
        external
        view
        returns (uint256[] memory)
    {
        return patientRecordIds[_patient];
    }

    // ========================================================
    //  CONSENT & ACCESS CONTROL FUNCTIONS
    // ========================================================

    /// @notice Patient grants a doctor access to a specific record
    /// @param _doctor   The doctor's wallet address
    /// @param _recordId The record to grant access to
    function grantAccess(address _doctor, uint256 _recordId)
        external
        onlyPatient
        recordExists(_recordId)
        onlyRecordOwner(_recordId)
    {
        // Validate doctor
        require(
            users[_doctor].isRegistered && users[_doctor].role == Role.Doctor,
            "Target is not a registered doctor"
        );
        require(
            !accessPermissions[_recordId][_doctor],
            "Doctor already has access to this record"
        );

        // Grant permission
        accessPermissions[_recordId][_doctor] = true;

        // Emit audit event
        emit AccessGranted(_recordId, msg.sender, _doctor);
    }

    /// @notice Patient revokes a doctor's access to a specific record
    /// @param _doctor   The doctor's wallet address
    /// @param _recordId The record to revoke access from
    function revokeAccess(address _doctor, uint256 _recordId)
        external
        onlyPatient
        recordExists(_recordId)
        onlyRecordOwner(_recordId)
    {
        // Validate
        require(
            accessPermissions[_recordId][_doctor],
            "Doctor does not have access to this record"
        );

        // Revoke permission
        accessPermissions[_recordId][_doctor] = false;

        // Emit audit event
        emit AccessRevoked(_recordId, msg.sender, _doctor);
    }

    /// @notice Check if a doctor has access to a specific record
    /// @param _doctor   The doctor's wallet address
    /// @param _recordId The record ID to check
    /// @return True if the doctor has permission
    function hasAccess(address _doctor, uint256 _recordId)
        external
        view
        recordExists(_recordId)
        returns (bool)
    {
        return accessPermissions[_recordId][_doctor];
    }

    // ========================================================
    //  VERIFICATION FUNCTIONS
    // ========================================================

    /// @notice Verify that a file hash matches the stored hash for a record
    /// @dev    Used to detect if an off-chain file has been tampered with
    /// @param _recordId     The record ID to verify
    /// @param _hashToVerify The hash to compare against stored hash
    /// @return True if hashes match, false otherwise
    function verifyRecordHash(uint256 _recordId, bytes32 _hashToVerify)
        external
        view
        recordExists(_recordId)
        returns (bool)
    {
        return records[_recordId].fileHash == _hashToVerify;
    }

    // ========================================================
    //  VIEW / UTILITY FUNCTIONS
    // ========================================================

    /// @notice Get user information for an address
    /// @param _user The wallet address to query
    /// @return The User struct
    function getUserInfo(address _user)
        external
        view
        returns (User memory)
    {
        return users[_user];
    }

    /// @notice Get the total number of medical records
    /// @return The record count
    function getRecordCount() external view returns (uint256) {
        return recordCount;
    }
}
