/* eslint-disable @typescript-eslint/no-use-before-define */
const url = require('url');
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const findChrome = require('chrome-finder');
const dotProp = require('dot-prop');
const VError = require('verror');
const userHome = require('user-home');
const tempy = require('tempy');

puppeteer.use(pluginStealth());

const input = require('./input.json');
const homedir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
// const homedir = `~`;
// const tempDir = tempy.directory()
const chromePath = findChrome();
const userDataDirPath = path.join(userHome, 'crawler', 'userData');
// const userDataDirPath = getUserDataDirByOS();

// const deviceOptions = {
//   name: 'Mac OS Chrome',
//   userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
//   viewport: {
//     width: 1472,
//     height: 1258,
//     deviceScaleFactor: 1,
//     isMobile: false,
//     hasTouch: false,
//     isLandscape: true,
//   },
// };

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    // userDataDir: '~/myUserDataDir3',
    // userDataDir: userDataDirPath,
    // args: [`--user-data-dir=${userDataDirPath}`],
    headless: false,
  });
  const page = await browser.newPage();
  return {browser, page};
}

async function loginCheck(page) {
  let isError = false;
  await page
    .waitForSelector('.desc_error', { visible: true, timeout: 1000 } )
    .then(async () => {
      isError = await page.$('.desc_error', (elem) => { // $eval() returns true or false
        return window.getComputedStyle(elem).getPropertyValue('display') !== 'none'
      });
    })
    .catch(() => {
      isError = false;
    })
  return isError;
};

async function login(page, input) {
  let isLoggedIn = false;
  await page.goto(input.url);
  isLoggedIn = page.url() === input.url

  if (!isLoggedIn) {
    await page.type('#loginEmail', input.username);
    await page.type('#loginPw', input.password); // LyV4@9&H4o
    await page.click('.ico_check');
    await page.click('.btn_login');
    // await page.waitForNavigation();
    await page.waitFor(1000);

    // const isCaptcha = await isCaptchaVisible(page);
    // if (isCaptcha) {
    //   throw new VError('Please try to login manually first.');
    // }

    const isError = await loginCheck(page);
    console.log(isError)
    if (isError) {
      const aHandle = await page.evaluateHandle(() => document.body);
      const resultHandle = await page.evaluateHandle((body) => body.innerHTML, aHandle);
      console.log(await resultHandle.jsonValue());
      await resultHandle.dispose();

      const errorText = await page.evaluate(element => element.textContent, isError);
      console.log(errorText);
      let errorMsg = '';
      switch (errorText) {
        case '▲ 체크박스를 클릭해 주세요.': // waitForSelector('#recaptcha-accessible-status')
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

    console.log("Successfully logged in!")
  }
}

async function loadMoreAndGetAllData(page, input) {
  return new Promise(async (resolve) => {
    let items = [];
    let isDone = false;

    page.on('response', async (response) => {
      const request = response.request();
      // const isLegitJSON = (jsonLike) => {
      //   try {
      //     JSON.parse(jsonLike);
      //     return true;
      //   } catch (err) {
      //     return false;
      //   }
      // };

      if (request.resourceType() === 'xhr' && toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts`) {
        // console.log("text @loading : ", await response.text())
        // if (!isLegitJSON(await response.text())) {
        //   return;
        // }

        const data = await response.json();
        if(!data.items) return;
        items = items.concat(...data.items);

        if (items.length >= input.range) {
          isDone = true;
          resolve(items);
        }
      }
    });

    await page.goto(input.url);

    const isPopupOpen = await checkPopupModal(page);
    if (isPopupOpen) {
      await closeOverlay(page);
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

    const buttonXpath = '//*[@id="mArticle"]/div[3]/h2';
    let loadMoreVisible = await isElementVisible(page, buttonXpath);

    // eslint-disable-next-line no-unmodified-loop-condition
    while (loadMoreVisible && !isDone) {
      try {
        await page.waitForXPath(buttonXpath, { timeout: 5000 });
        const [loadMoreButton] = await page.$x(buttonXpath);
        await page.waitFor(1000); // TODO: add
        await loadMoreButton.click(); // 1회 클릭시 5개 포스트씩
        await page.waitFor(1000);
        // await page.screenshot({ path: `./crawler/screenshot/kakaopf-${count}.png`, fullPage: true });
        loadMoreVisible = await isElementVisible(page, buttonXpath);
        // count++;
      } catch (err) {
        const error = new Error(`Failed at loading more posts.`);
        error.originalError = err;
        throw error;
      }
    }
  });
}

function getXpathForDetails(index) {
  return `//*[@id="mArticle"]/div[2]/table/tbody/tr[${index + 1}]/td[5]/div/button`;
}

async function appendDetailedData(page, postData) {
  return new Promise(async (resolve) => {
    page.on('response', async (response) => { // once()
      const request = response.request();
      const postIdExists = () => postData.some((data) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${data.post_id}`)
      if (request.resourceType() === 'xhr' && postIdExists()) {
        const post = postData.find((data) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${data.post_id}`)
        // console.log("text: ", await response.text())
        const details = await response.json();
        // console.log("json: ", details)
        post['details'] = details;
      }
    })

    for (let index of postData.keys()) {
      try {
        const xpathDetail = getXpathForDetails(index);
        await page.waitForXPath(xpathDetail, { timeout: 5000 });
        const [detailButton] = await page.$x(xpathDetail);
        await page.waitFor(1000);
        await detailButton.click();
      } catch (err) {
        throw new VError(`Failed to append detailed data.`);
      }
      await page.waitFor(1000);
      await closeOverlay(page);
      // const xpathClose = `/html/body/div[3]/div[2]/div/div[3]/button`;
      // await page.waitForXPath(xpathClose, { timeout: 5000 });
      // const [closeButton] = await page.$x(xpathClose);
      // await closeButton.click();
      // await page.waitFor(1000);
    }
    return resolve(postData);
  })
}

async function normalizePostData(object, browser) {
  try {
    const type = dotProp.get(object, 'post.type');
    const fixedData = normalizeFixedData(object);
    switch (type) {
      case 'card':
        const cardData = normalizeCardData(object);
        return Object.assign(fixedData, cardData);
      case 'video':
        const videoData = await normalizeVideoData(object, browser);
        return Object.assign(fixedData, videoData);
      default:
        return fixedData;
    }
  } catch (err) {
    const error = new VError(`Failed normalization of post data.`);
    error.originalError = err;
    throw error;
  }
}

// --- main ---

(async () => {
  const { browser, page } = await startBrowser();
  // page.on('load', () => console.log('Page loaded ' + page.url()));
  // await page.emulate(deviceOptions);
  // page.setMaxListeners(999);
  await login(page, input);
  const rawData = await loadMoreAndGetAllData(page, input);
  console.log("Done loading posts!");
  console.log("posts: ", rawData.length);
  const allData = await appendDetailedData(page, rawData);
  // console.log(allData);
  const normalizedData = await Promise.all(allData.map((dataObj) => normalizePostData(dataObj, browser)));
  // console.log("normalized posts: ", normalizedData);
  fs.writeFileSync("data.json", JSON.stringify(normalizedData));
  await page.close();
  process.exit(1);
})();


// --- helper functions ---

function getUserDataDirByOS() {
  switch (process.platform) {
    case 'darwin':
      return `${homedir}/Library/Application Support/Google/Chrome2`;
    case 'win32':
      return `%LOCALAPPDATA%\\Google\\Chrome\\User Data`;
    case 'linux':
      return `${homedir}/.config/google-chrome`;
  }
}

function toSubsetURL(input) {
  const urlObject = new url.URL(input);
  return url.format({
    protocol: urlObject.protocol,
    slashes: true,
    hostname: urlObject.hostname,
    pathname: urlObject.pathname,
  });
}

function normalizeFixedData(object) {
  return {
    id: dotProp.get(object, 'post_id'),
    published_at: new Date(dotProp.get(object, 'post.published_at')).toISOString().split('T')[0],
    title: dotProp.get(object, 'post.title'),
    view_count: dotProp.get(object, 'view_count'),
    like_count: dotProp.get(object, 'post.like_count'),
    share_count: dotProp.get(object, 'post.share_count'),
    comment_count: dotProp.get(object, 'post.comment_count'),
    video_play_count: '-',
  };
}

function normalizeCardData(object) {
  const results = {};
  const viewCounts = dotProp.get(object, 'details.medium_view_counts');
  const clickCounts = dotProp.get(object, 'details.medium_click_counts');
  for (let key in viewCounts) {
    const index = Object.keys(viewCounts).indexOf(key);
    results[`card${index + 1}_view_count`] = viewCounts[key];
  }
  for (let key in clickCounts) {
    const index = Object.keys(clickCounts).indexOf(key);
    results[`card${index + 1}_click_count`] = clickCounts[key];
  }
  // for (const key of Object.keys(viewCounts)) {
  //   const index = Object.keys(viewCounts).indexOf(key);
  //   results[`card${index + 1}_view_count`] = viewCounts[key];
  // }

  // for (const key of Object.keys(clickCounts)) {
  //   const index = Object.keys(clickCounts).indexOf(key);
  //   results[`card${index + 1}_click_count`] = clickCounts[key];
  // }
  return results;
}

async function normalizeVideoData(object, browser) {
  try {
    const videoUrl = object.post.media[0].play_url;
    const page = await browser.newPage();
    await page.goto(videoUrl);
    await page.waitForSelector('.num_playcnt', { timeout: 5000 });
    const element = await page.$('.num_playcnt');
    const countText = await page.evaluate(element => element.textContent, element);
    const count = parseInt(countText.split(',').join(''));
    // console.log("count: ", count);
    await page.waitFor(1000);
    await page.close();
    return {
      video_play_count: count,
    };
  } catch (err) {
    const error = new VError(`Failed to fetch video data.`);
    error.originalError = err;
    throw error;
  }
}


const isCaptchaVisible = async (page) => {
  let visible = false;
  await page
    .waitForSelector('.wrap_captcha', {visible: true, timeout: 2000})
    .then(async () => {
      visible = await page.$eval('#recaptcha-accessible-status');
    })
    .catch(() => {
      visible = false;
    });

  return visible;
};


async function checkPopupModal(page) {
  const xpath = '/html/body/div[3]'; // /html/body/div[3] // .layer_alert
  let isOpen = false;

  await page
    .waitForXPath(xpath, { visible: true, timeout: 2000 } )
    .then(() => {
      isOpen = true;
    })
    .catch(() => {
      isOpen = false;
    })
  return isOpen;
}

async function closeOverlay(page) {
  const closeSelector = '.btn_close'; // /html/body/div[3]/div[2]/div/div/div/div/button
  let $closeButton = null;

  try {
    await page.waitForSelector(closeSelector, {timeout: 5000});
    $closeButton = await page.$(closeSelector);
  } catch (err) {
    throw new VError(`Failed to find a close button for the overlay`);
  }

  await $closeButton.click();
}
