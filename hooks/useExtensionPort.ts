import { useEffect, useState } from 'react'

import { EScraperMessageType } from '../types'

export const useExtensionPort = () => {
    const [extensionPort, setExtensionPort] = useState<chrome.runtime.Port | null | undefined>()

    useEffect(() => {
        let mounted = true
        const extensionId = process.env.NEXT_PUBLIC_EXTENSION_CHROME_ID
        if (!extensionId) {
            return
        }

        let port: chrome.runtime.Port

        const handleExtensionConnection = async () => {
            while (true) {
                if (!mounted) {
                    return
                }

                const browser = window.chrome
                if (browser?.runtime?.connect) {
                    try {
                        port = browser.runtime.connect(extensionId)
                        if (port) {
                            port.onMessage.addListener(response => {
                                if (response && response.type === EScraperMessageType.init && response.ok) {
                                    setExtensionPort(port)
                                }
                            })

                            await new Promise(resolve => {
                                port.onDisconnect.addListener(() => {
                                    setExtensionPort(null)

                                    resolve(true)
                                })
                            })
                        }
                    } catch (error) {
                        console.error('Extension connect error', error)

                        setExtensionPort(null)
                    }
                }

                await new Promise(resolve => {
                    setTimeout(resolve, 1000)
                })
            }
        }

        handleExtensionConnection()

        return () => {
            mounted = false

            if (port) {
                port.disconnect()
            }
        }
    }, [])

    return extensionPort
}
