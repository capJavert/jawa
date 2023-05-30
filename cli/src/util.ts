import { BaseNode, NodeInput, ScrapperActions } from '../../types'

export const parseJson = <T>(json: string): T => {
    try {
        // TODO: check using zod
        return JSON.parse(json)
    } catch (error) {
        return null
    }
}

export const getSelector = (
    action: ScrapperActions,
    selectors: {
        commonSelector: string
        uniqueSelector: string
    }
): string => {
    switch (action) {
        case ScrapperActions.SCRAPE_CONTENT:
            return selectors.commonSelector
        case ScrapperActions.INPUT_VALUE:
            return selectors.uniqueSelector
        case ScrapperActions.GO_TO_URL:
            return selectors.commonSelector
        case ScrapperActions.SCRAPE_CONTENT_FROM_URLS:
            return selectors.commonSelector
        case ScrapperActions.CLICK_AND_CONTINUE:
            return selectors.uniqueSelector
        case ScrapperActions.CLICK_AND_SCRAPE_CONTENT:
            return selectors.commonSelector
        case ScrapperActions.INPUT_VALUE_AND_ENTER:
            return selectors.uniqueSelector
        default:
            throw new Error('Invalid action')
    }
}
