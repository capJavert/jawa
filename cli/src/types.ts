import { type CSSPath } from './globalTypes.js'

export interface CustomFieldResult {
    type: 'customField'
    label: string
    value: string
    url: string
}
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

export type ScrapperResult =
    | ScrapperSuccessfulResult
    | ScrapperErrorResult
    | CustomFieldResult

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
export interface Item {
    items: CSSPath[]
    customFields: Array<{
        label: string
        value: string
        url: string
    }>
    pagination:
        | {
              enabled: false
              paginationStart: string
              paginationEnd: string
              paginationTemplate: string
          }
        | {
              enabled: true
              paginationStart: string
              paginationEnd: string
              paginationTemplate: string
          }
}
