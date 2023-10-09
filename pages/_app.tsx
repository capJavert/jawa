import '../styles/globals.css'

import GitHubIcon from '@mui/icons-material/GitHub'
import SportsBarIcon from '@mui/icons-material/SportsBar'
import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import { Theme } from '@mui/joy/styles'
import { CssVarsProvider } from '@mui/joy/styles'
import Typography from '@mui/joy/Typography'
import { GlobalStyles } from '@mui/system'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'

import ColorSchemeToggle from '../components/ColorScheemToggle'
import { JawaIcon } from '../components/icons/Jawa'
import Layout from '../components/Layout'
import theme from '../theme'

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <>
            <CssVarsProvider disableTransitionOnChange theme={theme} defaultMode="system">
                <DefaultSeo
                    defaultTitle="Jawa - Visual Scraper"
                    titleTemplate="Jawa | %s"
                    description="Visual scraper interface, exports to puppeteer script which you can run anywhere!"
                    openGraph={{
                        images: [
                            {
                                url: 'https://jawa.kickass.codes/thumb.jpg',
                                alt: 'Jawa - Visual Scraper'
                            }
                        ]
                    }}
                />
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
                            sx={theme => ({
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1.5,
                                color: 'black',
                                [theme.getColorSchemeSelector('light')]: {
                                    color: 'black'
                                },
                                [theme.getColorSchemeSelector('dark')]: {
                                    color: 'white'
                                }
                            })}
                        >
                            <JawaIcon width={30} height={30} />

                            <Typography component="h1" fontWeight="xl">
                                Jawa <Typography level="body3">Visual&nbsp;Scraper</Typography>
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
                            <Link href="https://github.com/sponsors/capJavert" passHref>
                                <IconButton
                                    component="a"
                                    size="sm"
                                    color="primary"
                                    variant="outlined"
                                    title="Buy Me a Beer"
                                    target="_blank"
                                >
                                    <SportsBarIcon />
                                </IconButton>
                            </Link>
                            <Link href="https://github.com/capJavert/jawa" passHref>
                                <IconButton
                                    component="a"
                                    size="sm"
                                    color="primary"
                                    variant="outlined"
                                    title="GitHub"
                                    target="_blank"
                                >
                                    <GitHubIcon />
                                </IconButton>
                            </Link>
                            <ColorSchemeToggle />
                        </Box>
                    </Layout.Header>
                    <Component {...pageProps} />
                </Layout.Container>
                <Box
                    sx={{
                        display: {
                            xs: 'none',
                            md: 'block'
                        }
                    }}
                >
                    <Typography
                        sx={{
                            py: 0.5,
                            textAlign: 'center'
                        }}
                        level="body4"
                    >
                        This site is protected by reCAPTCHA and the Google{' '}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="nofollow noreferrer noopener"
                        >
                            Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a href="https://policies.google.com/terms" target="_blank" rel="nofollow noreferrer noopener">
                            Terms of Service
                        </a>{' '}
                        apply.
                    </Typography>
                </Box>
            </CssVarsProvider>
            <Script
                src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_KEY}`}
                strategy="afterInteractive"
            />
        </>
    )
}

export default App
