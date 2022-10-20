import ExtensionIcon from '@mui/icons-material/Extension'
import InfoIcon from '@mui/icons-material/Info'
import Alert from '@mui/joy/Alert'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import Link from 'next/link'
import { ReactEventHandler, useMemo } from 'react'

import { BraveIcon } from './icons/Brave'
import { ChromeIcon } from './icons/Chrome'
import { EdgeIcon } from './icons/Edge'
import { OperaIcon } from './icons/Opera'

const Browser = ({ url, enabled = true, onLoad }: { url: string; enabled: boolean; onLoad?: ReactEventHandler }) => {
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_CHROME_ID
    const downloadLink = `https://chrome.google.com/webstore/detail/jawa-visual-scraper/${extensionId}`
    const browserName = useMemo(() => {
        if (typeof window === 'undefined') {
            return ''
        }

        const userAgent = navigator.userAgent

        switch (true) {
            case typeof (navigator as any).brave !== 'undefined':
                return 'Brave'
            case !!userAgent.match(/opr\//i):
                return 'Opera'
            case !!userAgent.match(/edg/i):
                return 'Edge'
            case !!userAgent.match(/chrome|chromium|crios/i):
            default:
                return 'Chrome'
        }
    }, [])
    const BrowserIcon = useMemo(() => {
        switch (browserName) {
            case 'Brave':
                return BraveIcon
            case 'Opera':
                return OperaIcon
            case 'Edge':
                return EdgeIcon
            case 'Chrome':
            default:
                return ChromeIcon
        }
    }, [browserName])

    if (!enabled) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    fontSize: '100px',
                    flex: 1,
                    p: 2
                }}
            >
                <ExtensionIcon
                    fontSize="inherit"
                    color="primary"
                    sx={{
                        marginBottom: 5
                    }}
                />

                <Typography
                    level="h2"
                    textAlign="center"
                    sx={{
                        marginBottom: 2
                    }}
                >
                    Browser extension not installed
                </Typography>

                <Alert
                    color="info"
                    sx={{
                        marginBottom: 5,
                        alignItems: 'flex-start',
                        maxWidth: '600px'
                    }}
                    startDecorator={<InfoIcon />}
                >
                    <div>
                        <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
                            We can&apos;t load <strong>{url}</strong> until you install our extension.
                        </Typography>
                    </div>
                </Alert>

                <Typography
                    level="body1"
                    sx={{
                        marginBottom: 5,
                        maxWidth: '700px'
                    }}
                >
                    Our companion extension is required so we can load other websites inside your browser and allow you
                    to scrape them.
                </Typography>

                <Link href={downloadLink} passHref>
                    <Button
                        title={`Add to ${browserName}`}
                        onClick={() => {
                            if (url) {
                                localStorage.setItem('saved-install-url', url)
                            }
                        }}
                        component="a"
                        startDecorator={<BrowserIcon width={30} height={30} />}
                        size="lg"
                    >
                        Add to {browserName}
                    </Button>
                </Link>
            </Box>
        )
    }

    return (
        <iframe
            tabIndex={-1}
            src={url}
            id="vscraper"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
            width="100%"
            height="100%"
            frameBorder={0}
            onLoad={onLoad}
        ></iframe>
    )
}

export default Browser
