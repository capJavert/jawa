import { ScrapeActions } from '../types'

//TODO: FIX THIS
export const determineActions = (nodeType: string) => {
    if (nodeType === 'a') {
        return [ScrapeActions.GO_TO_URL, ScrapeActions.SCRAPE_CONTENT, ScrapeActions.SCRAPE_CONTENT_FROM_URLS]
    }
    if (['input', 'textarea', 'select', 'radio'].includes(nodeType)) {
        return [ScrapeActions.INPUT_VALUE, ScrapeActions.SCRAPE_CONTENT]
    }
    if (nodeType === 'button') {
        return [ScrapeActions.GO_TO_URL, ScrapeActions.SCRAPE_CONTENT]
    }
    return [ScrapeActions.SCRAPE_CONTENT]
}

export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
