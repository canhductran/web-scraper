import * as puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    devtools: true,
  });

  const page = await browser.newPage();
  await page.goto('https://vanbanphapluat.co/csdl/van-ban-phap-luat');
  await page.waitForSelector('.page_inner');

  const urls = await page.$$eval('div.block-content', links => {
    console.log('links', links);
  });

  await browser.close();
})();
