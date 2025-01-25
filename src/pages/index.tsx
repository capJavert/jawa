import { zodResolver } from '@hookform/resolvers/zod'
import { Portal } from '@mui/base'
import {
    AdsClick as SelectIcon,
    DeleteForever as DeleteForeverIcon,
    Edit as EditIcon,
    HighlightAlt as HighlightAltIcon,
    Launch as NavigateIcon,
    SearchRounded as SearchRoundedIcon,
    Send as SendIcon,
    Tab as TabIcon,
    Warning as WarningIcon
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    Input,
    List,
    ListItem,
    ListItemDecorator,
    Sheet,
    Theme,
    Typography
} from '@mui/joy'
import { useMediaQuery } from '@mui/material'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useController, useFieldArray, useForm } from 'react-hook-form'

import { EClickMode, EScraperMessageType, TScraperConfig, TScraperMessage, TScraperSelector } from '../../types'
import Browser from '../components/Browser'
import DownloadModal from '../components/DownloadModal'
import Layout from '../components/Layout'
import { getConfigResults } from '../dataProvider'
import {
    getPortalContainer,
    getReCaptchaToken,
    getShortHash,
    promptFileDownload,
    schema,
    selectorItemSchema,
    urlSchema
} from '../utils'

const extensionId = process.env.NEXT_PUBLIC_EXTENSION_CHROME_ID

const Home: NextPage = () => {
    const router = useRouter()
    const { control, handleSubmit, formState, getValues } = useForm<TScraperConfig>({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    })
    const selectorsField = useFieldArray({
        control,
        name: 'items'
    })
    const selectorsFieldRef = useRef(selectorsField)
    selectorsFieldRef.current = selectorsField

    const { url: queryUrl, extevent: queryEvent } = router.query
    const [activeUrl, setActiveUrl] = useState('')
    const urlController = useController({ name: 'url', control })

    const [isIframeLoading, setIframeLoading] = useState(false)
    const [downloadPending, setDownloadPending] = useState<string | false>(false)

    useEffect(() => {
        if (queryUrl) {
            const parsedUrl = urlSchema.safeParse(queryUrl)

            if (parsedUrl.success) {
                setActiveUrl(current => {
                    setIframeLoading(current !== parsedUrl.data)

                    return parsedUrl.data
                })
                urlController.field.onChange(parsedUrl.data)
            }

            const { url: _url, ...restQuery } = router.query

            router.replace({
                pathname: router.pathname,
                query: restQuery
            })
        }
    }, [queryUrl, router, urlController.field])

    useEffect(() => {
        const onMessage = (event: MessageEvent<TScraperMessage>) => {
            // TODO add valid origins check

            const { type, payload } = event.data

            if (!type || typeof payload !== 'object' || Array.isArray(payload)) {
                return
            }

            switch (type) {
                case EScraperMessageType.scrape: {
                    const {
                        payload: { url, selector, action }
                    } = event.data as TScraperMessage<TScraperSelector>

                    if (!selectorItemSchema.safeParse({ url, selector }).success) {
                        return
                    }

                    const fieldInstance = selectorsFieldRef.current
                    const lastField = fieldInstance.fields[fieldInstance.fields.length - 1]

                    if (lastField?.selector !== selector) {
                        fieldInstance.append({
                            url,
                            selector,
                            action
                        })
                    }

                    break
                }
                default:
                    break
            }
        }

        window.addEventListener('message', onMessage, false)

        return () => {
            window.removeEventListener('message', onMessage, false)
        }
    }, [])

    const [extensionPort, setExtensionPort] = useState<chrome.runtime.Port | null | undefined>()
    const [extensionApiVersion, setExtensionApiVersion] = useState<number>(2)

    useEffect(() => {
        let mounted = true

        if (!extensionId) {
            return
        }

        let port: chrome.runtime.Port

        const handleExtensionConnection = async () => {
            while (true) {
                if (!mounted) {
                    return
                }

                const browser = window.chrome

                if (browser?.runtime?.connect) {
                    try {
                        port = browser.runtime.connect(extensionId)

                        if (port) {
                            port.onMessage.addListener(response => {
                                if (response && response.type === EScraperMessageType.init && response.ok) {
                                    setExtensionPort(port)
                                    setExtensionApiVersion(response.api || 2)
                                }
                            })

                            await new Promise(resolve => {
                                port.onDisconnect.addListener(() => {
                                    if (browser.runtime.lastError) {
                                        setExtensionPort(null)
                                    }

                                    resolve(true)
                                })
                            })
                        }
                    } catch (error) {
                        console.error('Extension connect error', error)

                        setExtensionPort(null)
                    }
                }

                await new Promise(resolve => {
                    setTimeout(resolve, 1000)
                })
            }
        }

        handleExtensionConnection()

        return () => {
            mounted = false

            if (port) {
                port.disconnect()
            }
        }
    }, [])

    const isExtensionInstalled = !!extensionPort
    const isExtensionInstallPending = typeof extensionPort === undefined

    useEffect(() => {
        if (!isExtensionInstalled) {
            return
        }

        if (queryEvent !== 'install') {
            return
        }

        const savedInstallUrl = localStorage.getItem('saved-install-url')

        if (savedInstallUrl) {
            localStorage.removeItem('saved-install-url')

            const parsedUrl = urlSchema.safeParse(savedInstallUrl)

            if (parsedUrl.success) {
                setActiveUrl(current => {
                    setIframeLoading(current !== parsedUrl.data)

                    return parsedUrl.data
                })
                urlController.field.onChange(parsedUrl.data)
            }

            const { extevent: _extevent, ...restQuery } = router.query

            router.replace({
                pathname: router.pathname,
                query: restQuery
            })
        }
    }, [isExtensionInstalled, queryEvent, urlController.field, router])

    const onSubmit = handleSubmit(values => {
        setActiveUrl(current => {
            setIframeLoading(current !== values.url)

            return values.url
        })
    })

    const { fields } = selectorsField
    const onIframeLoad = useCallback(() => {
        setIframeLoading(false)
    }, [])
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

    const [clickMode, setClickMode] = useState<EClickMode>(EClickMode.Select)

    useEffect(() => {
        if (!extensionPort) {
            return
        }

        try {
            extensionPort.postMessage({
                type: EScraperMessageType.ui,
                payload: {
                    clickMode: clickMode
                }
            })
        } catch (error) {
            //
        }
    }, [extensionPort, clickMode])

    return (
        <>
            {!isMobile && !!downloadPending && (
                <DownloadModal
                    download={downloadPending}
                    onSubmit={handleSubmit(values => {
                        promptFileDownload({
                            fileName: `vscraper-config-${downloadPending}.json`,
                            content: JSON.stringify({
                                items: values.items
                            })
                        })
                    })}
                    onClose={() => {
                        setDownloadPending(false)
                    }}
                    onRun={async () => {
                        const values = getValues()

                        const reCaptchaToken = await getReCaptchaToken()

                        const result = await getConfigResults({
                            config: {
                                items: values.items
                            },
                            verificationToken: reCaptchaToken
                        })

                        const resultJSON = JSON.stringify(result)
                        const resultHash = getShortHash({ payload: resultJSON })

                        promptFileDownload({
                            fileName: `vscraper-results-${resultHash}.json`,
                            content: resultJSON
                        })

                        return result
                    }}
                />
            )}
            <form
                onSubmit={onSubmit}
                onKeyDown={event => {
                    if (event.key !== 'Enter') {
                        return
                    }

                    onSubmit(event)
                }}
            >
                <Portal container={getPortalContainer}>
                    <Box
                        sx={{
                            display: {
                                xs: 'none',
                                md: 'flex'
                            },
                            gap: '15px',
                            flex: 1
                        }}
                    >
                        <Button
                            size="sm"
                            type="button"
                            color="info"
                            endDecorator={<SendIcon />}
                            disabled={fields.length === 0 || !formState.isValid}
                            title="Run it"
                            onClick={handleSubmit(data => {
                                const downloadHash = getShortHash({ payload: JSON.stringify(data) })

                                setDownloadPending(downloadHash)
                            })}
                        >
                            Run&nbsp;it
                        </Button>
                        <Controller
                            name="url"
                            control={control}
                            defaultValue=""
                            render={({ field, fieldState }) => {
                                return (
                                    <FormControl
                                        size="sm"
                                        sx={{
                                            flexBasis: '500px',
                                            display: {
                                                xs: 'none',
                                                sm: 'flex'
                                            }
                                        }}
                                    >
                                        <Input
                                            error={!!fieldState.error}
                                            autoFocus={process.env.NODE_ENV === 'production'}
                                            placeholder="Type a URL"
                                            startDecorator={<SearchRoundedIcon color="primary" />}
                                            value={field.value}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                        />
                                    </FormControl>
                                )
                            }}
                        />
                    </Box>
                </Portal>
            </form>
            <Layout.Container
                flexDirection="row"
                sx={{
                    minHeight: {
                        xs: 'calc(100vh - 81px)',
                        md: 'calc(100vh - 65px)'
                    }
                }}
            >
                <Layout.Side
                    sx={{
                        display: {
                            xs: 'none',
                            md: 'flex'
                        },
                        flexDirection: 'column'
                    }}
                >
                    {!!activeUrl && extensionApiVersion >= 3 && (
                        <>
                            <Sheet
                                sx={{
                                    p: 1
                                }}
                            >
                                <Button
                                    sx={{
                                        minWidth: '160px',
                                        justifyContent: 'space-between'
                                    }}
                                    size="sm"
                                    type="button"
                                    color="primary"
                                    variant="outlined"
                                    endDecorator={clickMode === EClickMode.Select ? <SelectIcon /> : <NavigateIcon />}
                                    disabled={!extensionPort}
                                    title={`Mode: ${clickMode}`}
                                    onClick={() => {
                                        setClickMode(currentClickMode => {
                                            const newClickMode =
                                                currentClickMode === EClickMode.Select
                                                    ? EClickMode.Navigate
                                                    : EClickMode.Select

                                            return newClickMode
                                        })
                                    }}
                                >
                                    Mode:&nbsp;{clickMode}
                                </Button>
                            </Sheet>
                            <Divider />
                        </>
                    )}
                    {fields.length > 0 ? (
                        <Layout.Container
                            sx={{
                                flex: 1
                            }}
                        >
                            {fields.map((field, index) => (
                                <Sheet
                                    key={field.id}
                                    variant="soft"
                                    sx={{
                                        p: 2,
                                        marginBottom: 1
                                    }}
                                >
                                    <Controller
                                        name={`items.${index}.selector`}
                                        control={control}
                                        render={({ field: inputField, fieldState }) => {
                                            return (
                                                <FormControl size="sm">
                                                    <Input
                                                        startDecorator={
                                                            field.action === 'click' ? <NavigateIcon /> : <SelectIcon />
                                                        }
                                                        error={!!fieldState.error}
                                                        name={`items.${index}.selector`}
                                                        placeholder="Selector"
                                                        endDecorator={
                                                            <>
                                                                <IconButton
                                                                    variant="plain"
                                                                    color="neutral"
                                                                    title="Edit item"
                                                                    onClick={() => {
                                                                        const element =
                                                                            document.querySelector<HTMLInputElement>(
                                                                                `input[name="items.${index}.selector"]`
                                                                            )

                                                                        if (element) {
                                                                            element.focus()
                                                                        }
                                                                    }}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                                <IconButton
                                                                    sx={{
                                                                        marginLeft: 2
                                                                    }}
                                                                    variant="plain"
                                                                    color="neutral"
                                                                    title="Remove item"
                                                                    onClick={() => {
                                                                        selectorsField.remove(index)
                                                                    }}
                                                                >
                                                                    <DeleteForeverIcon />
                                                                </IconButton>
                                                            </>
                                                        }
                                                        variant="soft"
                                                        value={inputField.value}
                                                        onChange={inputField.onChange}
                                                        onBlur={inputField.onBlur}
                                                    />
                                                </FormControl>
                                            )
                                        }}
                                    />
                                </Sheet>
                            ))}
                        </Layout.Container>
                    ) : (
                        <Layout.Container
                            sx={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 2,
                                textAlign: 'center'
                            }}
                        >
                            {activeUrl && isExtensionInstalled && (
                                <>
                                    <Box
                                        sx={{
                                            fontSize: '75px'
                                        }}
                                    >
                                        <HighlightAltIcon fontSize="inherit" color="primary" />
                                    </Box>
                                    <Typography>
                                        Select elements from the website on the right to load their selectors for
                                        scraping.
                                    </Typography>
                                </>
                            )}
                        </Layout.Container>
                    )}
                </Layout.Side>
                <Layout.Main
                    sx={{
                        position: 'relative'
                    }}
                >
                    {isIframeLoading && isExtensionInstalled && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(0, 0, 0, 0.5);'
                            }}
                        >
                            <CircularProgress color="primary" size="lg" />
                        </Box>
                    )}
                    {activeUrl && !isExtensionInstallPending && !isMobile ? (
                        <Browser url={activeUrl} enabled={isExtensionInstalled} onLoad={onIframeLoad} />
                    ) : (
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
                            <TabIcon fontSize="inherit" color="primary" />

                            <Typography
                                level="h1"
                                textAlign="center"
                                sx={{
                                    marginTop: 5,
                                    marginBottom: 2
                                }}
                            >
                                Welcome to Visual Scraper
                            </Typography>

                            <Typography
                                level="body1"
                                sx={{
                                    marginBottom: 5
                                }}
                            >
                                We <Typography color="info">Jawa</Typography> are here to help you scrape content from
                                any website quick and easy.
                            </Typography>

                            <Alert
                                color="warning"
                                sx={{
                                    display: {
                                        xs: 'flex',
                                        md: 'none'
                                    },
                                    marginBottom: 5,
                                    alignItems: 'flex-start'
                                }}
                                startDecorator={<WarningIcon sx={{ mt: '4px', mx: '4px' }} />}
                            >
                                <div>
                                    <Typography fontWeight="lg" mt={0.25}>
                                        Warning
                                    </Typography>
                                    <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
                                        To use this tool you have to use a desktop browser.
                                    </Typography>
                                </div>
                            </Alert>

                            <Typography
                                level="h3"
                                textAlign="center"
                                sx={{
                                    marginBottom: 2
                                }}
                            >
                                How it works?
                            </Typography>
                            <List
                                component="ol"
                                size="sm"
                                sx={{
                                    listStyleType: 'decimal',
                                    flex: 0,
                                    marginBottom: 5
                                }}
                            >
                                <ListItem>
                                    <ListItemDecorator>⌨</ListItemDecorator>Type a URL
                                </ListItem>
                                <ListItem>
                                    <ListItemDecorator>👈</ListItemDecorator>Click on any element to select them
                                </ListItem>
                                <ListItem>
                                    <ListItemDecorator>😎</ListItemDecorator>Adjust selectors or add custom labels (if
                                    needed)
                                </ListItem>
                                <ListItem>
                                    <ListItemDecorator>🚀</ListItemDecorator>Run it!
                                </ListItem>
                                <ListItem>
                                    <ListItemDecorator>✅</ListItemDecorator>Collect your data! (JSON format)
                                </ListItem>
                            </List>

                            <Typography level="body1" component="em">
                                ~ Utinni!
                            </Typography>
                        </Box>
                    )}
                </Layout.Main>
            </Layout.Container>
        </>
    )
}

export default Home
