import { TScraperConfig } from '../types'

export const getConfigResults = async ({
    config
}: {
    config: Omit<TScraperConfig, 'url'>
}): Promise<Record<string, unknown>> => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')

    const options: RequestInit = {
        method: 'POST',
        headers,
        body: JSON.stringify({
            config
        }),
        redirect: 'manual'
    }

    await fetch('/cloud/runners/beta?brr=true', options)

    const response = await fetch('/cloud/runners/beta', options)
    const { results } = await response.json()

    return results
}
