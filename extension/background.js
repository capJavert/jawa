chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'init': {
            if (sender.tab) {
                const url = new URL(sender.tab.url)
                const allowedHostNames = ['kickass.website', 'kickass.codes', 'kickass.ngrok.io', 'jawa.kickass.codes']

                if (allowedHostNames.includes(url.hostname)) {
                    return sendResponse({ type: 'init', ok: true })
                }
            }

            return sendResponse({ type: 'init', ok: false })
        }
        default:
            break
    }
})

chrome.runtime.onConnectExternal.addListener(port => {
    port.postMessage({ type: 'init', ok: true })
})

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'https://jawa.kickass.codes?extevent=install',
            active: true
        })
    }
})
