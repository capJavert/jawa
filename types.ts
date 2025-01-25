export type TScraperSelector = {
    url: string
    selector: string
    action?: 'click'
}

export type TScraperConfig = {
    url: string
    items: TScraperSelector[]
}

export enum EScraperMessageType {
    init = 'jawa-init',
    scrape = 'jawa-scrape',
    ui = 'jawa-ui'
}

export type TScraperMessage<Payload = Record<string, any>> = {
    type: EScraperMessageType
    payload: Payload
}

export enum EScraperErrorMessage {
    timeout = 'jawa-error-timeout',
    generic = 'jawa-error',
    rateLimit = 'jawa-error-rate-limit'
}

export enum EClickMode {
    Select = 'select',
    Navigate = 'navigate'
}
