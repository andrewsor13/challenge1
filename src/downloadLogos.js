const puppeteer = require("puppeteer");
const { Cluster } = require("puppeteer-cluster");
const path = require("path");
const fs = require("fs");
const cliProgress = require("cli-progress");

const downloadLogo = async (links, logosDir, nr = 3) => {
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
  }

  let errorsList = [];

  const bar1 = new cliProgress.SingleBar(cliProgress.Presets.shades_classic);
  bar1.start(links.length, 0);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: nr,
    puppeteer,
    puppeteerOptions: {
      headless: "new",
      timeout: 0,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      protocolTimeout: 60000,
    },
    retryLimit: 2,
    timeout: 60000,
  });

  cluster.on("taskerror", (err, data) => {
    const message = `Error on ${data}: ${err.message}`;
    console.error(message);
    errorsList.push(message);
  });

  await cluster.task(async ({ page, data: link }) => {
    try {
      await Promise.race([
        (async () => {
          await page.goto(`https://${link}`, {
            timeout: 30000,
            waitUntil: "domcontentloaded",
          });

          await page.setViewport({ width: 1280, height: 800 });

          await page.waitForSelector(
            'img[alt*="logo" i], img[src*="logo" i], svg[class*="logo" i], [class*="logo" i] svg, [class*="logo" i] img',
            { timeout: 5000 }
          );

          const logo = await page.$(
            'img[alt*="logo" i], img[src*="logo" i], svg[class*="logo" i], [class*="logo" i] svg, [class*="logo" i] img'
          );

          if (logo) {
            const tagName = await page.evaluate(
              (el) => el.tagName.toLowerCase(),
              logo
            );

            const fileNameSafe = encodeURIComponent(link);
            const filePath = path.join(logosDir, `logo_${fileNameSafe}`);

            if (tagName === "svg") {
              const svg = await page.evaluate((el) => el.outerHTML, logo);
              fs.writeFileSync(`${filePath}.svg`, svg, "utf8");
            } else {
              const src = await page.evaluate(
                (el) => el.getAttribute("src"),
                logo
              );
              if (src) {
                const absUrl = src.startsWith("http")
                  ? src
                  : new URL(src, `https://${link}`).href;
                const response = await page.goto(absUrl, { timeout: 15000 });
                const buffer = await response.buffer();
                const ext = absUrl.endsWith(".svg") ? "svg" : "png";
                fs.writeFileSync(`${filePath}.${ext}`, buffer);
              }
            }
          } else {
            throw new Error("No logo found");
          }
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Task timeout")), 60000)
        ),
      ]);
    } catch (error) {
      const message = `${link}: ${error.message}`;
      console.error(message);
      errorsList.push(message);
    } finally {
      bar1.increment();
    }
  });

  for (const link of links) {
    cluster.queue(link);
  }

  await cluster.idle();
  await cluster.close();
  bar1.stop();
  if (errorsList.length > 0) {
    fs.writeFileSync("errors.log", errorsList.join("\n"), "utf8");
    console.log("Saved errors in errors.log");
  }
};

module.exports = downloadLogo;
