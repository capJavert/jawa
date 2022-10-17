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
