const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Paths
const PRIVATE_KEY_PATH = path.join(__dirname, 'student_private.pem');
const ENCRYPTED_SEED_PATH = path.join(__dirname, 'encrypted_seed.txt');
const SEED_OUTPUT_PATH = path.join(__dirname, 'data', 'seed.txt');

// Ensure /data directory exists
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

// 1. Read encrypted seed
const encryptedSeedB64 = fs.readFileSync(ENCRYPTED_SEED_PATH, 'utf-8').trim();

// 2. Read private key
const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8');

// 3. Base64 decode
const encryptedBuffer = Buffer.from(encryptedSeedB64, 'base64');

// 4. Decrypt using RSA-OAEP with SHA-256
const decryptedBuffer = crypto.privateDecrypt(
  {
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  encryptedBuffer
);

// 5. Convert to UTF-8 string
const decryptedSeed = decryptedBuffer.toString('utf-8').trim();

// 6. Validate hex seed
const hexRegex = /^[0-9a-f]{64}$/;
if (!hexRegex.test(decryptedSeed)) {
  console.error('Decrypted seed is invalid:', decryptedSeed);
  process.exit(1);
}

// 7. Save to /data/seed.txt
fs.writeFileSync(SEED_OUTPUT_PATH, decryptedSeed);
console.log(`Decrypted seed saved to ${SEED_OUTPUT_PATH}`);
