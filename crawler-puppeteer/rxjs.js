/* eslint-disable @typescript-eslint/no-use-before-define */
const url = require('url');
const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');
const {fromEvent, defer, race, timer, empty, of} = require('rxjs');
const {
  filter,
  takeUntil,
  map,
  mergeMap,
  combineLatest,
  takeWhile,
  switchMap,
  last,
  scan,
  startWith,
  expand,
  delay,
  share,
  zip,
  take,
} = require('rxjs/operators');
const dotProp = require('dot-prop');

const input = require('./input.json');
const chromePath = findChrome();

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    // headless: false,
  });
  const page = await browser.newPage();
  return {page};
}

async function playTest(url) {
  const { page } = await startBrowser();
  await page.goto(url);

  try {
    await page.type('#loginEmail', input.username);
    await page.type('#loginPw', input.password);
    await page.click('.btn_login');
    await page.waitForNavigation();
    await page.screenshot({ path: './crawler/screenshot/kakaopf.png', fullPage: true });
    console.log("Successfully logged in!")
  } catch (err) {
    console.log(err)
    const error = new Error(`Login failed.`);
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

  const buttonXpath = '//*[@id="mArticle"]/div[3]/h2';
  let loadMoreVisible = await isElementVisible(page, buttonXpath);

  const clickRange = input.range / 5;
  let count = 1;

  while (loadMoreVisible && count < clickRange) {
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

  if (count === clickRange) {
    console.log("Done loading posts!");
  }

  const responseEventSource$ = fromEvent(page, 'response');
  const responseSource$ = responseEventSource$
    .pipe(
      filter((response) => {
        const request = response.request();
        return (
          request.resourceType() === 'xhr' &&
          toSubsetURL(request.url()) ===
            'https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts'
        );
      }),
      mergeMap(async (response) => {
        const data = await response.json();
        return data.items;
      }),
      filter((posts) => Boolean(posts)),
      map((posts) => posts.map(normalizeFixedData)),
    )
    .subscribe((posts) => console.log(posts));

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

// function getPostsObject(object) {
//   return dotProp.get(
//     object,
//     'items',
//   );
// }

function normalizeFixedData(object) {
  return {
    id: dotProp.get(object, 'post_id'),
    published_at: dotProp.get(object, 'post.published_at'),
    title: dotProp.get(object, 'post.title'),
    view_count: dotProp.get(object, 'view_count'),
    like_count: dotProp.get(object, 'post.like_count'),
    share_count: dotProp.get(object, 'post.share_count'),
    comment_count: dotProp.get(object, 'post.comment_count'),
  };
}

