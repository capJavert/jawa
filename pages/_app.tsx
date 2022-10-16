import '../styles/globals.css'

import FaceIcon from '@mui/icons-material/Face'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import type { Theme } from '@mui/joy/styles'
import { CssVarsProvider } from '@mui/joy/styles'
import Typography from '@mui/joy/Typography'
import { GlobalStyles } from '@mui/system'
import type { AppProps } from 'next/app'

import ColorSchemeToggle from '../components/ColorScheemToggle'
import Layout from '../components/Layout'
import theme from '../theme'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <CssVarsProvider>
            <CssVarsProvider disableTransitionOnChange theme={theme}>
                <GlobalStyles<Theme>
                    styles={theme => ({
                        body: {
                            margin: 0,
                            fontFamily: theme.vars.fontFamily.body
                        }
                    })}
                />
                <Layout.Container>
                    <Layout.Header>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1.5
                            }}
                        >
                            <IconButton
                                tabIndex={-1}
                                size="sm"
                                variant="solid"
                                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                            >
                                <FaceIcon />
                            </IconButton>
                            <Typography component="h1" fontWeight="xl">
                                JAWA visual scraper
                            </Typography>
                        </Box>
                        <Box
                            id="header-top-bar"
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                flexBasis: 600
                            }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
                            <ColorSchemeToggle />
                        </Box>
                    </Layout.Header>
                    <Component {...pageProps} />
                </Layout.Container>
            </CssVarsProvider>
        </CssVarsProvider>
    )
}

export default MyApp
