const fs = require("fs");
const path = require("path");

const readData = require("./src/readData");
const downloadLogo = require("./src/downloadLogos");
const normalizeLogos = require("./src/normalize");
const compareImages = require("./src/compare");
const generateImageHashes = require("./src/hashing");

const logosDir = path.join(__dirname, "logos");

if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const normalizedDir = path.join(__dirname, "logos_normalized");

if (!fs.existsSync(normalizedDir)) fs.mkdirSync(normalizedDir);

const generate = async () => {
  // 1. Reads the links from the logos file and stores them in websites.
  const websites = await readData("./logos.snappy.parquet");

  // 2. Starts the download process of all the logos.
  await downloadLogo(websites, logosDir, 5);
  // 3. Normalizes all the logos to the same size
  normalizeLogos(logosDir, normalizedDir);
  // // 4. Generate phash for each logo
  const hashList = await generateImageHashes(normalizedDir);
  // // // 5. Compares the phash of each logo with all the logos and generates a json file with the results.
  await compareImages(hashList);
};

generate();
