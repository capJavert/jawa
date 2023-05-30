import { Tabletojson } from 'tabletojson'

import { type ScrappedContent } from './types'

export const scrappeContent = (element: HTMLElement): ScrappedContent => {
    const nodeName = element.nodeName.toLowerCase()

    const selectOptions =
        nodeName === 'select'
            ? {
                  options: [...(element as HTMLSelectElement).options].map(
                      (option) => ({
                          value: option.value,
                          label: option.innerText,
                      })
                  ),
                  currentValue: (element as HTMLSelectElement).value,
              }
            : undefined

    const dataAttributes =
        Object.keys(element.dataset ?? {}).length > 0
            ? {
                  ...element.dataset,
              }
            : undefined
    const textContent = element.textContent
    const elementId = element.id
    const className = element.className
    const title = element.title
    const name = element.getAttribute('name')
    const alt = element.getAttribute('alt')
    const src = element?.getAttribute('src')
    const href = element.getAttribute('href')
    const forAttr = element.getAttribute('for')
    const type = element.getAttribute('type')

    const value = element instanceof HTMLFormElement ? element.value : undefined

    return {
        tag: nodeName,
        elementId,
        className,
        title,
        name,
        alt,
        src,
        href,
        for: forAttr,
        type,
        value,
        dataAttributes,
        textContent,
        selectOptions,
    }
}

export const scrapeTableInPageAsJSON = (htmlPage: string): string[] => {
    return Tabletojson.convert(htmlPage)
}

export const scrapeTableInPageFromUrlAsHTML = async (
    url: string
): Promise<string[]> => {
    return await Tabletojson.convertUrl(url)
}
