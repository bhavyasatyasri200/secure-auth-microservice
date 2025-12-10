const fs = require('fs');
const path = require('path');
const { totp } = require('otplib');
const base32 = require('thirty-two');

const SEED_PATH = path.join(__dirname, 'data', 'seed.txt');

// Load hex seed from file
function readHexSeed() {
  if (!fs.existsSync(SEED_PATH)) {
    throw new Error('Seed not decrypted yet');
  }
  return fs.readFileSync(SEED_PATH, 'utf-8').trim();
}

// Convert hex → proper base32
function hexToBase32(hexSeed) {
  const buffer = Buffer.from(hexSeed, 'hex');
  return base32.encode(buffer).toString().replace(/=/g, '');
}

// Generate TOTP code
function generateTotpCode() {
  const hexSeed = readHexSeed();
  const base32Seed = hexToBase32(hexSeed);

  totp.options = {
    step: 30,
    digits: 6,
    algorithm: 'sha1'
  };

  const code = totp.generate(base32Seed);
  const valid_for = 30 - (Math.floor(Date.now() / 1000) % 30);

  return { code, valid_for };
}

// Verify TOTP code
function verifyTotpCode(code, validWindow = 1) {
  const hexSeed = readHexSeed();
  const base32Seed = hexToBase32(hexSeed);

  totp.options = {
    step: 30,
    digits: 6,
    algorithm: 'sha1',
    window: validWindow
  };

  return totp.check(code, base32Seed);
}

module.exports = { generateTotpCode, verifyTotpCode };
