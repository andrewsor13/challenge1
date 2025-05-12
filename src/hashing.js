const { imageHash } = require("image-hash");
const fs = require("fs");

const generateImageHashes = async (dir) => {
  const folder = fs.readdirSync(dir);
  const hashList = [];
  let i = 0;
  console.log("Generating hash list...");
  for (const file of folder) {
    const img = await new Promise((resolve, reject) => {
      imageHash(`${dir}/${file}`, 32, true, (error, data) => {
        if (error) reject(error);
        resolve(data);
      });
    });
    hashList.push({ id: i, fileName: `${file}`, hash: img });
    console.log(`Progress: ${i + 1}/${folder.length}`);
    i += 1;
  }
  return hashList;
};

module.exports = generateImageHashes;
