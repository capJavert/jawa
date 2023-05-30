export type BaseNode = {
    nodeType: HTMLElement['localName']
    link: never
    inputValue: never
    selectOptions: never
}
export type NodeLink = {
    nodeType: 'a'
    link: string
    inputValue: never
    selectOptions: never
}

export type NodeInput = {
    nodeType: 'input' | 'textarea' | 'select'
    link: never
    inputType: string
    selectOptions: {
        options: {
            value: string
            label: string
        }[]
        currentValue: string
    }
}
export enum ScrapperActions {
    'SCRAPE_CONTENT' = 'SCRAPE_CONTENT',
    'INPUT_VALUE' = 'INPUT_VALUE',
    'GO_TO_URL' = 'GO_TO_URL',
    'SCRAPE_CONTENT_FROM_URLS' = 'SCRAPE_CONTENT_FROM_URLS',
    'CLICK_AND_CONTINUE' = 'CLICK_AND_CONTINUE',
    'CLICK_AND_SCRAPE_CONTENT' = 'CLICK_AND_SCRAPE_CONTENT',
    'INPUT_VALUE_AND_ENTER' = 'INPUT_VALUE_AND_ENTER'
}

export enum CustomFieldsEnum {
    'dateScrapped' = 'dateScrapped'
}

export type TScraperConfig = {
    url: string
    items: CSSPath[]
}
export enum MessageEvents {
    init = 'init',
    updateCSSPath = 'update-css-path',
    applyActions = 'apply-actions',
    unsavedChanges = ' unsaved-changes'
}
export enum ResponseEvents {
    addCSSPath = 'add-css-path',
    initSuccess = 'init-success',
    checkForUnsavedChanges = 'check-for-unsaved-changes',
    pageLoaded = 'page-loaded'
}

export type CSSPathPassed = {
    url: string
    selectors: {
        stylingSelector: string | null
        commonSelector: string
        uniqueSelector: string
    }
    node: NodeLink | NodeInput | BaseNode
}

export type CSSPath = {
    url: string
    selectors: {
        stylingSelector: string | null
        commonSelector: string
        uniqueSelector: string
    }
    node: NodeLink | NodeInput | BaseNode
    color: string
    blacklisted: boolean
    label: string
    value: string | null
    valueToInput: string | boolean | null
    action: ScrapperActions | null
}

export const isLink = (node: NodeLink | NodeInput | BaseNode): node is NodeLink => {
    return node.nodeType === 'a'
}

export const isInput = (node: NodeLink | NodeInput | BaseNode): node is NodeInput => {
    return ['input', 'textarea', 'select'].includes(node.nodeType)
}
