export type TScraperSelector = {
    url: string
    selector: string
}

export type TScraperConfig = {
    url: string
    items: TScraperSelector[]
}

export enum EScraperMessageType {
    init = 'jawa-init',
    scrape = 'jawa-scrape'
}

export type TScraperMessage<Payload = Record<string, any>> = {
    type: EScraperMessageType
    payload: Payload
}
