const { Cluster } = require("puppeteer-cluster");
const path = require("path");
const fs = require("fs");
const cliProgress = require("cli-progress");

const downloadLogo = async (links, logosDir, nr = 5) => {
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  let errorsList = [];

  const b1 = new cliProgress.SingleBar(cliProgress.Presets.shades_classic);
  b1.start(links.length, 0);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: nr,
    puppeteerOptions: {
      headless: true,
    },
  });

  await cluster.task(async ({ page, data: link }) => {
    try {
      await page.goto(`https://${link}`, {
        timeout: 20000,
        waitUntil: "domcontentloaded",
      });
      await page.setViewport({ width: 1280, height: 800 });

      const logo = await page.$(
        'img[alt*="logo" i], img[src*="logo" i], svg[class*="logo" i], [class*="logo" i] svg'
      );

      if (logo) {
        const box = await logo.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          const fileName = `logo_${encodeURIComponent(link)}.png`;
          const filePath = path.join(logosDir, fileName);
          await logo.screenshot({ path: filePath });
        }
      }
    } catch (error) {
      errorsList.push(`${link}:  ${error}`);
    } finally {
      b1.increment();
    }
  });

  for (const link of links) {
    await cluster.queue(link);
  }

  await cluster.idle();
  await cluster.close();
  b1.stop();
  fs.writeFile("errors.log", errorsList.join("\n"), "utf8", (err) => {
    if (err) {
      console.error("Error writing to file", err);
    } else {
      console.log("Error logs saved in errors.log");
    }
  });
};

module.exports = downloadLogo;
