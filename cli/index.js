#!/usr/bin/env node
const fs = require('fs').promises
const yargsInstance = require('yargs')
const { hideBin } = require('yargs/helpers')

const scrape = async (configPath, options) => {
    const puppeteer = options.puppeteer || require('puppeteer')

    if (typeof puppeteer.launch !== 'function') {
        throw new Error('Invalid puppeteer module')
    }

    let browser

    const logger = (level, ...args) => {
        if (!options.quiet) {
            console[level](...args)
        }
    }

    try {
        const jsonData = (await fs.readFile(configPath)).toString()
        const config = JSON.parse(jsonData)

        logger('log', 'Loaded config')

        logger('log', 'Starting headless browser')

        browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.emulate({
            name: 'Desktop',
            userAgent: options.userAgent,
            viewport: {
                width: 1600,
                height: 900
            }
        })

        if (!Array.isArray(config.items)) {
            throw new Error('Config invalid, Array expected for items')
        }

        logger('log', 'Scraping started')

        const results = []

        for (let i = 0; i < config.items.length; i += 1) {
            const item = config.items[i]
            try {
                if (page.url() !== item.url) {
                    await page.goto(item.url)

                    logger('log', `Navigated to ${item.url}`)
                }

                logger('log', 'Looking for selector', item.selector)

                let scrapedData = await page.$$eval(item.selector, elements =>
                    elements.map(element => ({
                        tag: element.tagName?.toLowerCase() || undefined,
                        elementId: element.id || undefined,
                        className: element.className || undefined,
                        title: element.title || undefined,
                        name: element.getAttribute('name') || undefined,
                        alt: element.getAttribute('alt') || undefined,
                        src: element.src || undefined,
                        href: element.href || undefined,
                        for: element.getAttribute('for') || undefined,
                        type: element.type || undefined,
                        value: element.value || undefined,
                        dataAttributes:
                            Object.keys(element.dataset || {}).length > 0
                                ? {
                                      ...element.dataset
                                  }
                                : undefined,
                        textContent: element.textContent
                    }))
                )

                if (scrapedData.length < 2) {
                    scrapedData = scrapedData[0] || null
                }

                results.push({
                    type: 'result',
                    url: item.url,
                    selector: item.selector,
                    data: scrapedData
                })
            } catch (error) {
                if (options.verbose) {
                    logger('error', error)
                } else {
                    logger('error', `Scraping error: ${error.message}`)
                }

                results.push({
                    type: 'error',
                    url: item.url,
                    error: error.message
                })
            }
        }

        logger('log', 'Done!')

        console.log(JSON.stringify(results, null, options.indentSize))
    } catch (error) {
        if (options.verbose) {
            console.error(error)
        } else {
            console.error(`Error: ${error.message}`)
        }
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

yargsInstance(hideBin(process.argv))
    .command({
        command: '$0 <configPath>',
        describe: 'scrape the URLs and data from JSON config',
        builder: yargs => {
            yargs.positional('configPath', {
                describe:
                    'path to JSON config file, use visual scraper on https://jawa.kickass.codes or create it yourself'
            })
        },
        handler: argv => {
            scrape(argv.configPath, {
                verbose: argv.verbose,
                quiet: argv.quiet,
                userAgent: argv.userAgent,
                indentSize: argv.indentSize
            })
        }
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
        default: false
    })
    .option('quiet', {
        alias: 'q',
        type: 'boolean',
        description: 'Do not log any messages except the final scraping results',
        default: false
    })
    .option('user-agent', {
        alias: 'ua',
        type: 'string',
        description: 'Set user agent to be used during scraping',
        default:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 JawaVS'
    })
    .option('indent-size', {
        type: 'number',
        description: 'Set results indent size',
        default: 4
    })
    .parse()

module.exports = {
    scrape
}
