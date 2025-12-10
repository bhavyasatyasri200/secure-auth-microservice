const fs = require('fs');
const path = require('path');
const { totp } = require('otplib');
const base32 = require('thirty-two'); // updated library

// Paths
const SEED_PATH = path.join(__dirname, 'data', 'seed.txt');

// Read hex seed from file
const hexSeed = fs.readFileSync(SEED_PATH, 'utf-8').trim();

// --- Helper: Convert hex seed to base32 ---
function hexToBase32(hexString) {
  const buffer = Buffer.from(hexString, 'hex');
  return base32.encode(buffer).toString().replace(/=/g, ''); // remove padding
}

// --- Generate TOTP code ---
function generateTotpCode(hexSeed) {
  const base32Seed = hexToBase32(hexSeed);
  totp.options = { step: 30, digits: 6, algorithm: 'sha1' };
  const code = totp.generate(base32Seed);
  return code;
}

// --- Verify TOTP code ---
function verifyTotpCode(hexSeed, code, validWindow = 1) {
  const base32Seed = hexToBase32(hexSeed);
  totp.options = { step: 30, digits: 6, algorithm: 'sha1', window: validWindow };
  return totp.check(code, base32Seed);
}

// --- Example usage ---
const code = generateTotpCode(hexSeed);
console.log('Current TOTP code:', code);

// Example verification
const isValid = verifyTotpCode(hexSeed, code); // should be true
console.log('Verification result:', isValid);
