let cssPaths = []

const isFrame = window.self !== window.top
const main = async () => {
    if (
        !isFrame ||
        !(await new Promise(resolve => {
            chrome.runtime.sendMessage(chrome.runtime.id, { type: 'jawa-init' }, response => {
                if (response && response.type === 'jawa-init' && typeof response.ok === 'boolean') {
                    resolve(response.ok)
                } else {
                    resolve(false)
                }
            })
        }))
    ) {
        return
    }

    const uniqueFinderSrc = chrome.runtime.getURL('finder.medv.js')
    const { finder: uniqueFinder } = await import(uniqueFinderSrc)

    const src = chrome.runtime.getURL('DOMPresentationUtils.js')
    const DOMContentScript = await import(src)
    const { cssPath } = DOMContentScript.default

    const numberMatch = /\d/

    window.addEventListener(
        'click',
        event => {
            event.preventDefault()
            event.stopPropagation()

            const uniqueSelector = uniqueFinder(event.target, {
                className: name => {
                    const isMinified = ['css', 'jss', 'styled', 'style'].some(item => name.startsWith(item))
                    const hasNumber = numberMatch.test(name)

                    return !isMinified && !hasNumber
                }
            })
            const targetElement = event.target
            const parentLink = targetElement.closest('a')
            const element = parentLink || targetElement
            const stylingSelector = cssPath(targetElement)

            // for element
            const commonSelector = cssPath(element)
            const nodeType = element.nodeName.toLowerCase()
            const inputType = element.type?.toLowerCase()
 
            window.top.postMessage(
                {
                    type: 'jawa-scrape',
                    payload: {
                        url: window.location.href,
                        commonSelector: commonSelector,
                        uniqueSelector: uniqueSelector,
                        nodeType: nodeType,
                        link: element.href ?? null,
                        stylingSelector: stylingSelector || commonSelector,
                        inputType
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
        if (event.data.type === 'update-css-path') {
            chrome.runtime.sendMessage({ sendBack: true, type: event.data.type, data: event.data.payload })
        }
    })

    chrome.runtime.onMessage.addListener(function (details) {
        if (!isFrame || details.type !== 'update-css-path') {
            return
        }
        const selectors = details.data

        const blackListed = selectors.filter(selector => selector.blacklisted)
        const nonBlackListed = selectors.filter(selector => !selector.blacklisted)

        if (cssPaths.length > 0) {
            cssPaths.forEach(selector => {
                const { stylingSelector: commonSelector } = selector
                try {
                    const els = window.document.querySelectorAll(commonSelector)
                    els?.forEach(element => {
                        element.style.outline = ''
                        element.style.backgroundColor = ''
                    })
                } catch (error) {
                    console.error(error)
                }
            })
        }

        cssPaths = selectors
        nonBlackListed.forEach(selector => {
            const { stylingSelector: commonSelector, color } = selector
            try {
                const els = window.document.querySelectorAll(commonSelector)
                els?.forEach(element => {
                    element.style.outline = `2px solid ${color}`
                    element.style.backgroundColor = `${color}20`
                })
            } catch (error) {
                console.error(error)
            }
        })

        blackListed.forEach(selector => {
            const { uniqueSelector, color } = selector
            try {
                const els = window.document.querySelectorAll(uniqueSelector)
                els?.forEach(element => {
                    element.style.outline = `2px solid ${color}`
                    element.style.backgroundColor = `${color}20`
                })
            } catch (error) {
                console.error(error)
            }
        })
    })
}

main()
listenForMessages()
