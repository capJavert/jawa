import { ClassNames } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import Portal from '@mui/base/Portal'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SendIcon from '@mui/icons-material/Send'
import TabIcon from '@mui/icons-material/Tab'
import WarningIcon from '@mui/icons-material/Warning'
import { Theme } from '@mui/joy'
import Alert from '@mui/joy/Alert'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import CircularProgress from '@mui/joy/CircularProgress'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Sheet from '@mui/joy/Sheet'
import TextField from '@mui/joy/TextField'
import Typography from '@mui/joy/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useController, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import Browser from '../components/Browser'
import Layout from '../components/Layout'
import { EScraperMessageType, TScraperConfig, TScraperMessage, TScraperSelector } from '../types'

const schema = z.object({
    url: z.string().url({ message: 'Invalid URL' }).min(1, { message: 'Required' })
})

const getPortalContainer = (() => () => {
    let container

    if (!container) {
        container = document.getElementById('header-top-bar')
    }

    return container
})()

const Home: NextPage = () => {
    const router = useRouter()
    const { control, handleSubmit } = useForm<TScraperConfig>({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    })
    const selectorsField = useFieldArray({
        control,
        name: 'items'
    })
    const selectorsFieldRef = useRef(selectorsField)
    selectorsFieldRef.current = selectorsField

    const { url: queryUrl } = router.query
    const [activeUrl, setActiveUrl] = useState('')
    const urlController = useController({ name: 'url', control })

    const [isIframeLoading, setIframeLoading] = useState(false)

    useEffect(() => {
        if (queryUrl && schema.safeParse({ url: queryUrl }).success) {
            setActiveUrl(current => {
                setIframeLoading(current !== queryUrl)

                return queryUrl as string
            })
            urlController.field.onChange(queryUrl as string)

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
                        payload: { url, selector }
                    } = event.data as TScraperMessage<TScraperSelector>

                    if (!selector) {
                        return
                    }

                    if (!schema.safeParse({ url }).success) {
                        return
                    }

                    const fieldInstance = selectorsFieldRef.current
                    const currentField = fieldInstance.fields.find(item => item.selector === selector)

                    if (!currentField) {
                        fieldInstance.append({
                            url,
                            selector
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

    useEffect(() => {
        let mounted = true
        const extensionId = process.env.NEXT_PUBLIC_EXTENSION_CHROME_ID

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
                                if (response && response.type === 'init' && response.ok) {
                                    setExtensionPort(port)
                                }
                            })

                            await new Promise(resolve => {
                                port.onDisconnect.addListener(() => {
                                    setExtensionPort(null)

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
    const isExtensionInstalled = !!extensionPort
    const isExtensionInstallPending = typeof extensionPort === undefined
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

    return (
        <>
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
                            color="neutral"
                            endDecorator={<SendIcon />}
                            disabled={fields.length === 0}
                            onClick={() => {
                                const aElement = document.createElement('a')
                                aElement.setAttribute('download', `vscraper-${Date.now()}.json`)
                                const href = URL.createObjectURL(
                                    new Blob(
                                        [
                                            JSON.stringify({
                                                url: activeUrl,
                                                items: fields
                                            })
                                        ],
                                        {
                                            type: 'application/json'
                                        }
                                    )
                                )
                                aElement.href = href
                                aElement.setAttribute('target', '_blank')
                                aElement.click()
                                URL.revokeObjectURL(href)

                                // TODO present modal with run instructions
                                // add do not show again button
                            }}
                        >
                            Run it
                        </Button>
                        <Controller
                            name="url"
                            control={control}
                            defaultValue=""
                            render={({ field, fieldState }) => {
                                return (
                                    <TextField
                                        error={!!fieldState.error}
                                        size="sm"
                                        placeholder="Type a URL"
                                        startDecorator={<SearchRoundedIcon color="primary" />}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        sx={{
                                            flexBasis: '500px',
                                            display: {
                                                xs: 'none',
                                                sm: 'flex'
                                            }
                                        }}
                                    />
                                )
                            }}
                        />
                    </Box>
                </Portal>
            </form>
            <Layout.Container
                flexDirection="row"
                sx={{
                    height: {
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
                        }
                    }}
                >
                    <Layout.Container
                        sx={{
                            flex: 1
                        }}
                    >
                        {fields.map(field => (
                            <Sheet
                                key={field.id}
                                variant="soft"
                                sx={{
                                    p: 2,
                                    marginBottom: 1
                                }}
                            >
                                {field.selector}
                            </Sheet>
                        ))}
                    </Layout.Container>
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
                                We Jawa are here to help you scrape content from any website quick and easy.
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
                                    <ListItemDecorator>✅</ListItemDecorator>Collect your data!
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
