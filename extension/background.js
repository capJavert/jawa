const state = {
    ui: {
        clickMode: 'select'
    },
    api: 3
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'jawa-init': {
            return sendResponse({ type: 'jawa-init', ok: true, api: state.api })
        }
        case 'jawa-ui': {
            return sendResponse({ type: 'jawa-ui', payload: state.ui })
        }
        default:
            break
    }
})

chrome.runtime.onConnectExternal.addListener(port => {
    port.postMessage({ type: 'jawa-init', ok: true, api: state.api })

    port.onMessage.addListener(async message => {
        switch (message.type) {
            case 'jawa-ui': {
                const { clickMode } = message.payload

                if (clickMode) {
                    state.ui.clickMode = clickMode

                    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

                    if (tab) {
                        chrome.tabs.sendMessage(tab.id, message)
                    }
                }

                break
            }
            default:
                break
        }
    })
})

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'https://jawa.sh?extevent=install',
            active: true
        })
    }
})
