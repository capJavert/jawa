import { finder as uniqueFinder } from '@medv/finder'
import cssPath from 'cssman'

import { Message } from '../../eventMessages'
import { CSSPath, CSSPathPassed, MessageEvents, ResponseEvents, ScrapperActions } from '../../types'
import { elementsWithInput } from '../constants'
import { applyActions, getCommonSelector, getNode, getStylingSelector, updateCSSPath } from '../util'

let cssPaths: CSSPath[] = []

const isFrame = window.self !== window.top

const main = async () => {
    if (
        !isFrame ||
        !(await new Promise(resolve => {
            chrome.runtime.sendMessage(chrome.runtime.id, { type: MessageEvents.init }, response => {
                if (response && response.type === MessageEvents.init && typeof response.ok === 'boolean') {
                    window.postMessage({ type: ResponseEvents.initSuccess }, '*')
                    resolve(response.ok)
                } else {
                    resolve(false)
                }
            })
        }))
    ) {
        return
    }

    const numberMatch = /\d/
    window?.top?.postMessage(
        {
            type: ResponseEvents.pageLoaded,
            payload: {
                url: window.location.href
            }
        },
        {
            targetOrigin: '*'
        }
    )
    window.addEventListener('load', () => {
        window?.top?.postMessage(
            {
                type: ResponseEvents.pageLoaded,
                payload: {
                    url: window.location.href
                }
            },
            {
                targetOrigin: '*'
            }
        )
    })
    window.addEventListener(
        'click',
        event => {
            if ((event as any).stopPropagation() === false) {
                return
            }

            event.preventDefault()
            if (!event.target) {
                return
            }
            const uniqueSelector = uniqueFinder(event.target as Element, {
                className: name => {
                    const isMinified = ['css', 'jss', 'styled', 'style'].some(item => name.startsWith(item))
                    const hasNumber = numberMatch.test(name)

                    return !isMinified && !hasNumber
                }
            })
            const targetElement = event.target as Element
            const parentLink = targetElement?.closest('a')
            const element = parentLink || targetElement
            const stylingSelector = getStylingSelector(element, cssPath(targetElement), uniqueSelector)
            const commonSelector = getCommonSelector(element, cssPath(element), uniqueSelector)

            window?.top?.postMessage(
                {
                    type: ResponseEvents.addCSSPath,
                    payload: {
                        url: window.location.href,
                        selectors: {
                            commonSelector,
                            uniqueSelector,
                            stylingSelector
                        },
                        node: getNode(element)
                    }
                },
                {
                    targetOrigin: '*'
                }
            )
        },
        true
    )
}

function listenForMessages() {
    window.addEventListener('message', event => {
        if (
            [MessageEvents.updateCSSPath, MessageEvents.applyActions, MessageEvents.unsavedChanges].includes(
                event.data.type
            )
        ) {
            chrome.runtime.sendMessage({ sendBack: true, ...event.data })
        }
    })

    chrome.runtime.onMessage.addListener(function (details: Message) {
        if (!isFrame) return
        if (details.type === MessageEvents.updateCSSPath) {
            cssPaths = updateCSSPath(details.payload, cssPaths)
        }
        if (details.type === MessageEvents.applyActions) {
            applyActions(details.payload)
        }
    })
}

main()
listenForMessages()
