/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
const url = require('url');
var fs = require("fs");
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

  const initialData = await page.evaluate(() => {
    const results = [];
    const posts = document.querySelectorAll('article');
    posts.forEach((post) => {
      let timestamp = post.querySelector('time').innerText;
      if (!timestamp.includes("년")) {
        timestamp = new Date().getFullYear() + '년 ' + timestamp;
        if (!timestamp.includes("월")) {
          timestamp = new Date().getFullYear() + '년 ' + (new Date().getMonth() + 1) + '월 ' + new Date().getDate() + '일';
        }
      }
      const content = post.querySelector('.userContent').textContent;
      const url = 'https://www.facebook.com' + post.querySelector('._5pcq').getAttribute('href');
      const likes = post.querySelector('._81hb').innerText;
      results.push({
        timestamp,
        content,
        url,
        likes,
      })
    })
    return results;
  })

  const postData = await scrollDownAndScrape(page, initialData, scrapePosts, input.date, 3000);
  fs.writeFileSync('posts.json', JSON.stringify(postData));
  await page.close();
  process.exit(1);
})();

// --- helper functions ---

async function scrapePosts() {
  const results = [];
  const posts = document.querySelectorAll('.userContentWrapper');
  posts.forEach((post) => {
    let timestamp = post.querySelector('.timestampContent').innerText;
    if (!timestamp.includes('년')) {
      timestamp = new Date().getFullYear() + '년 ' + timestamp;
      if (!timestamp.includes('월')) {
        timestamp = new Date().getFullYear() + '년 ' + (new Date().getMonth() + 1) + '월 ' + new Date().getDate() + '일';
      }
    }
    const content = post.querySelector('.userContent').textContent;
    const url = 'https://www.facebook.com' + post.querySelector('._5pcq').getAttribute('href');
    const likes = post.querySelector('._81hb').innerText;
    results.push({
      timestamp,
      content,
      url,
      likes,
    })
  })
  return results;
}

async function scrollDownAndScrape(page, initialData, scrapePosts, date, scrollDelay = 1000) {
  let posts = initialData;

  try {
    let prevHeight = 0;
    let lastPostDate = posts[posts.length - 1]['timestamp'];
    while (`${lastPostDate.split(' ')[0]}년 ${lastPostDate.split(' ')[1]}월 ${lastPostDate.split(' ')[2]}일` >= date) {
      posts = await page.evaluate(scrapePosts);
      prevHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${prevHeight}`);
      await page.waitFor(scrollDelay);
      lastPostDate = posts[posts.length - 1]['timestamp'];
    }
  } catch (e) {}

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
