chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'init': {
            if (sender.tab) {
                const url = new URL(sender.tab.url)
                const allowedHostNames = ['localhost', 'kickass.website', 'kickass.codes', 'kickass.ngrok.io']

                if (allowedHostNames.includes(url.hostname)) {
                    return sendResponse({ ok: true })
                }
            }

            return sendResponse({ ok: false })
        }
        default:
            break
    }
})
