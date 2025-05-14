const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const normalizeLogos = async (logosDir, normDir) => {
  console.log("Normalizing logos...");

  const files = fs.readdirSync(logosDir);

  for (const file of files) {
    const filePath = path.join(logosDir, file);
    const newFileName = path.parse(file).name + ".png";
    const normalizedPath = path.join(normDir, newFileName);

    try {
      await sharp(filePath)
        .resize(128, 128, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .flatten()
        .toFormat("png")
        .toFile(normalizedPath);
    } catch (error) {
      console.error(`Error for ${file}:`, error.message);
    }
  }

  console.log("Normalizing done!");
};

module.exports = normalizeLogos;
