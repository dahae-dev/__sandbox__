/* eslint-disable @typescript-eslint/no-use-before-define */
const url = require('url');
// var fs = require("fs");
const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');
const dotProp = require('dot-prop');
const VError = require('verror');

const input = require('./input.json');
const chromePath = findChrome();
const profilePath = getProfilePathByOs();

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    userDataDir: profilePath,
    headless: false,
  });
  const page = await browser.newPage();
  return {page};
}

async function login(page, input) {
  let isLoggedIn = false;
  await page.goto(input.url);
  isLoggedIn = page.url() === input.url

  if (!isLoggedIn) {
    try {
      await page.type('#loginEmail', input.username);
      await page.type('#loginPw', input.password);
      await page.click('.btn_login');
      // TODO: incorrect username or password 인 경우 별도 핸들링!
      await page.waitForNavigation();
      console.log("Successfully logged in!")
    } catch (err) {
      const error = new VError(`Login failed.`);
      error.originalError = err;
      throw error;
    }
  }
}

async function loadMoreAndGetAllData(page, input) {
  return new Promise(async (resolve) => {
    let items = [];
    let isDone = false;

    page.on('response', async (response) => {
      const request = response.request();
      if (request.resourceType() === 'xhr' && toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts`) {
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
    for (let index of postData.keys()) {
      const xpathDetail = getXpathForDetails(index);
      await page.waitForXPath(xpathDetail, { timeout: 5000 });
      const [detailButton] = await page.$x(xpathDetail);

      page.on('response', async (response) => {
        const request = response.request();
        const postIdExists = () => postData.some((data) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${data.post_id}`)
        if (request.resourceType() === 'xhr' && postIdExists()) {
          const post = postData.find((data) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${data.post_id}`)
          const details = await response.json();
          post['details'] = details;
        }
      })

      await detailButton.click();
      await page.waitFor(1000);

      const xpathClose = `/html/body/div[3]/div[2]/div/div[3]/button`;
      await page.waitForXPath(xpathClose, { timeout: 5000 });
      const [closeButton] = await page.$x(xpathClose);
      await closeButton.click();
      await page.waitFor(1000);
    }
    return resolve(postData);
  })
}

async function normalizePostData(object ,page) {
  try {
    const type = dotProp.get(object, 'post.type');
    const fixedData = normalizeFixedData(object);
    switch (type) {
      case 'card':
        const cardData = normalizeCardData(object);
        return Object.assign(fixedData, cardData);
      case 'video':
        const videoData = await normalizeVideoData(object, page);
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
  const { page } = await startBrowser();
  // page.on('load', () => console.log('Page loaded ' + page.url()));
  await login(page, input);
  const rawData = await loadMoreAndGetAllData(page, input);
  console.log("Done loading posts!");
  console.log("posts: ", rawData.length);
  const allData = await appendDetailedData(page, rawData);
  // console.log(allData);
  const normalizedData = await Promise.all(allData.map((dataObj) => normalizePostData(dataObj, page)));
  console.log("normalized posts: ", normalizedData);
  // fs.writeFileSync("data.json", JSON.stringify(normalizedData));
  await page.close();
  process.exit(1);
})();


// --- helper functions ---

function getProfilePathByOs() {
  switch (process.platform) {
    case 'darwin':
      return `~/Library/Application Support/Google/Chrome`;
    case 'win32':
      return `%LOCALAPPDATA%\\Google\\Chrome\\User Data`;
    case 'linux':
      return `~/.config/google-chrome`;
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
    video_play_count: '',
  };
}

function normalizeCardData(object) {
  const results = {};
  const viewCounts = dotProp.get(object, 'details.medium_view_counts');
  const clickCounts = dotProp.get(object, 'details.medium_click_counts');
  for (const key of Object.keys(viewCounts)) {
    const index = Object.keys(viewCounts).indexOf(key);
    results[`card${index + 1}_view_count`] = viewCounts[key];
  }

  for (const key of Object.keys(clickCounts)) {
    const index = Object.keys(clickCounts).indexOf(key);
    results[`card${index + 1}_click_count`] = clickCounts[key];
  }
  return results;
}

async function normalizeVideoData(object, page) {
  try {
    const videoUrl = object.post.media[0].play_url;
    await page.goto(videoUrl);
    await page.waitForSelector('.num_playcnt', { timeout: 5000 });
    const element = await page.$('.num_playcnt');
    const countText = await page.evaluate(element => element.textContent, element);
    const count = parseInt(countText.split(',').join(''));
    await page.waitFor(1000);
    return {
      video_play_count: count,
    };
  } catch (err) {
    const error = new VError(`Failed to fetch video data.`);
    error.originalError = err;
    throw error;
  }
}
