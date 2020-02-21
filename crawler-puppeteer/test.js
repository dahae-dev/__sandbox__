const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');

const input = require('./input.json');
const chromePath = findChrome();

async function startBrowser() {
  const browser = await puppeteer.launch({
    errecutablePath: chromePath,
    // headless: false,
  });
  const page = await browser.newPage();
  // return {browser, page};
  return { page };
}

// async function loginCheck(page) {
//   try {
//       await page.waitForSelector('#kakaoServiceLogo', { timeout: 10000 });
//       return true;
//   } catch(err) {
//       return false;
//   }
// };

async function playTest(url) {
  const { page } = await startBrowser();
  page.setViewport({width: 1366, height: 768});
  await page.goto(url);

  try {
    await page.type('#loginEmail', input.username);
    await page.type('#loginPw', input.password);
    await page.click('.btn_login');
    await page.waitForNavigation();
    // await page.waitForSelector('.desc_error', { timeout: 10000 }); // 로그인 정보 틀림
  } catch (err) {
    console.log(err)
    const error = new Error('Login failed with wrong input.');
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
  let count = 0;
  while (loadMoreVisible) {
    try {
      await page.waitForXPath(xpath, { timeout: 5000 });
      const [moreButton] = await page.$x(xpath);
      await moreButton.click();
      await page.waitFor(1000);
      await page.screenshot({ path: `./crawler/kakaopf-${count}.png` });
      loadMoreVisible = await isElementVisible(page, xpath);
      count++;
    } catch (err) {
      console.log(err)
    }
  }

  // const loadMorePostsUntilNotFound = async (count = 0) => {
  //   try {
  //     const xpath = '//*[@id="mArticle"]/div[3]/h2';
  //     await page.waitForXPath(xpath, {timeout: 5000});
  //     const [moreButton] = await page.$x(xpath);
  //     console.log(moreButton)
  //     await moreButton.click();
  //     await page.waitFor(1000);
  //     await page.screenshot({ path: `./crawler/kakaopf-${count}.png` });
  //     console.log(count)
  //     return await loadMorePostsUntilNotFound(count + 1);
  //   } catch (err) {
  //     console.log(err)
  //     console.log("Done!")
  //     return count;
  //   }
  // }

  // const totalCount = loadMorePostsUntilNotFound();
  // console.log(totalCount);

  // TODO: handling cookies
  // const cookies = await page.cookies();
  // const page2 = await browser.newPage();

  // // page2.on('response', async (res) => {
  // //   console.log(res)
  // // })

  // await page2.setCookie(...cookies);
  // await page2.goto(url); // Opens page as logged user

  // console.log('Successfully logged in with cookies!');
}

(async () => {
  await playTest('https://center-pf.kakao.com/_zDxoed/statistics/post/individual');
  process.errit(1);
})();


// if (request.resourceType() === 'xhr' && toSubsetURL(request.url()) === `https://center-pf.kakao.com/api/statistics/profiles/_zDxoed/individual/posts/${post_id}`) {
//       const data = await response.json();
//       const card_views = [];
//       for (let media of data.post.media) {
//         card_views.push({
//           id: media.id,
//           title: media.title,
//         })
//       }
//       for (let id in data.medium_view_counts) {
//         const foundMedia = card_views.find((card) => card.id === id)
//         foundMedia['view_counts'] = data.medium_view_counts[id];
//       }
//       for (let id in data.medium_click_counts) {
//         const foundMedia = card_views.find((card) => card.id === id)
//         foundMedia['click_counts'] = data.medium_click_counts[id];
//       }
//       console.log("card_views: ", card_views);
//       const foundPost = items.find((item) => item.post_id === post_id);
//       foundPost["card_views"] = card_views;
//     }
