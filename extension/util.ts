import { Message } from '../eventMessages'
import { CSSPath, isInput, MessageEvents, ScrapperActions } from '../types'
import { elementsWithInput, elementsWithLink, inputTypesThatNeedOptions } from './constants'

export const getStylingSelector = (element: Element, commonSelector: string, uniqueSelector: string) => {
    const nodeType = element.localName
    const elementType = element.getAttribute('type') || null
    return elementsWithInput.includes(nodeType) || (nodeType === 'button' && elementType === 'submit')
        ? uniqueSelector
        : commonSelector
}

export const getCommonSelector = (
    element: Element,
    commonSelectorForOriginalElement: string,
    uniqueSelectorForElement: string
) => {
    const nodeType = element.localName
    const elementType = element.getAttribute('type') || null
    return elementsWithInput.includes(nodeType) || (nodeType === 'button' && elementType === 'submit')
        ? uniqueSelectorForElement
        : commonSelectorForOriginalElement
}

export const getNode = (element: Element) => {
    const elementType = element.getAttribute('type') || null
    const link = element.getAttribute('href') || null
    const fullLink = link && link.startsWith('http') ? link : `${window.location.href}${link}`
    const nodeType = element.localName

    if (elementsWithInput.includes(nodeType)) {
        if (nodeType && inputTypesThatNeedOptions.includes(nodeType)) {
            const options = (element as HTMLSelectElement).options
            const currentValue = (element as HTMLSelectElement).value

            return {
                nodeType,
                inputType: elementType,
                selectOptions: {
                    options: Array.from(options).map(option => ({
                        value: option.value,
                        label: option.label
                    })),
                    currentValue
                }
            }
        }

        return {
            nodeType,
            inputType: elementType
        }
    }

    if (elementsWithLink.includes(nodeType)) {
        return {
            nodeType,
            link: fullLink
        }
    }

    return {
        nodeType
    }
}

export const updateCSSPath = (selectors: CSSPath[], cssPaths: CSSPath[]) => {
    const blackListed = selectors.filter(selector => selector.blacklisted)
    const nonBlackListed = selectors.filter(selector => !selector.blacklisted)

    if (cssPaths.length > 0) {
        cssPaths.forEach(selector => {
            const { stylingSelector: commonSelector } = selector.selectors
            if (!commonSelector) return
            try {
                const els = window.document.querySelectorAll<HTMLElement>(commonSelector)

                els?.forEach(element => {
                    if (!element) return
                    element.style.outline = ''
                    element.style.backgroundColor = ''
                })
            } catch (error) {
                console.error(error)
            }
        })
    }

    nonBlackListed.forEach(selector => {
        const { color, url } = selector
        if (url !== window.location.href) return
        const { stylingSelector } = selector.selectors
        if (!stylingSelector) return
        try {
            const els = window.document.querySelectorAll<HTMLElement>(stylingSelector)
            els?.forEach(element => {
                element.style.outline = `2px solid ${color}`
                element.style.backgroundColor = `${color}20`
            })
        } catch (error) {
            console.error(error)
        }
    })

    blackListed.forEach(selector => {
        const { color } = selector
        const { uniqueSelector } = selector.selectors

        try {
            const els = window.document.querySelectorAll<HTMLElement>(uniqueSelector)
            els?.forEach(element => {
                element.style.outline = `2px solid ${color}`
                element.style.backgroundColor = `${color}20`
            })
        } catch (error) {
            console.error(error)
        }
    })
    return selectors
}
const eventHandler = (event: Event) => {
    event.stopPropagation()
}
type ApplyActionPayload = Extract<Message, { type: MessageEvents.applyActions }>['payload']
export const applyActions = (payload: ApplyActionPayload) => {
    const { uniqueSelector, kind, value, node } = payload
    const els = window.document.querySelectorAll<HTMLElement>(uniqueSelector)
    els?.forEach(element => {
        if (!element) return
        if (kind === ScrapperActions.CLICK_AND_CONTINUE) {
            element.addEventListener('click', eventHandler, false)
            const event = new MouseEvent('click', { bubbles: true })
            event.stopPropagation = () => {
                return false
            }
            element.dispatchEvent(event)
            element.removeEventListener('click', eventHandler)
            return
        }
        if (isInput(node) && ['checkbox', 'radio'].includes(node.inputType)) {
            ;(element as HTMLInputElement).checked = value === 'true' ? true : false
            element.dispatchEvent(new Event('change', { bubbles: true }))
            return
        }
        ;(element as HTMLInputElement).focus()

        if (kind === ScrapperActions.INPUT_VALUE) {
            ;(element as HTMLInputElement).value = value
            element.dispatchEvent(new Event('change', { bubbles: true }))

            element.dispatchEvent(new Event('input', { bubbles: true }))
        }
        if (kind === ScrapperActions.INPUT_VALUE_AND_ENTER) {
            ;(element as HTMLInputElement).value = value
            element.dispatchEvent(new Event('change', { bubbles: true }))

            element.dispatchEvent(new Event('input', { bubbles: true }))
            enterOnElement(element)
        }
    })
}

const enterOnElement = (node: HTMLElement) => {
    node.dispatchEvent(
        new KeyboardEvent('keydown', {
            code: 'Enter',
            key: 'Enter',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true
        })
    )
    node.dispatchEvent(
        new KeyboardEvent('keyup', {
            code: 'Enter',
            key: 'Enter',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true
        })
    )
}
