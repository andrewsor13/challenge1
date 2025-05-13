var compare = require("hamming-distance");
const fs = require("fs");
const cliProgress = require("cli-progress");

const compareImages = async (hashList) => {
  const allImagesSimilarData = [];

  console.log("Generating groups of similarity...");

  const bar1 = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  bar1.start(hashList.length, 0);

  for (let i = 0; i < hashList.length; i++) {
    bar1.increment();
    let highSimilarity = { file: hashList[i].fileName, similarTo: [] };
    for (let j = i + 1; j < hashList.length; j++) {
      var distance = compare(
        Buffer.from(hashList[i].hash, "hex"),
        Buffer.from(hashList[j].hash, "hex")
      );
      if (distance < 10) {
        highSimilarity.similarTo.push(hashList[j].fileName);
      }
    }
    if (highSimilarity.similarTo.length > 0) {
      allImagesSimilarData.push(highSimilarity);
    }
  }
  fs.writeFile(
    "similarLogos.json",
    JSON.stringify(allImagesSimilarData, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing to file", err);
      } else {
        console.log("Data written to file");
      }
    }
  );
  bar1.stop();
};

module.exports = compareImages;
