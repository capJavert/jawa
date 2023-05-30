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
    scrapeTableInPageAsJSON,
    scrapeTableInPageFromUrlAsHTML,
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
    let browser: puppeteer.Browser | null = null
    const urlBlackList = []
    const logger = (level: string, ...args: string[]): void => {
        if (!options.quiet) {
            console[level](...args)
        }
    }

    try {
        // TODO: validate using zod
        const jsonData = (await fs.readFile(configPath)).toString()
        const config = parseJson<{ items: CSSPath[] }>(jsonData)

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

        const results: ScrapperResult[] = []
        // TODO: remove this
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        page.on('console', async (msg) => {
            const msgArgs = msg.args()
            for (let i = 0; i < msgArgs.length; ++i) {
                console.log(await msgArgs[i].jsonValue())
            }
        })
        const { items } = config
        for (let i = 0; i < items.length; i += 1) {
            const item = config.items[i]
            const prevAction = config.items[i - 1]?.action ?? null
            const { selectors, url, action, label, valueToInput } = item
            try {
                if (
                    page.url() !== item.url &&
                    ![
                        ScrapperActions.CLICK_AND_CONTINUE,
                        ScrapperActions.CLICK_AND_SCRAPE_CONTENT,
                    ].includes(prevAction)
                ) {
                    await page.goto(item.url)
                    logger('log', `Navigated to ${item.url}`)
                }

                // check if page hasn't loaded and wait for it
                if (
                    [
                        ScrapperActions.CLICK_AND_CONTINUE,
                        ScrapperActions.CLICK_AND_SCRAPE_CONTENT,
                    ].includes(prevAction)
                ) {
                    //TODO: check if page has loaded -
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                }

                logger(
                    'log',
                    'Looking for selector',
                    selectors.commonSelector ?? selectors.uniqueSelector
                )
                const selector = getSelector(action, selectors)
                if (action === ScrapperActions.SCRAPE_CONTENT_FROM_URLS) {
                    const elementsWithLink = (await page.$$eval(
                        selector,
                        async (elements: HTMLElement[]): Promise<string[]> =>
                            elements
                                .map((element) => {
                                    const link = element.getAttribute('href')
                                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                                    if (!link) {
                                        return null
                                    }
                                    const fullLink = link.startsWith('http')
                                        ? link
                                        : `${window.location.href}${link}`
                                    return fullLink
                                })
                                .filter((link) => link !== null)
                    )) as string[]
                    for (const link of elementsWithLink) {
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
                            results.push({
                                type: 'result',
                                url,
                                selector,
                                label,
                                data: {
                                    link,
                                },
                            })
                            continue
                        }
                        const responses = await scrapeTableInPageFromUrlAsHTML(
                            link
                        )
                        results.push({
                            type: 'result',
                            url,
                            selector,
                            label,
                            data: responses,
                        })
                    }
                    continue
                }
                if (action === ScrapperActions.CLICK_AND_SCRAPE_CONTENT) {
                    await Promise.all([
                        page.click(selector),
                        page.waitForNavigation(),
                    ])
                    const htmlasString = await page.content()
                    if (!htmlasString) {
                        continue
                    }
                    const tableData = scrapeTableInPageAsJSON(htmlasString)
                    results.push({
                        type: 'result',
                        url,
                        selector,
                        label,
                        data: tableData,
                    })
                    continue
                }
                if (action === ScrapperActions.GO_TO_URL) {
                    const exampleElementLink = await page.$$eval(
                        selectors.uniqueSelector,
                        async (elements: HTMLElement[]): Promise<string> => {
                            const element = elements[0]
                            const link = element.getAttribute('href')
                            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                            if (!link) {
                                return null
                            }
                            const fullLink = link.startsWith('http')
                                ? link
                                : `${window.location.href}${link}`
                            return fullLink
                        }
                    )
                    const linkList = (await page.$$eval(
                        selector,
                        async (elements: HTMLElement[]): Promise<string[]> =>
                            elements
                                .map((element) => {
                                    const link = element.getAttribute('href')
                                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                                    if (!link) {
                                        return null
                                    }
                                    const fullLink = link.startsWith('http')
                                        ? link
                                        : `${window.location.href}${link}`
                                    return fullLink
                                })
                                .filter((link) => link !== null)
                    )) as string[]
                    const itemsWithLink = config.items.filter((item) => {
                        return item.url === exampleElementLink
                    })

                    urlBlackList.push(exampleElementLink)

                    // TODO: then just scrape
                }
                const data = await page.$$eval(
                    selector,
                    async (elements, args) => {
                        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type

                        const [action, ScrapperActions, valueToInput] = args
                        const collection = []

                        for (const element of elements) {
                            if (action === ScrapperActions.SCRAPE_CONTENT) {
                                const nodeName = element.localName

                                const selectOptions =
                                    nodeName === 'select'
                                        ? {
                                              options: [
                                                  ...(
                                                      element as HTMLSelectElement
                                                  ).options,
                                              ].map((option) => ({
                                                  value: option.value,
                                                  label: option.innerText,
                                              })),
                                              currentValue: (
                                                  element as HTMLSelectElement
                                              ).value,
                                          }
                                        : undefined

                                const dataAttributes =
                                    Object.keys(element.dataset ?? {}).length >
                                    0
                                        ? {
                                              ...element.dataset,
                                          }
                                        : undefined
                                const textContent = element.textContent
                                const elementId = element.id
                                const className = element.className
                                const title = element.title
                                const name =
                                    element.getAttribute('name') ?? null
                                const alt = element.getAttribute('alt') ?? null
                                const src = element?.getAttribute('src') ?? null
                                const href =
                                    element.getAttribute('href') ?? null
                                const forAttr =
                                    element.getAttribute('for') ?? null
                                const type =
                                    element.getAttribute('type') ?? null

                                const value =
                                    element instanceof HTMLFormElement
                                        ? element.value
                                        : undefined

                                collection.push({
                                    tag: nodeName,
                                    elementId,
                                    className,
                                    title,
                                    name,
                                    alt,
                                    src,
                                    href,
                                    for: forAttr,
                                    type,
                                    value,
                                    dataAttributes,
                                    textContent,
                                    selectOptions,
                                })
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
                            }
                        }
                        return collection
                    },
                    [
                        action,
                        ScrapperActions,
                        valueToInput,
                        scrapeTableInPageFromUrlAsHTML,
                        scrapeTableInPageAsJSON,
                        page,
                    ]
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
            // TODO: uncomment this
            // await browser.close()
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