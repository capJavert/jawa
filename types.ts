export type BaseNode = {
    nodeType: string
}
export type NodeLink = BaseNode & {
    link: string
}

export type NodeInput = BaseNode & {
    inputValue: string
}

export type TScraperSelectorFromExtension = {
    url: string
    selectors: {
        stylingSelector: string | null
        commonSelector: string
        uniqueSelector: string
    }
    node: NodeLink | NodeInput | BaseNode
}
export enum ScrapeActions {
    'SCRAPE_CONTENT' = 'SCRAPE_CONTENT',
    'INPUT_VALUE' = 'INPUT_VALUE',
    'GO_TO_URL' = 'GO_TO_URL',
    'SCRAPE_CONTENT_FROM_URLS' = 'SCRAPE_CONTENT_FROM_URLS'
}

export enum CustomFields {
    'dateScrapped' = 'DATE_SCRAPPED',
    'websiteLanguage' = 'WEBSITE_LANGUAGE'
}

export type TScraperSelector = {
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
    action: ScrapeActions | null
}

export type TScraperConfigFromExtension = {
    url: string
    items: TScraperSelectorFromExtension[]
}

export type TScraperConfig = {
    url: string
    items: TScraperSelector[]
}

export enum EScraperMessageType {
    init = 'jawa-init',
    scrape = 'jawa-scrape',
    update = 'update-css-path'
}

export type TScraperMessage<Payload = Record<string, any>> = {
    type: EScraperMessageType
    payload: Payload
}

export const isNeitherNullNorUndefined = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined
}
