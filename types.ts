export type TScraperSelectorFromExtension = {
    url: string
    commonSelector: string | null
    uniqueSelector: string | null
    nodeType: string | null
}

export type TScraperSelector = {
    url: string
    commonSelector: string
    uniqueSelector: string
    nodeType: string
    color: string
    blacklisted: boolean
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
