import * as puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    devtools: true,
  });

  const page = await browser.newPage();
  await page.goto("https://vanbanphapluat.co/csdl/van-ban-phap-luat");
  await page.waitForSelector(".block-content");

  const processEachPage = async (url) => {
    console.log('url', url);
    const newPage = await browser.newPage();
    await newPage.goto(url);
    await newPage.waitForSelector(".block-content");

    const [numberElement] = await newPage.$x("//td[text() = 'Số hiệu']/following-sibling::td[1]");
    const number = await newPage.evaluate(element => element.textContent, numberElement);

    console.log('number', number);
  };
  const urls = await page.$$eval("div.block-content", (links) => {
    console.log("links", links);
    const newLinks = links.map(
      (link) => (link.querySelector("a.col-md-2") as any)?.href
    );

    console.log("newLinks", newLinks);
    return newLinks.filter((l) => !!l);
  });

  for (const url of urls) {
    await processEachPage(url);
    // console.log('url', url);
  }
  console.log("urls", urls);

  // const dataObject = {};
  // const newPage = await browser.newPage();
  // await newPage.goto(link);

  // await browser.close();
})();
