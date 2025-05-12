const puppeteer = require("puppeteer");
const path = require("path");

const downloadLogo = async (links, logosDir) => {
  const browser = await puppeteer.launch();
  console.log(`There are ${links.length} websites.`);
  for (let i = 0; i < links.length; i++) {
    const page = await browser.newPage();
    console.log(`Progress: ${i + 1}/${links.length}`);

    try {
      await page.goto(`https://${links[i]}`, {
        timeout: 20000,
        waitUntil: "load",
      });
      await page.setViewport({ width: 1280, height: 800 });

      const logo = await page.$(
        'img[alt*="logo" i], img[src*="logo" i], svg[class*="logo" i], [class*="logo" i] svg'
      );

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
  await browser.close();
};

module.exports = downloadLogo;
