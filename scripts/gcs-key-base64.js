// Run: node scripts/gcs-key-base64.js
// Reads google-key.json and outputs GCS_SERVICE_ACCOUNT_KEY_BASE64 for .env
const fs = require("fs");
const path = require("path");
const keyPath = path.join(__dirname, "../google-key.json");
if (!fs.existsSync(keyPath)) {
  console.error("google-key.json not found. Create it from GCP Console.");
  process.exit(1);
}
const j = JSON.parse(fs.readFileSync(keyPath, "utf8"));
const b64 = Buffer.from(JSON.stringify(j)).toString("base64");
console.log("Add to .env:\nGCS_SERVICE_ACCOUNT_KEY_BASE64=" + b64);
