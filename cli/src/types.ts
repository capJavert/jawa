export interface BaseResult {
    url: string
    label: string
    selector: string
}
export interface ScrapperSuccessfulResult extends BaseResult {
    type: 'result'

    // TODO: Add support for data types
    data: ScrappedContent[] | any
}

export interface ScrapperErrorResult extends BaseResult {
    type: 'error'
    error: string
}

export type ScrapperResult = ScrapperSuccessfulResult | ScrapperErrorResult

export interface ScrappedContent {
    tag: string
    elementId: string
    className: string
    title: string
    name: string
    alt?: string
    src?: string
    href?: string
    for?: string
    type?: string
    value?: string
    dataAttributes?: DOMStringMap
    textContent?: string
    selectOptions?: {
        options: Array<{
            value: string
            label: string
        }>
        currentValue: string
    }
}
