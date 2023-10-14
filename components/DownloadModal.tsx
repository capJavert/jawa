import {
    Check as CheckIcon,
    Close as CloseIcon,
    Error as ErrorIcon,
    SendAndArchive as SendAndArchiveIcon
} from '@mui/icons-material'
import {
    Alert,
    AspectRatio,
    Badge,
    Box,
    Button,
    FormControl,
    IconButton,
    Input,
    LinearProgress,
    Link as MuiLink,
    Modal,
    ModalClose,
    ModalDialog,
    Typography
} from '@mui/joy'
import Link from 'next/link'
// @ts-ignore
import * as platformDetect from 'platform-detect'
import { useMemo, useState } from 'react'

import { EScraperErrorMessage } from '../types'
import { getShortHash, promptFileDownload } from '../utils'

const DownloadModal = ({
    download,
    onClose,
    onSubmit,
    onRun
}: {
    download: string | false
    onClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'closeClick') => void
    onSubmit: () => void
    onRun: () => Promise<Record<string, any>>
}) => {
    const [isRunning, setRunning] = useState(false)
    const [result, setResult] = useState<any>()
    const hasError = result instanceof Error

    const downloadFolder = useMemo(() => {
        if (typeof window === 'undefined') {
            return ''
        }

        switch (true) {
            case platformDetect.macos:
            case platformDetect.linux:
                return '~/Downloads/'
            case platformDetect.windows: // TODO see if windows has common downloads location
            default:
                return ''
        }
    }, [])
    const shellSign = useMemo(() => {
        if (typeof window === 'undefined') {
            return ''
        }

        switch (true) {
            case platformDetect.macos:
            case platformDetect.linux:
                return '$'
            case platformDetect.windows:
            default:
                return '>'
        }
    }, [])
    const codeRunSnippet = `npx jawa ${downloadFolder}vscraper-config-${download}.json`

    const alertColor = useMemo(() => {
        if (hasError) {
            if (result.message === EScraperErrorMessage.timeout) {
                return 'neutral'
            }

            return 'danger'
        }

        return 'success'
    }, [result, hasError])

    const alertContent = useMemo(() => {
        if (hasError) {
            if (result.message === EScraperErrorMessage.timeout) {
                return (
                    <Typography level="body2">
                        Page scraping failed due to timeout. During Beta period we have a limit of 10 seconds for
                        execution duration. If you need more time or wish to support the project{' '}
                        <Link target="_blank" href={process.env.NEXT_PUBLIC_CONTACT_HREF as string}>
                            <Typography color="primary" component="u">
                                contact us
                            </Typography>
                        </Link>{' '}
                        or{' '}
                        <Link target="_blank" href={process.env.NEXT_PUBLIC_SPONSOR_HREF as string}>
                            <Typography color="primary" component="u">
                                sponsor with Jawa Pro
                            </Typography>
                        </Link>
                    </Typography>
                )
            }

            return (
                <Typography level="body2">
                    Something went wrong, please try again later. Jawas also logged the error and will look into it.
                </Typography>
            )
        }

        return (
            <Typography level="body2">
                The page was scraped successfully, results download should have triggered automatically, if not{' '}
                <MuiLink
                    underline="always"
                    onClick={() => {
                        const resultJSON = JSON.stringify(result)
                        const resultHash = getShortHash({ payload: resultJSON })

                        promptFileDownload({
                            fileName: `vscraper-results-${resultHash}.json`,
                            content: resultJSON
                        })
                    }}
                >
                    click here
                </MuiLink>
            </Typography>
        )
    }, [result, hasError])

    return (
        <Modal
            open={!!download}
            onClose={onClose}
            sx={{
                borderRadius: 0,
                '& .MuiModal-backdrop': {
                    backdropFilter: 'blur(3px)'
                }
            }}
        >
            <ModalDialog
                variant="outlined"
                size="lg"
                sx={{
                    minWidth: '860px',
                    textAlign: 'center'
                }}
            >
                <ModalClose variant="outlined" />

                <Box
                    sx={{
                        fontSize: '100px',
                        color: '#ffffff'
                    }}
                >
                    <SendAndArchiveIcon fontSize="inherit" color="info" />
                </Box>

                <Typography
                    component="h3"
                    level="h2"
                    sx={{
                        marginBottom: 5
                    }}
                >
                    Download + Run
                </Typography>

                <Typography
                    level="body1"
                    sx={{
                        marginBottom: 3
                    }}
                >
                    Your config is ready, you can run it yourself through our{' '}
                    <Typography level="body1" component="strong" color="info">
                        jawa
                    </Typography>{' '}
                    CLI (command line tool) or in the{' '}
                    <Typography component="strong" color="warning">
                        Cloud
                    </Typography>
                    .
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 3
                    }}
                >
                    <Button
                        color="info"
                        size="lg"
                        sx={{
                            marginRight: 2
                        }}
                        title="Download config"
                        onClick={onSubmit}
                    >
                        Download config
                    </Button>

                    <Typography
                        level="body1"
                        sx={{
                            marginRight: 2
                        }}
                    >
                        or
                    </Typography>

                    <Badge badgeContent="BETA" color="warning">
                        <Button
                            color="info"
                            size="lg"
                            title="Download config"
                            onClick={async () => {
                                try {
                                    setResult(undefined)
                                    setRunning(true)

                                    const result = await onRun()

                                    setResult(result)
                                } catch (error) {
                                    setResult(error)
                                } finally {
                                    setRunning(false)
                                }
                            }}
                            loading={isRunning}
                            loadingPosition="start"
                        >
                            {isRunning ? 'Running...' : 'Run in Cloud'}
                        </Button>
                    </Badge>
                </Box>

                {result && !isRunning && (
                    <Alert
                        sx={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 2 }}
                        size="lg"
                        color={alertColor}
                        variant="solid"
                        invertedColors
                        startDecorator={
                            <AspectRatio
                                variant="solid"
                                ratio="1"
                                sx={{
                                    minWidth: 30,
                                    borderRadius: '50%',
                                    boxShadow: '0 2px 12px 0 rgb(0 0 0/0.2)'
                                }}
                            >
                                <div>{hasError ? <ErrorIcon fontSize="small" /> : <CheckIcon fontSize="small" />}</div>
                            </AspectRatio>
                        }
                    >
                        <Box>{alertContent}</Box>
                    </Alert>
                )}

                <Typography
                    level="body2"
                    sx={{
                        marginBottom: 2
                    }}
                >
                    You can {result ? 'also ' : ''}run config locally with command below after download, only
                    requirement is that you have{' '}
                    <Link
                        href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
                        target="_blank"
                        rel="nofollow noreferrer noopener"
                    >
                        <Typography color="primary" component="u">
                            npm
                        </Typography>
                    </Link>{' '}
                    installed.
                </Typography>

                <FormControl
                    color="info"
                    sx={theme => ({
                        marginBottom: 2,
                        '& .MuiInput-root.Joy-focused:before': {
                            boxShadow: 'none !important'
                        },
                        '& .MuiInput-root:focus-within:before': {
                            boxShadow: 'none !important'
                        },
                        [theme.getColorSchemeSelector('dark')]: {
                            '& .MuiInput-root:hover': {
                                borderColor: 'var(--joy-palette-info-700) !important'
                            }
                        },
                        [theme.getColorSchemeSelector('light')]: {
                            '& .MuiInput-root:hover': {
                                borderColor: 'var(--joy-palette-info-outlinedBorder) !important'
                            }
                        }
                    })}
                >
                    <Input
                        readOnly
                        variant="outlined"
                        value={codeRunSnippet}
                        startDecorator={
                            <Typography color="info" level="inherit">
                                {shellSign}
                            </Typography>
                        }
                        endDecorator={
                            <Button
                                id="copy-command-button"
                                variant="plain"
                                color="neutral"
                                title="Copy"
                                onClick={() => {
                                    navigator.clipboard
                                        .writeText(codeRunSnippet)
                                        .then(() => {
                                            const element = document.getElementById('copy-command-button')

                                            if (element) {
                                                const newInnerText = 'Copied'

                                                if (element.innerText !== newInnerText) {
                                                    let originalInnerText = element.innerText
                                                    element.innerText = newInnerText

                                                    setTimeout(() => {
                                                        element.innerText = originalInnerText
                                                    }, 1000)
                                                }
                                            }
                                        })
                                        .catch(console.error)
                                }}
                            >
                                Copy
                            </Button>
                        }
                    />
                </FormControl>

                <Typography level="body2" component="em">
                    Note: adjust the path to the config file in your terminal depending on your download folder location
                </Typography>
            </ModalDialog>
        </Modal>
    )
}

export default DownloadModal
