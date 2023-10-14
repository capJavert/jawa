chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'jawa-init': {
            if (sender.tab) {
                const url = new URL(sender.tab.url)
                const allowedHostNames = [
                    'kickass.website',
                    'kickass.codes',
                    'kickass.ngrok.io',
                    'jawa.kickass.codes',
                    'jawa.sh'
                ]

                if (allowedHostNames.includes(url.hostname)) {
                    return sendResponse({ type: 'jawa-init', ok: true })
                }
            }

            return sendResponse({ type: 'jawa-init', ok: false })
        }
        default:
            break
    }
})

chrome.runtime.onConnectExternal.addListener(port => {
    port.postMessage({ type: 'jawa-init', ok: true })
})

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'https://jawa.sh?extevent=install',
            active: true
        })
    }
})
