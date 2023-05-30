#!/usr/bin/env node
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { promises as fs } from 'fs'
import puppeteer from 'puppeteer'
import yargs, { type ArgumentsCamelCase } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { type CSSPath, ScrapperActions } from '../../types'
import {
    scrapeTableInPageAsJSON,
    scrapeTableInPageFromUrlAsHTML,
    scrappeContent,
} from './scrapper'
import { type ScrapperResult } from './types'
import { getSelector, parseJson } from './util'

const scrape = async (
    configPath,
    options: {
        verbose: boolean
        quiet: boolean
        userAgent: string
        indentSize: number
    }
): Promise<void> => {
    let browser

    const logger = (level: string, ...args: string[]): void => {
        if (!options.quiet) {
            console[level](...args)
        }
    }

    try {
        // TODO: validate using zod
        const jsonData = (await fs.readFile(configPath)).toString()
        const config = parseJson<{ items: CSSPath[] }>(jsonData)

        logger('log', 'Loaded config')

        logger('log', 'Starting headless browser')

        browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.emulate({
            name: 'Desktop',
            userAgent: options.userAgent,
            viewport: {
                width: 1600,
                height: 900,
            },
        })

        if (!Array.isArray(config.items)) {
            throw new Error('Config invalid, Array expected for items')
        }

        logger('log', 'Scraping started')

        const results: ScrapperResult[] = []

        for (let i = 0; i < config.items.length; i += 1) {
            const item = config.items[i]
            const { selectors, node, url, action, label, valueToInput } = item
            try {
                if (page.url() !== item.url) {
                    await page.goto(item.url)
                    logger('log', `Navigated to ${item.url}`)
                }

                logger(
                    'log',
                    'Looking for selector',
                    selectors.commonSelector ?? selectors.uniqueSelector
                )
                const selector = getSelector(action, selectors)

                const data = await page.$$eval(
                    selector,
                    async (elements: HTMLElement[]) => {
                        const collection = []
                        if (
                            action === ScrapperActions.SCRAPE_CONTENT_FROM_URLS
                        ) {
                            for (const element of elements) {
                                const link = element.getAttribute('href')
                                if (
                                    link.endsWith('.pdf') ||
                                    link.endsWith('.doc') ||
                                    link.endsWith('.docx') ||
                                    link.endsWith('.png') ||
                                    link.endsWith('.jpeg') ||
                                    link.endsWith('.jpg') ||
                                    link.endsWith('.gif') ||
                                    link.endsWith('.svg') ||
                                    link.endsWith('.zip') ||
                                    link.endsWith('.rar') ||
                                    link.endsWith('.7z')
                                ) {
                                    collection.push(scrappeContent(element))
                                    continue
                                }
                                const responses =
                                    await scrapeTableInPageFromUrlAsHTML(link)
                                collection.push(responses)
                            }
                            return
                        }
                        for (const element of elements) {
                            if (action === ScrapperActions.SCRAPE_CONTENT) {
                                collection.push(scrappeContent(element))
                            }
                            if (
                                action === ScrapperActions.INPUT_VALUE &&
                                element instanceof HTMLInputElement
                            ) {
                                if (typeof valueToInput === 'boolean') {
                                    element.checked = valueToInput
                                } else {
                                    element.value = valueToInput
                                }
                                element.dispatchEvent(new Event('input'))
                                element.dispatchEvent(new Event('change'))
                            }

                            if (
                                action ===
                                    ScrapperActions.INPUT_VALUE_AND_ENTER &&
                                element instanceof HTMLInputElement
                            ) {
                                if (typeof valueToInput === 'boolean') {
                                    element.checked = valueToInput
                                } else {
                                    element.value = valueToInput
                                }
                                element.dispatchEvent(new Event('input'))
                                element.dispatchEvent(new Event('change'))
                                element.dispatchEvent(
                                    new KeyboardEvent('keydown', {
                                        key: 'Enter',
                                    })
                                )
                            }
                            if (action === ScrapperActions.CLICK_AND_CONTINUE) {
                                const event = new MouseEvent('click', {
                                    bubbles: true,
                                })
                                element.dispatchEvent(event)
                                await page.waitForNavigation()
                            }
                            if (
                                action ===
                                ScrapperActions.CLICK_AND_SCRAPE_CONTENT
                            ) {
                                const event = new MouseEvent('click', {
                                    bubbles: true,
                                })
                                element.dispatchEvent(event)
                                await page.waitForNavigation()
                                const getHTMLasText = page.evaluate(
                                    () => document.documentElement.innerText
                                )
                                collection.push(
                                    scrapeTableInPageAsJSON(getHTMLasText)
                                )
                            }
                        }
                    }
                )

                results.push({
                    type: 'result',
                    url,
                    selector,
                    label,
                    data,
                })
            } catch (error) {
                const err = error as Error
                if (options.verbose) {
                    logger('error', error)
                } else {
                    logger('error', `Scraping error: ${err.message}`)
                }

                results.push({
                    label,
                    selector: getSelector(action, selectors),
                    type: 'error',
                    url,
                    error: err.message,
                })
            }
        }

        logger('log', 'Done!')
    } catch (error) {
        const err = error as Error
        if (options.verbose) {
            console.error(error)
        } else {
            console.error(`Error: ${err.message}`)
        }
    } finally {
        if (browser != null) {
            await browser.close()
        }
    }
}

interface Arguments {
    configPath: string
    verbose: boolean
    quiet: boolean
    userAgent: string
    indentSize: number
}
/** @ts-expect-error */
yargs(hideBin(process.argv))
    .command({
        command: '$0 <configPath>',
        describe: 'scrape the URLs and data from JSON config',
        builder: (yargs) => {
            yargs.positional('configPath', {
                describe:
                    'path to JSON config file, use visual scraper on https://jawa.kickass.codes or create it yourself',
            })
        },
        handler: (argv: ArgumentsCamelCase<Arguments>) => {
            scrape(argv.configPath, {
                verbose: argv.verbose,
                quiet: argv.quiet,
                userAgent: argv.userAgent,
                indentSize: argv.indentSize,
            })
        },
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
        default: false,
    })
    .option('quiet', {
        alias: 'q',
        type: 'boolean',
        description:
            'Do not log any messages except the final scraping results',
        default: false,
    })
    .option('user-agent', {
        alias: 'ua',
        type: 'string',
        description: 'Set user agent to be used during scraping',
        default:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 JawaVS',
    })
    .option('indent-size', {
        type: 'number',
        description: 'Set results indent size',
        default: 4,
    })
    .parse()
