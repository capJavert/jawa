import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
    const router = useRouter()
    const { url: queryUrl } = router.query
    const [url, setUrl] = useState('')
    const [activeUrl, setActiveUrl] = useState(url)
    const [items, setItems] = useState<{ selector: string }[]>(() => [])

    useEffect(() => {
        if (queryUrl) {
            setActiveUrl(queryUrl as string)
            setUrl(queryUrl as string)

            const { url: _url, ...restQuery } = router.query

            router.replace({
                pathname: router.pathname,
                query: restQuery
            })
        }
    }, [queryUrl, router])

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const { url, selector } = event.data

            if (!selector) {
                return
            }

            setItems(current => {
                if (!current.some(item => item.selector === selector)) {
                    return [...current, { url, selector }]
                }

                return current
            })
        }

        window.addEventListener('message', onMessage, false)

        return () => {
            window.removeEventListener('message', onMessage, false)
        }
    }, [])

    return (
        <div className={styles.main}>
            <div className={styles.toolbar}>
                <input
                    onClick={() => {
                        const aElement = document.createElement('a')
                        aElement.setAttribute('download', `vscraper-${Date.now()}.json`)
                        const href = URL.createObjectURL(
                            new Blob(
                                [
                                    JSON.stringify({
                                        url: activeUrl,
                                        items
                                    })
                                ],
                                {
                                    type: 'application/json'
                                }
                            )
                        )
                        aElement.href = href
                        aElement.setAttribute('target', '_blank')
                        aElement.click()
                        URL.revokeObjectURL(href)
                    }}
                    type="button"
                    value="Download"
                />
                {items.map(item => (
                    <div key={item.selector}>{item.selector}</div>
                ))}
            </div>
            <div className={styles.browser}>
                <div className={styles.browserBar}>
                    <form
                        onSubmit={event => {
                            event.preventDefault()

                            setActiveUrl(url)
                        }}
                    >
                        <input
                            className={styles.urlInput}
                            type="url"
                            value={url}
                            onChange={event => setUrl(event.target.value)}
                        />
                        <input className={styles.actionButton} type="submit" value="Go" />
                    </form>
                </div>
                <iframe
                    src={activeUrl}
                    id="vscraper"
                    sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                    width="100%"
                    height="100%"
                ></iframe>
            </div>
        </div>
    )
}

export default Home
