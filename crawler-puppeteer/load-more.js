const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');

const input = require('./input.json');
const chromePath = findChrome();

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
  });
  const page = await browser.newPage();
  return {page};
}

async function playTest(url) {
  const {page} = await startBrowser();
  page.setViewport({width: 1366, height: 768});
  await page.goto(url);

  try {
    await page.type('#loginEmail', input.username);
    await page.type('#loginPw', input.password);
    await page.click('.btn_login');
    await page.waitForNavigation();
    await page.screenshot({path: './crawler/screenshot/kakaopf-1.png'});
    console.log("Done!")
  } catch (err) {
    console.log(err)
    const error = new Error(`Login failed with wrong input.`);
    error.originalError = err;
    throw error;
  }

  const isElementVisible = async (page, xpath) => {
    let visible = true;
    await page
      .waitForXPath(xpath, { visible: true, timeout: 2000 })
      .catch(() => {
        visible = false;
      });
    return visible;
  };

  const xpath = '//*[@id="mArticle"]/div[3]/h2';
  let loadMoreVisible = await isElementVisible(page, xpath);

  const clickRange = input.range / 5;
  let count = 2;

  while (loadMoreVisible && count <= clickRange) {
    try {
      await page.waitForXPath(xpath, { timeout: 5000 });
      const [loadMoreButton] = await page.$x(xpath);
      await loadMoreButton.click(); // 1회 클릭시 5개 포스트씩
      await page.waitFor(1000);
      await page.screenshot({ path: `./crawler/screenshot/kakaopf-${count}.png` });
      loadMoreVisible = await isElementVisible(page, xpath);
      count++;
    } catch (err) {
      console.log(err);
      const error = new Error(`Failed at loading more posts.`);
      error.originalError = err;
      throw error;
    }
  }
}

(async () => {
  await playTest("https://center-pf.kakao.com/_zDxoed/statistics/post/individual");
  process.exit(1);
})();
