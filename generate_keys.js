const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

function generateRsaKeypair(keySize = 4096) {
  // Generate RSA key pair
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: keySize,          // 4096 bits
    publicExponent: 0x10001,         // 65537
    publicKeyEncoding: {
      type: 'spki',                  // Public Key format (PEM)
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',                 // PKCS#8 format for -----BEGIN PRIVATE KEY-----
      format: 'pem'
      // No encryption since task requires unencrypted PEM
    }
  });

  // Save keys to files
  fs.writeFileSync('student_private.pem', privateKey, { mode: 0o600 });
  fs.writeFileSync('student_public.pem', publicKey);

  console.log('RSA 4096-bit key pair (PKCS#8) generated successfully.');
}

generateRsaKeypair();
