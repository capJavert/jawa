import { EScraperErrorMessage, TScraperConfig } from '../types'

export const getConfigResults = async ({
    config,
    verificationToken
}: {
    config: Omit<TScraperConfig, 'url'>
    verificationToken: string
}): Promise<Record<string, unknown>> => {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('x-vfy-str', verificationToken)

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

    if (!response.ok) {
        if (response.status === 504) {
            throw new Error(EScraperErrorMessage.timeout)
        } else {
            throw new Error(EScraperErrorMessage.generic)
        }
    }

    const { results } = await response.json()

    return results
}
