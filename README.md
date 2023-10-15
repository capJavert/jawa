# Jawa - Visual Scraper

[![npm](https://img.shields.io/npm/v/jawa)](https://www.npmjs.com/package/jawa)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/icjgianfpiifbdpddkadmpcegiffiglk)](https://chrome.google.com/webstore/detail/clippy/icjgianfpiifbdpddkadmpcegiffiglk)

[🇭🇷 Started in Croatia](https://startedincroatia.com)

![DALL·E 2022-10-17 03 53 08 (2)](https://user-images.githubusercontent.com/9803078/196301040-1f1f34b4-e983-4cd8-859b-951b7fa51068.png)

Visual scraper interface, exports to puppeteer script which you can run anywhere. You can try it out here https://jawa.sh

Jawa allows you to visually click elements of any website and then export selectors as a config that you can run in any node environment to scrape the content when needed.

This repo consists of the:
- web app
- cli
- browser extension

## Web app

Web app that provides embedded browser for visually selecting elements and creating the scraper config that you can download and run through the CLI or Cloud.

### Cloud scraping (Beta)

It is now supported to run your scraper config in the cloud directly from web app. Cloud scrapers use the same Jawa CLI. Currently cloud scrapers have limited availability.

If you need more usage you can check out [Jawa Pro](https://jawa.sh?ref=github). 

## CLI

Simple CLI to run configs created and exported from web app. You can run it like this:

```
npx jawa path/to/scraper/config/file.json
```

or `npx jawa --help` to see all the options.

## Browser extension

Browser extension that runs the embedded browser which powers the visual scraper interface. 

It is available on:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/jawa-visual-scraper/icjgianfpiifbdpddkadmpcegiffiglk)
- Chrome extensions also work on all Chromium based browsers like:
    - Opera
    - Microsoft Edge
    - Brave
