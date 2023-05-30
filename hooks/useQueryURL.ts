import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Control, useController } from 'react-hook-form'

import { urlSchema } from '../lib/zod'
import { TScraperConfig } from '../types'

export const useQueryURL = (control: Control<TScraperConfig, any>) => {
    const router = useRouter()

    const { url: queryUrl, extevent: queryEvent } = router.query
    const [activeUrl, setActiveUrl] = useState('')
    const urlController = useController({ name: 'url', control })

    const [isIframeLoading, setIframeLoading] = useState(false)

    useEffect(() => {
        if (queryUrl) {
            const parsedUrl = urlSchema.safeParse(queryUrl)

            if (parsedUrl.success) {
                setActiveUrl(current => {
                    setIframeLoading(current !== parsedUrl.data)

                    return parsedUrl.data
                })
                urlController.field.onChange(parsedUrl.data)
            }

            const { url: _url, ...restQuery } = router.query

            router.replace({
                pathname: router.pathname,
                query: restQuery
            })
        }
    }, [queryUrl, router, urlController.field])

    return {
        router,
        setActiveUrl,
        setIframeLoading,
        urlController,
        activeUrl,
        isIframeLoading,
        queryEvent
    }
}
