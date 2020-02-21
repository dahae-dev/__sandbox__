/* eslint-disable @typescript-eslint/no-use-before-define */
const url = require('url');
const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');
const dotProp = require('dot-prop');

const input = require('./input.json');
const chromePath = findChrome();

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    // headless: false,
    // userDataDir: '.local-chrome-data' // TODO: something like this...
  });
  const page = await browser.newPage();
  return {page};
}

async function playTest(url) {
  const {page} = await startBrowser();
  await page.goto(url);

  // TODO: data directory 에서 user 정보 가져와서 자동 로그인 되게끔
  // TODO: page.url() / get page url and compare with https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts -> 로그인 체크

  try {
    await page.type('#loginEmail', input.username);
    await page.type('#loginPw', input.password);
    await page.click('.btn_login');
    await page.waitForNavigation();
    await page.screenshot({ path: './crawler/screenshot/kakaopf.png', fullPage: true });

    // TODO: user data -> data directory (브라우저에 user 정보 저장)

    // TODO: check url to verify if you are on right page
    // if (isSomethingWrong) {
    //   throw new Error(`Invalid Input`);
    // }

    console.log("Successfully logged in!")
  } catch (err) {
    console.log(err)
    const error = new Error(`Login failed.`);
    error.originalError = err;
    throw error;
  }

  // const map = new Map()

  const items = [];
  let isDone = false;

  page.on('response', async (response) => {
    const request = response.request();
    if (request.resourceType() === 'xhr' && toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts`) {
      const data = await response.json();
      items.push(...data.items);

      if (items.length >= input.range) {
        isDone = true;
      }
    }

    const postIdExists = () => items.some((e) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${e.post_id}`)
    if (request.resourceType() === 'xhr' && postIdExists()) {
      const item = items.find((e) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${e.post_id}`)
      const details = await response.json();
      console.log("details: ", details);
      item['details'] = details;
      // const resolve = map.get(item.post_id)
      // resolve(data)
    }
  })

  setImmediate(() => { })
  await page.goto(url);

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

  let count = 1;

  // eslint-disable-next-line no-unmodified-loop-condition
  while (loadMoreVisible && !isDone) {
    try {
      await page.waitForXPath(buttonXpath, { timeout: 5000 });
      const [loadMoreButton] = await page.$x(buttonXpath);
      await loadMoreButton.click(); // 1회 클릭시 5개 포스트씩
      await page.waitFor(1000);
      await page.screenshot({ path: `./crawler/screenshot/kakaopf-${count}.png`, fullPage: true });
      loadMoreVisible = await isElementVisible(page, buttonXpath);
      count++;
    } catch (err) {
      console.log(err);
      const error = new Error(`Failed at loading more posts.`);
      error.originalError = err;
      throw error;
    }
  }
  console.log("Done loading posts!");
  console.log("posts: ", items.length);

  items.forEach(async (item, index) => {
    const xpathDetail = getXpathForDetails(index);
    await page.waitForXPath(xpathDetail, { timeout: 5000 });
    const [detailButton] = await page.$x(xpathDetail);
    await detailButton.click();
    await page.waitFor(1000); // TODO: waitForResponse() api 찾아보기!
    const xpathClose = `/html/body/div[3]/div[2]/div/div[3]/button`;
    await page.waitForXPath(xpathClose, { timeout: 5000 });
    const [closeButton] = await page.$x(xpathClose);
    await closeButton.click();
  })

  // items.forEach((item, index) => {
  //   const xpathDetail = getXpathForDetails(index);
  //   await page.waitForXPath(xpathDetail, { timeout: 5000 });
  //   const [detailButton] = await page.$x(xpathDetail);

  //   const p = new Promise((resolve) => {
  //     page.on('response', async (response) => {
  //       const request = response.request();
  //       const postIdExists = () => items.some((e) => toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${e.post_id}`)
  //       if (request.resourceType() === 'xhr' && postIdExists()) {
  //         const data = await response.json();
  //         itemsB.push(...data)
  //         resolve(data)
  //         // TODO: off event listener
  //       }

  //       await page.waitFor(1000);
  //       // }
  //     })
  //   })

  //   await detailButton.click();

  //   await p

  //   //   const _resolve = () => {}
  //   //   const cbP = new Promise((resolve) => (_resolve = resolve))
  //   //   map.set(item.post_id, _resolve)

  //   // const r = await cbP;
  //   // arr.push(...r)
  // })
  console.log("posts: ", items);

}

(async () => {
  await playTest("https://center-pf.kakao.com/_zDxoed/statistics/post/individual");
  process.exit(1);
})();

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
    // type : dotProp.get(object, 'post.type'),
    published_at: new Date(dotProp.get(object, 'post.published_at')).toISOString().split('T')[0],
    title: dotProp.get(object, 'post.title'),
    view_count: dotProp.get(object, 'view_count'),
    like_count: dotProp.get(object, 'post.like_count'),
    share_count: dotProp.get(object, 'post.share_count'),
    comment_count: dotProp.get(object, 'post.comment_count'),
  };
}

function getXpathForDetails(index) {
  return `//*[@id="mArticle"]/div[2]/table/tbody/tr[${index + 1}]/td[5]/div/button`;
}
