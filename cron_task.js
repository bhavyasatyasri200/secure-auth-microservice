const fs = require("fs");
const path = require("path");
const { generateTotpCode } = require("./totp");

// Path to seed
const SEED_PATH = path.join(__dirname, "data", "seed.txt");

function getUtcTimestamp() {
  return new Date().toISOString().replace("T", " ").replace("Z", "");
}

function main() {
  try {
    if (!fs.existsSync(SEED_PATH)) {
      console.log(`${getUtcTimestamp()} - Seed not found`);
      return;
    }

    const hexSeed = fs.readFileSync(SEED_PATH, "utf8").trim();
    const code = generateTotpCode(hexSeed);

    console.log(`${getUtcTimestamp()} - 2FA Code: ${code}`);
  } catch (err) {
    console.error(`${getUtcTimestamp()} - Error: ${err.message}`);
  }
}

main();
