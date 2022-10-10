const main = async () => {
    const isFrame = window.self !== window.top

    if (
        !isFrame ||
        !(await new Promise(resolve => {
            chrome.runtime.sendMessage({ type: 'init' }, response => {
                resolve(response.ok)
            })
        }))
    ) {
        return
    }

    const src = chrome.runtime.getURL('finder.medv.js')
    const { finder } = await import(src)
    const scraperData = {
        url: window.location.href,
        points: {}
    }

    const numberMatch = /\d/

    window.addEventListener(
        'click',
        event => {
            event.preventDefault()
            event.stopPropagation()

            const selector = finder(event.target, {
                className: name => {
                    const isMinified = ['css', 'jss', 'styled', 'style'].some(item => name.startsWith(item))
                    const hasNumber = numberMatch.test(name)

                    return !isMinified && !hasNumber
                }
            })

            scraperData.points[selector] = {
                selector,
                name: `Point ${Object.keys(scraperData.points).length + 1}`
            }

            window.top.postMessage(
                { url: scraperData.url, selector },
                {
                    targetOrigin: '*'
                }
            )
        },
        true
    )
}

main()
