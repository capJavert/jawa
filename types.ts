export type TScraperSelector = {
    url: string
    selector: string
}

export type TScraperConfig = {
    url: string
    items: TScraperSelector[]
}

export enum EScraperMessageType {
    scrape = 'scrape'
}

export type TScraperMessage<Payload = Record<string, any>> = {
    type: EScraperMessageType
    payload: Payload
}
