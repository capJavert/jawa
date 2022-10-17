import { getInitColorSchemeScript } from '@mui/joy/styles'
import NextDocument, { Head, Html, Main, NextScript } from 'next/document'

class Document extends NextDocument {
    render() {
        return (
            <Html>
                <Head></Head>
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
