const scrape = async (config, options) => {
    const puppeteer = options.puppeteer

    if (!puppeteer) {
        throw new Error('Puppeteer module is required')
    }

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

                switch (item.action) {
                    case 'click': {
                        logger('log', 'Clicking element', item.selector)

                        await page.click(item.selector)

                        logger('log', 'Element clicked', item.selector)

                        break
                    }
                    case 'scroll': {
                        logger('log', 'Scrolling to element', item.selector)

                        await page.waitForSelector(item.selector, { timeout: 5000 })

                        const element = await page.$(item.selector)
                        await element.scrollIntoView()

                        logger('log', 'Element in view', item.selector)

                        break
                    }
                    case 'wait': {
                        logger('log', 'Waiting for element', item.selector)

                        await page.waitForSelector(item.selector, { timeout: 5000 })

                        logger('log', 'Element appeared', item.selector)

                        break
                    }
                    // select action is default and undefined for backward compatibility
                    default: {
                        logger('log', 'Looking for selector', item.selector)

                        const lastItem = config.items[i - 1]

                        if (lastItem?.action === 'click') {
                            await page.waitForSelector(item.selector, { timeout: 5000 })
                        }

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
                            scrapedData = scrapedData[0] ? [scrapedData[0]] : null
                        }

                        results.push({
                            type: 'result',
                            url: page.url(),
                            selector: item.selector,
                            data: scrapedData
                        })
                    }
                }
            } catch (error) {
                if (options.verbose) {
                    logger('error', error)
                } else {
                    logger('error', `Scraping error: ${error.message}`)
                }

                results.push({
                    type: 'error',
                    url: page.url(),
                    error: error.message
                })
            }
        }

        logger('log', 'Done!')

        if (options.outputResults) {
            console.log(JSON.stringify(results, null, options.indentSize))
        }

        return results
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

module.exports = {
    scrape
}
