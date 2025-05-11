const puppeteer = require("puppeteer");
const parquet = require("parquetjs-lite");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { imageHash } = require("image-hash");
var compare = require("hamming-distance");

let linksCount = 0;

const readData = async (filePath) => {
  const reader = await parquet.ParquetReader.openFile(filePath);
  const cursor = reader.getCursor();
  const links = [];

  let record = null;
  while ((record = await cursor.next())) {
    const siteLink = record.domain;

    if (siteLink) {
      links.push(siteLink);
      linksCount += 1;
    }
  }
  await reader.close();
  return links;
};

const downloadLogo = async (browser, links, logosDir) => {
  console.log(`There are ${linksCount} websites.`);
  for (let i = 0; i < links.length; i++) {
    const page = await browser.newPage();

    try {
      await page.goto(`https://${links[i]}`, {
        timeout: 20000,
        waitUntil: "load",
      });
      await page.setViewport({ width: 1280, height: 800 });

      const logo = await page.$(
        'img[alt*="logo" i], img[src*="logo" i], svg[class*="logo" i], [class*="logo" i] svg'
      );

      console.log(`Progress: ${i + 1}/${linksCount}`);
      if (logo) {
        const box = await logo.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          const fileName = `logo_${encodeURIComponent(links[i])}.png`;
          const filePath = path.join(logosDir, fileName);
          await logo.screenshot({ path: filePath });
          console.log(`Logo saved!`);
        } else {
          console.log(`Logo found, but it's invisible or has no size.`);
        }
      } else {
        console.log(`Logo not found.`);
      }
    } catch (error) {
      console.log(`${error}`);
    }

    await page.close();
  }
};

const normalizeLogos = async (logosDir) => {
  const normalizedDir = path.join(__dirname, "logos_normalized");

  if (!fs.existsSync(normalizedDir)) fs.mkdirSync(normalizedDir);

  console.log("Normalizing logos...");
  fs.readdirSync(logosDir).forEach(async (file) => {
    const filePath = path.join(logosDir, file);
    const normalizedPath = path.join(normalizedDir, file);

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

const generateImageHashes = async (dir) => {
  const folder = fs.readdirSync(dir);
  const hashList = [];
  let i = 0;
  for (const file of folder) {
    const img = await new Promise((resolve, reject) => {
      imageHash(`${dir}/${file}`, 32, true, (error, data) => {
        if (error) reject(error);
        resolve(data);
      });
    });
    hashList.push({ id: i, fileName: file, hash: img });
    i += 1;
  }
  return hashList;
};

const compareImages = async (hashList) => {
  const allImagesSimilarData = [];
  for (let i = 0; i < hashList.length; i++) {
    let highSimilarity = { file: hashList[i].fileName, similarTo: [] };
    for (let j = i + 1; j < hashList.length; j++) {
      var distance = compare(
        Buffer.from(hashList[i].hash, "hex"),
        Buffer.from(hashList[j].hash, "hex")
      );
      if (distance < 60) {
        highSimilarity.similarTo.push(hashList[j].fileName);
      }
    }
    allImagesSimilarData.push(highSimilarity);
  }
  return allImagesSimilarData;
};

(async () => {
  const logosDir = path.join(__dirname, "logos");

  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  const browser = await puppeteer.launch();

  const data = await generateImageHashes(logosDir);

  //   const websites = await readData("./logos.snappy.parquet");

  //   await downloadLogo(browser, websites, logosDir);

  //   normalizeLogos(logosDir);
  const imgData = await compareImages(data);
  console.log(imgData);

  await browser.close();
})();
