import type * as puppeteer from 'puppeteer'
import { Tabletojson } from 'tabletojson'

import { type CSSPath, ScrapperActions } from './globalTypes.js'
import { type ScrapperResult } from './types.js'
import { getSelector } from './util.js'

export const scrapeTableInPageAsJSON = (htmlPage: string): string[] => {
    return Tabletojson.convert(htmlPage)
}

export const scrapeTableInPageFromUrlAsHTML = async (
    url: string
): Promise<string[]> => {
    return await Tabletojson.convertUrl(url)
}

export const scrapeItems = async (
    items: CSSPath[],
    page: puppeteer.Page,
    logger: (level: 'log' | 'warn' | 'error', ...args: string[]) => void,
    verbose: boolean
): Promise<ScrapperResult[]> => {
    const results: ScrapperResult[] = []
    const avoidList: string[] = []
    for (let i = 0; i < items.length; i += 1) {
        const item = items[i]
        const { selectors, node, url, action, label, valueToInput } = item
        if (avoidList.includes(url)) {
            continue
        }
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
                    const responses = await scrapeTableInPageFromUrlAsHTML(link)
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
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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
                const linkList = (await page.$$eval(
                    selector,
                    async (
                        elements: HTMLElement[]
                    ): Promise<Array<{ link: string; textContent: string }>> =>
                        elements
                            .map((element) => {
                                const link = element.getAttribute('href')
                                const textContent = element.textContent
                                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                                if (!link) {
                                    return null
                                }
                                const fullLink = link.startsWith('http')
                                    ? link
                                    : `${window.location.href}${link}`
                                return { link: fullLink, textContent }
                            })
                            .filter((link) => link !== null)
                )) as Array<{ link: string; textContent: string }>

                const itemsWithSameUrl = items.filter(
                    (item) => item.url === node.link
                )
                for (const link of linkList) {
                    const newItemsWithNewUrls = []

                    for (const item of itemsWithSameUrl) {
                        newItemsWithNewUrls.push({
                            ...item,
                            url: link.link,
                        })
                    }
                    const newResults = await scrapeItems(
                        // eslint-disable-line no-await-in-loop
                        newItemsWithNewUrls,
                        page,
                        logger,
                        verbose
                    )
                    results.push({
                        type: 'result',
                        url: link.link,
                        selector,
                        label,
                        data: {
                            link: link.link,
                            textContent: link.textContent,
                        },
                    })
                    results.push(...newResults)
                }

                avoidList.push(node.link)

                continue
            }
            if (action === ScrapperActions.CLICK_AND_CONTINUE) {
                await Promise.all([
                    page.click(selector),
                    page.waitForNavigation(),
                ])
                continue
            }
            const data = await page.$$eval(
                selector,
                async (elements: HTMLElement[], args) => {
                    const { action, ScrapperActions, valueToInput } = args
                    const collection = []

                    for (const element of elements) {
                        if (action === ScrapperActions.SCRAPE_CONTENT) {
                            const nodeName = element.localName

                            const selectOptions =
                                nodeName === 'select'
                                    ? {
                                          options: [
                                              ...(element as HTMLSelectElement)
                                                  .options,
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
                                Object.keys(element.dataset ?? {}).length > 0
                                    ? {
                                          ...element.dataset,
                                      }
                                    : undefined
                            const textContent = element.textContent
                            const elementId = element.id
                            const className = element.className
                            const title = element.title
                            const name = element.getAttribute('name') ?? null
                            const alt = element.getAttribute('alt') ?? null
                            const src = element?.getAttribute('src') ?? null
                            const href = element.getAttribute('href') ?? null
                            const forAttr = element.getAttribute('for') ?? null
                            const type = element.getAttribute('type') ?? null

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
                            action === ScrapperActions.INPUT_VALUE_AND_ENTER &&
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
                    }
                    return collection
                },
                { action, ScrapperActions, valueToInput }
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
            if (verbose) {
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
    return results
}
