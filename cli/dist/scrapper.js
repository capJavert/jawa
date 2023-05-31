import { Tabletojson } from 'tabletojson';
import { ScrapperActions } from './globalTypes.js';
import { getSelector } from './util.js';
export const scrapeTableInPageAsJSON = (htmlPage) => {
    return Tabletojson.convert(htmlPage);
};
export const scrapeTableInPageFromUrlAsHTML = async (url) => {
    return await Tabletojson.convertUrl(url);
};
export const scrapeItems = async (items, page, logger, verbose) => {
    var _a, _b, _c;
    const results = [];
    const avoidList = [];
    for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const prevAction = (_b = (_a = items[i - 1]) === null || _a === void 0 ? void 0 : _a.action) !== null && _b !== void 0 ? _b : null;
        const { selectors, node, url, action, label, valueToInput } = item;
        if (avoidList.includes(url)) {
            continue;
        }
        try {
            if (page.url() !== item.url ||
                (prevAction &&
                    ![
                        ScrapperActions.CLICK_AND_CONTINUE,
                        ScrapperActions.CLICK_AND_SCRAPE_CONTENT,
                    ].includes(prevAction))) {
                await page.goto(item.url);
                logger('log', `Navigated to ${item.url}`);
            }
            logger('log', 'Looking for selector', (_c = selectors.commonSelector) !== null && _c !== void 0 ? _c : selectors.uniqueSelector);
            const selector = getSelector(action, selectors);
            if (action === ScrapperActions.SCRAPE_CONTENT_FROM_URLS) {
                const elementsWithLink = (await page.$$eval(selector, async (elements) => elements
                    .map((element) => {
                    const link = element.getAttribute('href');
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    if (!link) {
                        return null;
                    }
                    const fullLink = link.startsWith('http')
                        ? link
                        : `${window.location.href}${link}`;
                    return fullLink;
                })
                    .filter((link) => link !== null)));
                for (const link of elementsWithLink) {
                    if (link.endsWith('.pdf') ||
                        link.endsWith('.doc') ||
                        link.endsWith('.docx') ||
                        link.endsWith('.png') ||
                        link.endsWith('.jpeg') ||
                        link.endsWith('.jpg') ||
                        link.endsWith('.gif') ||
                        link.endsWith('.svg') ||
                        link.endsWith('.zip') ||
                        link.endsWith('.rar') ||
                        link.endsWith('.7z')) {
                        results.push({
                            type: 'result',
                            url,
                            selector,
                            label,
                            data: {
                                link,
                            },
                        });
                        continue;
                    }
                    const responses = await scrapeTableInPageFromUrlAsHTML(link);
                    results.push({
                        type: 'result',
                        url,
                        selector,
                        label,
                        data: responses,
                    });
                }
                continue;
            }
            if (action === ScrapperActions.CLICK_AND_SCRAPE_CONTENT) {
                await Promise.all([
                    page.click(selector),
                    page.waitForNavigation(),
                ]);
                const htmlasString = await page.content();
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!htmlasString) {
                    continue;
                }
                const tableData = scrapeTableInPageAsJSON(htmlasString);
                results.push({
                    type: 'result',
                    url,
                    selector,
                    label,
                    data: tableData,
                });
                continue;
            }
            if (action === ScrapperActions.GO_TO_URL) {
                const linkList = (await page.$$eval(selector, async (elements) => elements
                    .map((element) => {
                    const link = element.getAttribute('href');
                    const textContent = element.textContent;
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    if (!link) {
                        return null;
                    }
                    const fullLink = link.startsWith('http')
                        ? link
                        : `${window.location.href}${link}`;
                    return { link: fullLink, textContent };
                })
                    .filter((link) => link !== null)));
                const itemsWithSameUrl = items.filter((item) => item.url === node.link);
                for (const link of linkList) {
                    const newItemsWithNewUrls = [];
                    for (const item of itemsWithSameUrl) {
                        newItemsWithNewUrls.push(Object.assign(Object.assign({}, item), { url: link.link }));
                    }
                    const newResults = await scrapeItems(
                    // eslint-disable-line no-await-in-loop
                    newItemsWithNewUrls, page, logger, verbose);
                    results.push({
                        type: 'result',
                        url: link.link,
                        selector,
                        label,
                        data: {
                            link: link.link,
                            textContent: link.textContent,
                        },
                    });
                    results.push(...newResults);
                }
                avoidList.push(node.link);
                continue;
            }
            if (action === ScrapperActions.CLICK_AND_CONTINUE) {
                await Promise.all([
                    page.click(selector),
                    page.waitForNavigation(),
                ]);
                continue;
            }
            const data = await page.$$eval(selector, async (elements, args) => {
                var _a, _b, _c, _d, _e, _f, _g;
                const { action, ScrapperActions, valueToInput } = args;
                const collection = [];
                for (const element of elements) {
                    if (action === ScrapperActions.SCRAPE_CONTENT) {
                        const nodeName = element.localName;
                        const selectOptions = nodeName === 'select'
                            ? {
                                options: [
                                    ...element
                                        .options,
                                ].map((option) => ({
                                    value: option.value,
                                    label: option.innerText,
                                })),
                                currentValue: element.value,
                            }
                            : undefined;
                        const dataAttributes = Object.keys((_a = element.dataset) !== null && _a !== void 0 ? _a : {}).length > 0
                            ? Object.assign({}, element.dataset) : undefined;
                        const textContent = element.textContent;
                        const elementId = element.id;
                        const className = element.className;
                        const title = element.title;
                        const name = (_b = element.getAttribute('name')) !== null && _b !== void 0 ? _b : null;
                        const alt = (_c = element.getAttribute('alt')) !== null && _c !== void 0 ? _c : null;
                        const src = (_d = element === null || element === void 0 ? void 0 : element.getAttribute('src')) !== null && _d !== void 0 ? _d : null;
                        const href = (_e = element.getAttribute('href')) !== null && _e !== void 0 ? _e : null;
                        const forAttr = (_f = element.getAttribute('for')) !== null && _f !== void 0 ? _f : null;
                        const type = (_g = element.getAttribute('type')) !== null && _g !== void 0 ? _g : null;
                        const value = element instanceof HTMLFormElement
                            ? element.value
                            : undefined;
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
                        });
                    }
                    if (action === ScrapperActions.INPUT_VALUE &&
                        element instanceof HTMLInputElement) {
                        if (typeof valueToInput === 'boolean') {
                            element.checked = valueToInput;
                        }
                        else {
                            element.value = valueToInput;
                        }
                        element.dispatchEvent(new Event('input'));
                        element.dispatchEvent(new Event('change'));
                    }
                    if (action === ScrapperActions.INPUT_VALUE_AND_ENTER &&
                        element instanceof HTMLInputElement) {
                        if (typeof valueToInput === 'boolean') {
                            element.checked = valueToInput;
                        }
                        else {
                            element.value = valueToInput;
                        }
                        element.dispatchEvent(new Event('input'));
                        element.dispatchEvent(new Event('change'));
                        element.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'Enter',
                        }));
                    }
                }
                return collection;
            }, { action, ScrapperActions, valueToInput });
            results.push({
                type: 'result',
                url,
                selector,
                label,
                data,
            });
        }
        catch (error) {
            const err = error;
            if (verbose) {
                logger('error', error);
            }
            else {
                logger('error', `Scraping error: ${err.message}`);
            }
            results.push({
                label,
                selector: getSelector(action, selectors),
                type: 'error',
                url,
                error: err.message,
            });
        }
    }
    return results;
};
