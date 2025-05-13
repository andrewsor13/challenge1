const imghash = require("imghash");
const fs = require("fs");
const path = require("path");
const cliProgress = require("cli-progress");

const generateImageHashes = async (dir) => {
  const folder = fs.readdirSync(dir);
  const hashList = [];

  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  console.log("Generating hash list...");
  bar1.start(folder.length, 0);

  let i = 0;
  for (const file of folder) {
    try {
      const filePath = path.join(dir, file);
      const hash = await imghash.hash(filePath, 32, "hex");
      hashList.push({ id: i, fileName: file, hash });
      i++;
    } catch (err) {
      console.error(`Error hashing ${file}: ${err.message}`);
    }
    bar1.increment();
  }

  bar1.stop();
  return hashList;
};

module.exports = generateImageHashes;
