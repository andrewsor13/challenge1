const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const normalizeLogos = async (logosDir, normDir) => {
  console.log("Normalizing logos...");
  fs.readdirSync(logosDir).forEach(async (file) => {
    const filePath = path.join(logosDir, file);
    const normalizedPath = path.join(normDir, file);

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
      console.log(error);
    }
  });
  console.log("Normalizing done!");
};

module.exports = normalizeLogos;
