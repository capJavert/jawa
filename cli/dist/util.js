import { ScrapperActions } from './globalTypes.js';
export const parseJson = (json) => {
    try {
        // TODO: check using zod
        return JSON.parse(json);
    }
    catch (error) {
        return null;
    }
};
export const getSelector = (action, selectors) => {
    if (!action)
        throw new Error('Action is null');
    switch (action) {
        case ScrapperActions.SCRAPE_CONTENT:
            return selectors.commonSelector;
        case ScrapperActions.INPUT_VALUE:
            return selectors.uniqueSelector;
        case ScrapperActions.GO_TO_URL:
            return selectors.commonSelector;
        case ScrapperActions.SCRAPE_CONTENT_FROM_URLS:
            return selectors.commonSelector;
        case ScrapperActions.CLICK_AND_CONTINUE:
            return selectors.uniqueSelector;
        case ScrapperActions.CLICK_AND_SCRAPE_CONTENT:
            return selectors.commonSelector;
        case ScrapperActions.INPUT_VALUE_AND_ENTER:
            return selectors.uniqueSelector;
        default:
            throw new Error('Invalid action');
    }
};
