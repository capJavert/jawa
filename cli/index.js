#!/usr/bin/env node
const puppeteer = require('puppeteer')
const fs = require('fs').promises
const yargsInstance = require('yargs')
const { hideBin } = require('yargs/helpers')

const scrape = async (configPath, options) => {
    const jsonData = (await fs.readFile(configPath)).toString()
    const config = JSON.parse(jsonData)

    console.log('Loaded config')

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    page.emulate({
        name: 'Desktop',
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        viewport: {
            width: 1600,
            height: 900
        }
    })

    if (!config.url) {
        throw new Error('Config invalid, missing url')
    }

    if (!Array.isArray(config.items)) {
        throw new Error('Config invalid, Array expected for items')
    }

    console.log('Scraping URL', config.url)

    await page.goto(config.url)

    const results = await Promise.allSettled(
        config.items.map(async item => {
            if (options.verbose) {
                console.log('Find selector', item.selector)
            }

            return {
                selector: item.selector,
                textContent: await page.$eval(item.selector, element => element.textContent)
            }
        })
    )

    await browser.close()

    results.forEach(result => {
        if (result.status === 'fulfilled') {
            console.log(result.value)
        } else {
            console.error(result.reason)
        }
    })
}

yargsInstance(hideBin(process.argv))
    .command({
        command: '$0 <configPath>',
        describe: 'scrape the URLs and data from JSON config',
        builder: yargs => {
            yargs.positional('configPath', {
                describe:
                    'path to JSON config file, use visual scraper on https://vscraper.kickass.codes or create it yourself'
            })
        },
        handler: argv => {
            scrape(argv.configPath, { verbose: argv.verbose })
        }
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
        default: false
    })
    .parse()
