const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const ENCRYPTED_SEED_PATH = path.join(__dirname, 'encrypted_seed.txt');

async function testApi() {
  try {
    // --- 1. Decrypt Seed ---
    const encryptedSeed = fs.readFileSync(ENCRYPTED_SEED_PATH, 'utf-8').trim();
    const decryptResp = await axios.post(`${BASE_URL}/decrypt-seed`, {
      encrypted_seed: encryptedSeed
    });
    console.log('Decrypt Seed Response:', decryptResp.data);

    // --- 2. Generate TOTP ---
    const totpResp = await axios.get(`${BASE_URL}/generate-2fa`);
    console.log('Generate 2FA Response:', totpResp.data);

    // --- 3. Verify TOTP ---
    const code = totpResp.data.code;
    const verifyResp = await axios.post(`${BASE_URL}/verify-2fa`, { code });
    console.log('Verify 2FA Response:', verifyResp.data);

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

// Run test
testApi();
