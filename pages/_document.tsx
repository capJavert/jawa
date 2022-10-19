import { getInitColorSchemeScript } from '@mui/joy/styles'
import NextDocument, { Head, Html, Main, NextScript } from 'next/document'

class Document extends NextDocument {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/site.webmanifest" />
                </Head>
                <body>
                    {getInitColorSchemeScript({
                        defaultMode: 'system'
                    })}
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default Document
