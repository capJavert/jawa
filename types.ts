export type ScraperSelector = {
    url: string
    selector: string
}

export type ScraperConfig = {
    url: string
    items: ScraperSelector[]
}
