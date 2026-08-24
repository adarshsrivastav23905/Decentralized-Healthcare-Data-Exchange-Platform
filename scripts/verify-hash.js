// scripts/verify-hash.js
// ============================================================
//  Hash Verification Script — Tamper Detection Demo
// ============================================================
//  This script demonstrates how hash verification detects
//  file tampering. It compares the current file hash with
//  a previously stored hash.
//
//  Usage:
//    node scripts/verify-hash.js <filepath> <expected-hash>
//
//  Example:
//    node scripts/verify-hash.js sample_records/medical_record_001.json 0xabc123...
//
//  Or auto-verify against stored hash:
//    node scripts/verify-hash.js sample_records/medical_record_001.json
// ============================================================

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

function verifyFileHash(filePath, expectedHash) {
  console.log("==============================================");
  console.log("  Medical Record Hash Verifier");
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

  // Generate current SHA-256 hash
  const currentHash =
    "0x" +
    crypto.createHash("sha256").update(fileContent).digest("hex");

  console.log(`📄 File:           ${filePath}`);
  console.log(`🔒 Current Hash:   ${currentHash}`);

  // If no expected hash provided, try to load from hashes directory
  if (!expectedHash) {
    const hashFileName =
      path.basename(filePath, path.extname(filePath)) + "_hash.json";
    const hashFilePath = path.resolve("hashes", hashFileName);

    if (fs.existsSync(hashFilePath)) {
      const savedData = JSON.parse(fs.readFileSync(hashFilePath, "utf-8"));
      expectedHash = savedData.bytes32;
      console.log(`📋 Stored Hash:    ${expectedHash}`);
      console.log(`📅 Stored At:      ${savedData.generatedAt}`);
    } else {
      console.log(
        `\n⚠️  No stored hash found. Run generate-hash.js first.`
      );
      console.log(
        `   Or provide expected hash: node verify-hash.js <file> <hash>`
      );
      process.exit(1);
    }
  } else {
    console.log(`📋 Expected Hash:  ${expectedHash}`);
  }

  // Compare hashes
  console.log("\n----------------------------------------------");

  if (currentHash === expectedHash) {
    console.log("✅ VERIFICATION PASSED: File integrity confirmed!");
    console.log("   The file has NOT been tampered with.");
  } else {
    console.log("❌ VERIFICATION FAILED: Hash mismatch detected!");
    console.log("   ⚠️  The file may have been TAMPERED with!");
    console.log("   The file content has changed since the hash was stored.");
  }

  console.log("----------------------------------------------\n");

  return currentHash === expectedHash;
}

// Get command-line arguments
const filePath = process.argv[2];
const expectedHash = process.argv[3];

if (!filePath) {
  console.log("Usage:");
  console.log("  node scripts/verify-hash.js <filepath> [expected-hash]");
  console.log("");
  console.log("Examples:");
  console.log(
    "  node scripts/verify-hash.js sample_records/medical_record_001.json"
  );
  console.log(
    "  node scripts/verify-hash.js sample_records/medical_record_001.json 0xabc..."
  );
  process.exit(1);
}

verifyFileHash(filePath, expectedHash);
