// frontend/src/contractConfig.js

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat local contract address

export const CONTRACT_ABI = [
  // Enums
  "function Role() view returns (uint8)",
  
  // View functions
  "function admin() view returns (address)",
  "function recordCount() view returns (uint256)",
  "function users(address) view returns (address userAddress, string name, uint8 role, bool isRegistered)",
  "function records(uint256) view returns (uint256 recordId, address patient, address createdBy, string recordType, bytes32 fileHash, string storageReference, uint256 timestamp, bool active)",
  "function patientRecordIds(address, uint256) view returns (uint256)",
  "function accessPermissions(uint256, address) view returns (bool)",
  
  "function getUserInfo(address _user) view returns (tuple(address userAddress, string name, uint8 role, bool isRegistered))",
  "function getRecordCount() view returns (uint256)",
  "function getPatientRecords(address _patient) view returns (uint256[])",
  "function hasAccess(address _doctor, uint256 _recordId) view returns (bool)",
  "function verifyRecordHash(uint256 _recordId, bytes32 _hashToVerify) view returns (bool)",
  
  // State-changing functions
  "function registerPatient(string _name) external",
  "function registerDoctor(string _name) external",
  "function registerHospital(string _name) external",
  "function addMedicalRecord(address _patient, string _recordType, bytes32 _fileHash, string _storageRef) external returns (uint256)",
  "function getRecord(uint256 _recordId) external returns (tuple(uint256 recordId, address patient, address createdBy, string recordType, bytes32 fileHash, string storageReference, uint256 timestamp, bool active))",
  "function grantAccess(address _doctor, uint256 _recordId) external",
  "function revokeAccess(address _doctor, uint256 _recordId) external",
  
  // Events
  "event UserRegistered(address indexed user, string name, uint8 role)",
  "event MedicalRecordAdded(uint256 indexed recordId, address indexed patient, address indexed createdBy, string recordType, bytes32 fileHash)",
  "event AccessGranted(uint256 indexed recordId, address indexed patient, address indexed doctor)",
  "event AccessRevoked(uint256 indexed recordId, address indexed patient, address indexed doctor)",
  "event RecordAccessed(uint256 indexed recordId, address indexed accessor)"
];

export const ROLE_NAMES = {
  0: "Unregistered",
  1: "Patient",
  2: "Doctor",
  3: "Hospital"
};
