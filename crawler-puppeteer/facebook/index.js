/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
const url = require('url');
var fs = require("fs");
const puppeteer = require('puppeteer-core');
const findChrome = require('chrome-finder');
const VError = require('verror');

const input = require('./input.json');
const chromePath = findChrome();
const profilePath = getProfilePathByOs();

async function startBrowser() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    userDataDir: profilePath,
    args: ['--lang=ko-kr,ko'],
    headless: false,
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  });
  const page = await browser.newPage();
  return {
    page,
  };
}


// --- main ---

(async () => {
  const {
    page,
  } = await startBrowser();
  await page.goto(input.url);
  const initialData = await scrapePosts(page);
  const postData = await scrollDownAndScrape(page, initialData, scrapePosts, input.date, 3000);
  fs.writeFileSync('posts.json', JSON.stringify(postData));
  await page.close();
  process.exit(1);
})();

// --- helper functions ---

async function scrapePosts(page) {
  const results = [];
  const posts = await page.$$('.userContentWrapper');
  for (let post of posts) {
    if (post) {
      const timestampEl = await post.$('.timestampContent');
      let timestamp = timestampEl ? await page.evaluate(el => el.textContent, timestampEl) : "";
      if (!timestamp.includes('년')) {
        if (!timestamp.includes('월')) {
          timestamp = new Date().getFullYear() + '년 ' + (new Date().getMonth() + 1) + '월 ' + new Date().getDate() + '일';
        } else {
          timestamp = new Date().getFullYear() + '년 ' + `${timestamp.split(' ')[0]} ${timestamp.split(' ')[1]}`;
        }
      }
      timestamp = timestamp.split(' ').map((str) => {
        const d = str.match(/(\d+)/)[0]
        if (d.length === 1) {
          return '0' + d;
        }
        return d;
      }).join('-');
      const contentEl = await post.$('.userContent');
      const content = contentEl ? await page.evaluate(el => el.textContent, contentEl) : "";
      const urlEl = await post.$('._5pcq');
      const url = urlEl ? await page.evaluate(el => el.href, urlEl) : "";
      const likesEl = await post.$('._81hb');
      const likes = likesEl ? await page.evaluate(el => el.textContent, likesEl) : "";
      results.push({
        timestamp,
        content,
        url,
        likes,
      })
    }
  }
  return results;
}

async function scrollDownAndScrape(page, initialData, scrapePosts, date, scrollDelay = 1000) {
  let posts = initialData;

  try {
    let prevHeight = 0;
    let lastPostDate = posts[posts.length - 1]['timestamp'];
    while (lastPostDate >= date) {
      posts = await scrapePosts(page);
      prevHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${prevHeight}`);
      await page.waitFor(scrollDelay);
      lastPostDate = posts[posts.length - 1]['timestamp'];
    }
  } catch (err) {
    const error = new VError(`Failed to scrape posts.`);
    error.originalError = err;
    throw error;
  }

  return posts;
}

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
