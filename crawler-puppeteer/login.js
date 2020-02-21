/* eslint-disable @typescript-eslint/no-use-before-define */
const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');
const VError = require('verror');

const input = require('./input.json');
const chromePath = findChrome();
const userDataDirPath = getUserDataDirByOS();

function getUserDataDirByOS() {
  switch (process.platform) {
    case 'darwin':
      return `~/Library/Application Support/Google/Chrome`;
    case 'win32':
      return `%LOCALAPPDATA%\\Google\\Chrome\\User Data`;
    case 'linux':
      return `~/.config/google-chrome`;
  }
}

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    // userDataDir: profilePath,
    // args: [`--user-data-dir=${userDataDirPath}`],
    headless: false,
  });
  const page = await browser.newPage();
  return {page};
}

async function loginCheck(page) {
  let isError = false;
  await page
    .waitForSelector('.desc_error', { visible: true, timeout: 1000 } )
    .then(async () => {
      isError = await page.$('.desc_error', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display') !== 'none'
      });
    })
    .catch(() => {
      isError = false;
    })
  return isError;
};

async function playTest(url) {
  const {page} = await startBrowser();
  // page.setViewport({width: 1366, height: 768});

  let isLoggedIn = false;
  await page.goto(url);
  isLoggedIn = page.url() === url;

  if (!isLoggedIn) {
    try {
      await page.type('#loginEmail', input.username);
      await page.type('#loginPw', input.password);
      await page.click('.btn_login');
      await page.waitFor(1000);

      const isError = await loginCheck(page);
      console.log(isError)
      if (isError) {
        // const element = await page.$('.desc_error', (elem) => {
        //   return window.getComputedStyle(elem).getPropertyValue('display') !== 'none'
        // });
        const errorText = await page.evaluate(element => element.textContent, isError);
        console.log(errorText);
        let errorMsg = '';
        switch (errorText) {
          case '▲ 체크박스를 클릭해 주세요.':
            errorMsg = `reCAPTCHA! Please login again after a while.`;
            break;
          case '카카오계정 혹은 비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.':
            errorMsg = `Incorrect username or password.`;
            break;
          default:
            errorMsg = `Login failed with unknown error.`;
            break;
        }
        throw new VError(errorMsg);
      }

      await page.waitFor(1000);
      // await page.waitForNavigation();
      // await page.screenshot({ path: './crawler/screenshot/kakaopf.png', fullPage: true });
      console.log("Successfully logged in!")
    } catch (err) {
      console.log(err)
      const error = new Error(`Login failed.`);
      error.originalError = err;
      throw error;
    }
  }
}

(async () => {
  await playTest("https://center-pf.kakao.com/_zDxoed/statistics/post/individual");
  process.exit(1);
})();

// /html/body/div[3]/div[2]/div/div[3]/button[2] // .link_close
// /html/body/div[3]/div[2]/div/div[3]/button[1] // .btn_close
// /html/body/div[3]/div[2]/div // .layer_profile
