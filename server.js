const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateTotpCode, verifyTotpCode } = require('./totpService');

// 👉 ADD THIS LINE (IMPORTANT)
console.log("SERVER WORKING DIRECTORY:", __dirname);

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.json());

// Paths
const PRIVATE_KEY_PATH = path.join(__dirname, 'student_private.pem');
const SEED_PATH = path.join(__dirname, 'data', 'seed.txt');

// --- Endpoint 1: POST /decrypt-seed ---
app.post('/decrypt-seed', (req, res) => {
  try {
    const { encrypted_seed } = req.body;
    if (!encrypted_seed) return res.status(400).json({ error: 'Missing encrypted_seed' });

    const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8');
    const encryptedBuffer = Buffer.from(encrypted_seed, 'base64');

    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      encryptedBuffer
    );

    const decryptedSeed = decryptedBuffer.toString('utf-8').trim();

    if (!/^[0-9a-f]{64}$/.test(decryptedSeed)) {
      throw new Error('Decrypted seed is invalid');
    }

    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(SEED_PATH, decryptedSeed);

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Decryption failed' });
  }
});

// --- Endpoint 2: GET /generate-2fa ---
app.get('/generate-2fa', (req, res) => {
  try {
    const totpData = generateTotpCode();
    return res.json(totpData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Seed not decrypted yet' });
  }
});

// --- Endpoint 3: POST /verify-2fa ---
app.post('/verify-2fa', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    const valid = verifyTotpCode(code);
    return res.json({ valid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Seed not decrypted yet' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
