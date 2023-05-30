import { ScrapperActions } from '../types'

//TODO: FIX THIS
export const determineActions = (nodeType: string, inputType: null | string) => {
    if (nodeType === 'a') {
        return [ScrapperActions.GO_TO_URL, ScrapperActions.SCRAPE_CONTENT, ScrapperActions.SCRAPE_CONTENT_FROM_URLS]
    }
    if (['input', 'textarea', 'select', 'button'].includes(nodeType)) {
        if (inputType === 'submit' || inputType === 'button') {
            return [
                ScrapperActions.CLICK_AND_CONTINUE,
                ScrapperActions.CLICK_AND_SCRAPE_CONTENT,
                ScrapperActions.SCRAPE_CONTENT
            ]
        }
        return [ScrapperActions.INPUT_VALUE, ScrapperActions.SCRAPE_CONTENT, ScrapperActions.INPUT_VALUE_AND_ENTER]
    }
    if (nodeType === 'button') {
        return [ScrapperActions.CLICK_AND_CONTINUE, ScrapperActions.SCRAPE_CONTENT]
    }
    return [ScrapperActions.SCRAPE_CONTENT]
}

export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
export const isNeitherNullNorUndefined = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined
}

export const elementsWithInput = ['input', 'textarea', 'select', 'button']
export const elementsWithLink = ['a']
export const elementsWithNavigation = ['input', 'button']
export const elementWithNavigationInputType = ['submit']
