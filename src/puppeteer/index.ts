import * as puppeteer from "puppeteer";
import * as fs from "fs";

const ROOT_PAGE_URL = "https://vanbanphapluat.co/csdl/van-ban-phap-luat";

const processEachPage = async (browser, url) => {
  console.log("Processing url: ", url);
  const newPage = await browser.newPage();
  await newPage.goto(url);
  await newPage.waitForSelector("#mainContent");

  let code,
    establishDate,
    effectiveDate,
    announcementDate,
    type,
    tags,
    issuingDepartment,
    signee,
    content;

  try {
    const [codeElement] = await newPage.$x(
      "//td[text() = 'Số hiệu']/following-sibling::td[1]"
    );
    code = await newPage.evaluate(
      (element) => element.textContent,
      codeElement
    );
  } catch (e) {}

  try {
    const [establishDateElement] = await newPage.$x(
      "//td[text() = 'Ngày ban hành']/following-sibling::td[1]"
    );
    establishDate = await newPage.evaluate(
      (element) => element.textContent,
      establishDateElement
    );
  } catch (e) {}

  try {
    const [announcementDateElement] = await newPage.$x(
      "//td[text() = 'Ngày công báo']/following-sibling::td[1]"
    );
    announcementDate = await newPage.evaluate(
      (element) => element.textContent,
      announcementDateElement
    );
  } catch (e) {}

  try {
    const [effectiveDateElement] = await newPage.$x(
      "//td[text() = 'Ngày hiệu lực']/following-sibling::td[1]"
    );
    effectiveDate = await newPage.evaluate(
      (element) => element.textContent,
      effectiveDateElement
    );
  } catch (e) {}

  try {
    const [typeElement] = await newPage.$x(
      "//td[text() = 'Loại văn bản']/following-sibling::td[1]"
    );
    type = await newPage.evaluate(
      (element) => element.textContent,
      typeElement
    );
  } catch (e) {}

  try {
    const [tagElement] = await newPage.$x(
      "//td[text() = 'Lĩnh vực']/following-sibling::td[1]"
    );
    tags = await newPage.evaluate((element) => element.textContent, tagElement);
  } catch (e) {}

  try {
    const [issuingDepartmentElement] = await newPage.$x(
      "//td[text() = 'Cơ quan ban hành']/following-sibling::td[1]"
    );
    issuingDepartment = await newPage.evaluate(
      (element) => element.textContent,
      issuingDepartmentElement
    );
  } catch (e) {}

  try {
    const [signeeElement] = await newPage.$x(
      "//td[text() = 'Người ký']/following-sibling::td[1]"
    );
    signee = await newPage.evaluate(
      (element) => element.textContent,
      signeeElement
    );
  } catch (e) {}

  try {
    content = await newPage.$eval("#mainContent", (contentLink) => {
      return contentLink.innerText;
    });
  } catch (e) {}

  await newPage.close();

  return {
    code,
    establishDate,
    effectiveDate,
    announcementDate,
    type,
    tags,
    issuingDepartment,
    signee,
    content,
  };
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    devtools: true,
  });

  const page = await browser.newPage();
  await page.goto(ROOT_PAGE_URL);

  const data = [];

  while (true) {
    await page.waitForSelector(".block-content");

    const urls = await page.$$eval("div.block-content", (links) => {
      const newLinks = links.map(
        (link) => (link.querySelector("a.col-md-2") as any)?.href
      );

      return newLinks.filter((l) => !!l);
    });

    for (const url of urls) {
      let row;

      try {
        row = await processEachPage(browser, url);
      } catch (e) {
        //Ignore
      }

      if (row) {
        fs.appendFile("result.json", `${JSON.stringify(row)},`, function (err) {
          if (err) throw err;
          console.log("Saved for url: ", url);
        });
      }
    }

    const [nextPageButton] = await page.$x("//a[text() = 'Trang sau']");

    if (nextPageButton) {
      await (nextPageButton as puppeteer.ElementHandle<Element>).click();
    } else {
      break;
    }
  }

  // await browser.close();
})();
