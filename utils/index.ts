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
