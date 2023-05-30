#!/usr/bin/env node
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { promises as fs } from 'fs'
import * as puppeteer from 'puppeteer'
import yargs, { type ArgumentsCamelCase } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { type CSSPath, ScrapperActions } from './globalTypes'
import {
    scrapeItems,
    scrapeTableInPageAsJSON,
    scrapeTableInPageFromUrlAsHTML,
} from './scrapper'
import { type Item, type ScrapperResult } from './types'
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
    let browser: puppeteer.Browser | null = null
    const logger = (level: string, ...args: string[]): void => {
        if (!options.quiet) {
            console[level](...args)
        }
    }

    try {
        // TODO: validate using zod
        const jsonData = (await fs.readFile(configPath)).toString()
        const config = parseJson<Item>(jsonData)

        if (!Array.isArray(config.items)) {
            throw new Error('Config invalid, Array expected for items')
        }

        logger('log', 'Loaded config')

        logger('log', 'Starting headless browser')

        browser = await puppeteer.launch({
            headless: false,
        })
        const page = await browser.newPage()
        await page.emulate({
            userAgent: options.userAgent,
            viewport: {
                width: 1600,
                height: 900,
            },
        })
        page.exposeFunction('scrapeTableInPageAsJSON', scrapeTableInPageAsJSON)
        page.exposeFunction(
            'scrapeTableInPageFromUrlAsHTML',
            scrapeTableInPageFromUrlAsHTML
        )
        page.exposeFunction('waitForNavigation', page.waitForNavigation)

        logger('log', 'Scraping started')

        // TODO: remove this
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        page.on('console', async (msg) => {
            console.log(msg.text())
        })
        const { items, customFields, pagination } = config
        const results: ScrapperResult[] = []

        if (pagination.enabled) {
            const { paginationStart, paginationEnd, paginationTemplate } =
                pagination
            const start = parseInt(paginationStart)
            const end = parseInt(paginationEnd)
            if (isNaN(start) || isNaN(end)) {
                throw new Error('Pagination start and end must be numbers')
            }
            const firstUrl = items[0].url
            const paginatedUrls = [firstUrl]
            for (let i = start; i < end; i++) {
                paginatedUrls.push(
                    paginationTemplate.replace(/{{page}}/g, i.toString())
                )
            }
            for (const url of paginatedUrls) {
                const updatedItems = items.map((item) => {
                    if (item.url === firstUrl) {
                        return {
                            ...item,
                            url,
                        }
                    }
                    return item
                })

                const result = await scrapeItems(
                    updatedItems,
                    page,
                    logger,
                    options.verbose
                )
                results.push(...result)
            }
        } else {
            const result = await scrapeItems(
                items,
                page,
                logger,
                options.verbose
            )
            results.push(...result)
        }
        for (const customField of customFields) {
            const { label, value, url } = customField
            let customFieldValue = null
            const pattern1 = /\{\{(.*?)\}\}/g
            if (pattern1.test(value)) {
                const key = value.replace(pattern1, '$1')
                if (key === 'dateScrapped') {
                    customFieldValue = new Date().toISOString()
                }
            }
            const pattern2 = /"([^"]*)"/g
            if (pattern2.test(value)) {
                const val = value.replace(pattern2, '$1')
                customFieldValue = val
            }
            if (!customFieldValue) {
                continue
            }
            results.push({
                type: 'customField',
                label,
                value: customFieldValue,
                url,
            })
        }

        logger('log', 'Done!')
        console.log(JSON.stringify(results, null, options.indentSize))
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
