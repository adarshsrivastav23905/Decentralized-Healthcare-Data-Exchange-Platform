// scripts/generate-hash.js
// ============================================================
//  File Hash Generator for Off-Chain Medical Records
// ============================================================
//  This script generates a SHA-256 hash of a medical record
//  file. The hash is stored on-chain while the actual file
//  remains off-chain.
//
//  Usage:
//    node scripts/generate-hash.js [filepath]
//
//  Examples:
//    node scripts/generate-hash.js sample_records/medical_record_001.json
//    node scripts/generate-hash.js sample_records/medical_record_002.json
// ============================================================

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

function generateFileHash(filePath) {
  console.log("==============================================");
  console.log("  Medical Record Hash Generator");
  console.log("==============================================\n");

  // Resolve the file path
  const resolvedPath = path.resolve(filePath);

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ File not found: ${resolvedPath}`);
    process.exit(1);
  }

  // Read the file content
  const fileContent = fs.readFileSync(resolvedPath);

  // Generate SHA-256 hash
  const sha256Hash = crypto
    .createHash("sha256")
    .update(fileContent)
    .digest("hex");

  // Convert to bytes32 format (add 0x prefix for Solidity compatibility)
  const bytes32Hash = "0x" + sha256Hash;

  console.log(`📄 File:        ${filePath}`);
  console.log(`📏 File Size:   ${fileContent.length} bytes`);
  console.log(`🔒 SHA-256:     ${sha256Hash}`);
  console.log(`🔗 Bytes32:     ${bytes32Hash}`);
  console.log(`\n✅ Use the Bytes32 value when calling addMedicalRecord()`);

  // Save hash to hashes directory
  const hashesDir = path.resolve("hashes");
  if (!fs.existsSync(hashesDir)) {
    fs.mkdirSync(hashesDir, { recursive: true });
  }

  const hashFileName = path.basename(filePath, path.extname(filePath)) + "_hash.json";
  const hashData = {
    fileName: filePath,
    fileSize: fileContent.length,
    sha256: sha256Hash,
    bytes32: bytes32Hash,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(hashesDir, hashFileName),
    JSON.stringify(hashData, null, 2)
  );

  console.log(`💾 Hash saved to: hashes/${hashFileName}`);
  console.log("\n==============================================");

  return bytes32Hash;
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log("Usage: node scripts/generate-hash.js <filepath>");
  console.log("Example: node scripts/generate-hash.js sample_records/medical_record_001.json");
  process.exit(1);
}

generateFileHash(filePath);
