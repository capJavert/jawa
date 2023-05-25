const allowedHostnames = ['kickass.website', 'kickass.codes', 'kickass.ngrok.io', 'jawa.kickass.codes']
const afterInstallRedirect = 'https://jawa.kickass.codes?extevent=install'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'jawa-init': {
            if (sender.tab) {
                const url = new URL(sender.tab.url)
                const allowedHostNames = allowedHostnames
                // TODO: fix this
                if (true) {
                    allowedHostNames.push('localhost')
                }
                if (allowedHostNames.includes(url.hostname) || true) {
                    return sendResponse({ type: 'jawa-init', ok: true })
                }
            }

            return sendResponse({ type: 'jawa-init', ok: false })
        }
        default:
            break
    }
})
chrome.runtime.onMessage.addListener(function (message, sender) {
    if (message.sendBack) {
        chrome.tabs.sendMessage(sender.tab.id, message)
    }
})

chrome.runtime.onConnectExternal.addListener(port => {
    port.postMessage({ type: 'jawa-init', ok: true })
})

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        // TODO: fix this
        const isDev = true

        chrome.tabs.create({
            url: isDev ? 'http://localhost:3000?extevent=install' : afterInstallRedirect,
            active: true
        })
    }
})
