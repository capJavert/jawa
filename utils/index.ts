// @ts-ignore
import * as sha1 from 'js-sha1'

export const waitForReCaptcha = async (): Promise<void> => {
    await new Promise(resolve => {
        window.grecaptcha.ready(() => {
            resolve(true)
        })
    })
}

export const getReCaptchaToken = async (): Promise<string> => {
    await waitForReCaptcha()

    const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_KEY as string, { action: 'submit' })

    return token
}

export const getShortHash = ({ payload }: { payload: unknown }): string => {
    const sha1Instance = sha1.create()
    sha1Instance.update(JSON.stringify(payload))
    const hash = sha1Instance.hex() as string
    const shortHash = hash.substring(0, 10)

    return shortHash
}

export const promptFileDownload = ({
    fileName,
    content,
    type = 'application/json'
}: {
    fileName: string
    content: BlobPart
    type?: string
}) => {
    const aElement = document.createElement('a')
    aElement.setAttribute('download', fileName)
    const href = URL.createObjectURL(
        new Blob([content], {
            type
        })
    )
    aElement.href = href
    aElement.setAttribute('target', '_blank')
    aElement.click()
    URL.revokeObjectURL(href)
}
