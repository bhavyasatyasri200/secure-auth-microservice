const fs = require('fs');
const axios = require('axios');
const path = require('path');

// Replace these with your actual values
const STUDENT_ID = '23P31A0533';
const GITHUB_REPO_URL = 'https://github.com/bhavyasatyasri200/secure-auth-microservice';
const API_URL = 'https://eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws';

// Path to your public key
const PUBLIC_KEY_PATH = path.join(__dirname, 'student_public.pem');

// Function to request encrypted seed
async function requestEncryptedSeed() {
  try {
    // 1. Read student public key
    let publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf-8');

    // Convert to single line with \n for JSON
    publicKey = publicKey;

    // 2. Prepare request payload
    const payload = {
      student_id: STUDENT_ID,
      github_repo_url: GITHUB_REPO_URL,
      public_key: publicKey
    };

    // 3. Send POST request to instructor API
    const response = await axios.post(API_URL, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10 seconds timeout
    });

    // 4. Parse response
    if (response.data.status === 'success' && response.data.encrypted_seed) {
      const encryptedSeed = response.data.encrypted_seed;

      // 5. Save to file (do NOT commit)
      fs.writeFileSync('encrypted_seed.txt', encryptedSeed);
      console.log('Encrypted seed saved to encrypted_seed.txt');
    } else {
      console.error('Error: Failed to get encrypted seed', response.data);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

// Execute
requestEncryptedSeed();
