import SendAndArchiveIcon from '@mui/icons-material/SendAndArchive'
import Badge from '@mui/joy/Badge'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import ModalDialog from '@mui/joy/ModalDialog'
import TextField from '@mui/joy/TextField'
import Typography from '@mui/joy/Typography'
import Link from 'next/link'
// @ts-ignore
import * as platformDetect from 'platform-detect'
import { useMemo, useState } from 'react'

const DownloadModal = ({
    download,
    onClose,
    onSubmit,
    onRun
}: {
    download: string | false
    onClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'closeClick') => void
    onSubmit: () => void
    onRun: () => Promise<void>
}) => {
    const [isRunning, setRunning] = useState(false)

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

    return (
        <Modal
            open={!!download}
            onClose={onClose}
            sx={{
                borderRadius: 0
            }}
            componentsProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(3px)'
                    }
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
                                    setRunning(true)

                                    await onRun()
                                } catch (error) {
                                    console.error(error)
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

                <Typography
                    level="body2"
                    sx={{
                        marginBottom: 2
                    }}
                >
                    You can run config locally with command below after download, only requirement is that you have{' '}
                    <Link href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm">
                        <a target="_blank" rel="nofollow noreferrer noopener">
                            <Typography color="primary" component="u">
                                npm
                            </Typography>
                        </a>
                    </Link>{' '}
                    installed.
                </Typography>

                <TextField
                    sx={theme => ({
                        marginBottom: 2,
                        '& .JoyInput-root.Joy-focused:before': {
                            boxShadow: 'none'
                        },
                        [theme.getColorSchemeSelector('dark')]: {
                            '& .JoyInput-root:hover': {
                                borderColor: 'var(--joy-palette-info-700) !important'
                            }
                        },
                        [theme.getColorSchemeSelector('light')]: {
                            '& .JoyInput-root:hover:not(.Joy-focused)': {
                                borderColor: 'var(--joy-palette-info-outlinedBorder) !important'
                            }
                        }
                    })}
                    componentsProps={{
                        input: {
                            readOnly: true
                        }
                    }}
                    variant="outlined"
                    color="info"
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

                <Typography level="body2" component="em">
                    Note: adjust the path to the config file in your terminal depending on your download folder location
                </Typography>
            </ModalDialog>
        </Modal>
    )
}

export default DownloadModal
