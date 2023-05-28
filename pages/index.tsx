/* eslint-disable react/jsx-key */
import { zodResolver } from '@hookform/resolvers/zod'
import Portal from '@mui/base/Portal'
import HighlightAltIcon from '@mui/icons-material/HighlightAlt'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SendIcon from '@mui/icons-material/Send'
import TabIcon from '@mui/icons-material/Tab'
import WarningIcon from '@mui/icons-material/Warning'
import { type Theme, Divider } from '@mui/joy'
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
import { watchFile } from 'fs'
// @ts-ignore
import * as sha1 from 'js-sha1'
import type { NextPage } from 'next'
import randomColor from 'randomcolor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, FieldArrayWithId, useController, useFieldArray, useForm } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'

import Browser from '../components/Browser'
import { Collapsable } from '../components/Collpsable'
import { CustomFields } from '../components/CustomFields'
import DownloadModal from '../components/DownloadModal'
import Layout from '../components/Layout'
import { SelectedCSSSelectors } from '../components/SelectedCSSSelectors'
import { Message, Response } from '../eventMessages'
import { useExtensionPort } from '../hooks/useExtensionPort'
import { useQueryURL } from '../hooks/useQueryURL'
import { schema, selectorItemSchema, urlSchema } from '../lib/zod'
import { CSSPath, isInput, MessageEvents, ResponseEvents, ScrapperActions, TScraperConfig } from '../types'
const getPortalContainer = (() => () => {
    let container

    if (!container) {
        container = document.getElementById('header-top-bar')
    }

    return container
})()

const Home: NextPage = () => {
    const { control, handleSubmit, formState, watch } = useForm<TScraperConfig>({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    })
    const [url, setUrl] = useState('')
    const watchAllFields = watch(['items'])
    const selectorsField = useFieldArray({
        control,
        name: 'items'
    })
    const extensionPort = useExtensionPort()
    const isExtensionInstalled = !!extensionPort
    const isExtensionInstallPending = typeof extensionPort === undefined

    const sendOver = useCallback(() => {
        window.postMessage({
            type: MessageEvents.updateCSSPath,
            payload: [...selectorsField.fields]
        })
    }, [selectorsField.fields])

    useEffect(() => {
        if (isExtensionInstalled) {
            sendOver()
        }
    }, [isExtensionInstalled, sendOver])

    useEffect(() => {
        sendOver()
    }, [sendOver])

    const selectorsFieldRef = useRef(selectorsField)
    selectorsFieldRef.current = selectorsField
    const {
        activeUrl,
        isIframeLoading,
        downloadPending,
        router,
        setActiveUrl,
        setIframeLoading,
        setDownloadPending,
        queryEvent,
        urlController
    } = useQueryURL(control)

    useEffect(() => {
        if (activeUrl) {
            setUrl(activeUrl)
        }
    }, [activeUrl])

    const onMessage = useCallback(
        (event: MessageEvent<Response>) => {
            const { type } = event.data
            switch (type) {
                case ResponseEvents.pageLoaded:
                    const { payload } = event.data
                    setUrl(payload.url)
                    return sendOver()
                case ResponseEvents.initSuccess:
                    return sendOver()
                case ResponseEvents.addCSSPath: {
                    const { payload } = event.data
                    if (!type || typeof payload !== 'object' || Array.isArray(payload)) {
                        return
                    }
                    const { url, node, selectors } = payload
                    const { commonSelector, uniqueSelector, stylingSelector } = selectors

                    const { nodeType } = node

                    if (!commonSelector || !uniqueSelector || !nodeType) {
                        return
                    }
                    if (!selectorItemSchema.safeParse(payload).success) {
                        console.error('Invalid payload', payload)
                        return
                    }
                    const fieldInstance = selectorsFieldRef.current
                    const currentFieldIndex = fieldInstance.fields.findIndex(
                        item => item.selectors.commonSelector === commonSelector
                    )
                    const currentUniqueFieldIndex = fieldInstance.fields.findIndex(
                        item => item.selectors.uniqueSelector === uniqueSelector && item.blacklisted
                    )

                    const currentField = currentFieldIndex !== -1 ? fieldInstance.fields[currentFieldIndex] : null
                    const currentUniqueField =
                        currentUniqueFieldIndex !== -1 ? fieldInstance.fields[currentUniqueFieldIndex] : null
                    let blacklisted = false
                    if (currentField) {
                        if (currentUniqueField) {
                            fieldInstance.update(currentUniqueFieldIndex, {
                                ...currentUniqueField,
                                blacklisted: false
                            })
                            if (currentField.id === currentUniqueField.id) {
                                return
                            }
                            fieldInstance.remove(currentUniqueFieldIndex)
                            return
                        }
                        blacklisted = true
                    }

                    fieldInstance.append({
                        url,
                        selectors: {
                            commonSelector,
                            uniqueSelector,
                            stylingSelector
                        },
                        node,
                        color: randomColor({
                            format: 'hex'
                        }),
                        label: '',
                        value: null,
                        valueToInput: null,
                        action: ScrapperActions.SCRAPE_CONTENT,
                        blacklisted
                    })

                    break
                }
                default:
                    break
            }
        },
        [sendOver]
    )

    useEffect(() => {
        window.addEventListener('message', onMessage, false)

        return () => {
            window.removeEventListener('message', onMessage, false)
        }
    }, [onMessage])

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
    }, [isExtensionInstalled, queryEvent, router, setActiveUrl, setIframeLoading, urlController.field])

    const onApply = useCallback(
        (cssPath: CSSPath) => {
            const { selectors, node, valueToInput, action } = cssPath
            if (!formState.isValid) {
                toast.error('Please fill the form before applying actions')
                return
            }
            if (action === ScrapperActions.CLICK_AND_CONTINUE) {
                window.postMessage({
                    type: MessageEvents.applyActions,
                    payload: {
                        node: node,
                        kind: action,
                        uniqueSelector: selectors.uniqueSelector,
                        value: null
                    }
                })
                return
            }

            if (isInput(node)) {
                window.postMessage({
                    type: MessageEvents.applyActions,
                    payload: {
                        value: valueToInput ? String(valueToInput) : null,
                        uniqueSelector: selectors.uniqueSelector,
                        kind: action,
                        node
                    }
                })
            }
        },
        [formState.isValid]
    )

    const onSubmit = handleSubmit(values => {
        setActiveUrl(current => {
            setIframeLoading(current !== values.url)

            return values.url
        })
    })

    const { fields } = selectorsField

    const fieldsByURL = useMemo(() => {
        return fields.reduce((acc, item) => {
            if (!acc[item.url]) {
                acc[item.url] = [item]
                return acc
            }
            acc[item.url].push(item)
            return acc
        }, {} as Record<string, FieldArrayWithId<TScraperConfig, 'items', 'id'>[]>)
    }, [fields])
    const onIframeLoad = useCallback(() => {
        setIframeLoading(false)
    }, [setIframeLoading])
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

    const gotoUrl = useCallback(
        (url: string) => {
            if (!formState.isValid) {
                toast.error('Please fill the form before applying actions', {
                    duration: 3000,
                    position: 'top-center'
                })
                return
            }
            setActiveUrl(current => {
                setIframeLoading(current !== url)
                return url
            })
        },
        [formState.isValid, setActiveUrl, setIframeLoading]
    )
    return (
        <>
            <Toaster
                toastOptions={{
                    custom: {
                        duration: 3000
                    }
                }}
            />
            {!isMobile && (
                <DownloadModal
                    download={downloadPending}
                    onSubmit={handleSubmit(values => {
                        const aElement = document.createElement('a')
                        aElement.setAttribute('download', `vscraper-config-${downloadPending}.json`)
                        const href = URL.createObjectURL(
                            new Blob(
                                [
                                    JSON.stringify({
                                        items: values.items
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
                    })}
                    onClose={() => {
                        setDownloadPending(false)
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
                            endDecorator={<SendIcon />}
                            disabled={fields.length === 0 || !formState.isValid}
                            title="Run it"
                            onClick={handleSubmit(data => {
                                const sha1Instance = sha1.create()
                                sha1Instance.update(JSON.stringify(data))
                                const hash = sha1Instance.hex() as string
                                const shortHash = hash.substring(0, 10)

                                setDownloadPending(shortHash)
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
                                    <TextField
                                        error={!!fieldState.error}
                                        size="sm"
                                        autoFocus={process.env.NODE_ENV === 'production'}
                                        placeholder="Type a URL"
                                        startDecorator={<SearchRoundedIcon color="primary" />}
                                        value={url || field.value}
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
                    minHeight: {
                        xs: 'calc(100vh - 81px)',
                        md: 'calc(100vh - 65px)'
                    }
                }}
            >
                <Layout.Side
                    sx={{
                        display: {
                            height: 'calc(100vh - 100px)',
                            overflowY: 'auto',
                            xs: 'none',
                            md: 'flex'
                        }
                    }}
                >
                    <Layout.Container
                        marginLeft={1}
                        sx={{
                            flex: 1
                        }}
                    >
                        <CustomFields activeUrl={url} />
                        {Object.keys(fieldsByURL)?.length > 0 && (
                            <Collapsable defaultOpened title="Previously selected elements">
                                <Typography
                                    level="body1"
                                    sx={{
                                        marginX: 4,
                                        marginY: 2
                                    }}
                                >
                                    Previously selected elements
                                </Typography>

                                {Object.keys(fieldsByURL).map(el => {
                                    if (el === url) {
                                        return null
                                    }

                                    return (
                                        <Sheet
                                            variant="soft"
                                            color="neutral"
                                            sx={{
                                                paddingY: 1,
                                                marginBottom: 1,
                                                paddingX: 2
                                            }}
                                            key={el}
                                        >
                                            <Typography
                                                level="body2"
                                                sx={{
                                                    marginX: 4
                                                }}
                                                key={el}
                                            >
                                                {el} ({fieldsByURL[el]?.length} elements selected )
                                            </Typography>
                                        </Sheet>
                                    )
                                })}
                            </Collapsable>
                        )}
                        {/* TODO: use a memo for blacklisted elements */}
                        {fieldsByURL[url]?.length > 0 ? (
                            <>
                                <Collapsable title="Selected elements" defaultOpened>
                                    {fieldsByURL[url]
                                        .filter(el => !el.blacklisted)
                                        .map(field => {
                                            const index = fields.findIndex(item => item.id === field.id)
                                            if (index === -1) {
                                                return null
                                            }
                                            return (
                                                <SelectedCSSSelectors
                                                    onApply={onApply}
                                                    gotoUrl={gotoUrl}
                                                    key={field.id}
                                                    watch={watchAllFields}
                                                    field={field}
                                                    index={index}
                                                    control={control}
                                                    selectorsField={selectorsField}
                                                />
                                            )
                                        })}
                                </Collapsable>

                                {fieldsByURL[url]?.filter(el => el.blacklisted).length > 0 && (
                                    <Collapsable defaultOpened title="Blacklisted elements">
                                        {fieldsByURL[url]
                                            ?.filter(el => el.blacklisted)
                                            .map(field => {
                                                const index = fields.findIndex(item => item.id === field.id)
                                                if (index === -1) {
                                                    return null
                                                }
                                                return (
                                                    <SelectedCSSSelectors
                                                        onApply={onApply}
                                                        gotoUrl={gotoUrl}
                                                        key={field.id}
                                                        watch={watchAllFields}
                                                        field={field}
                                                        index={index}
                                                        control={control}
                                                        selectorsField={selectorsField}
                                                    />
                                                )
                                            })}
                                    </Collapsable>
                                )}
                            </>
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    p: 2,
                                    textAlign: 'center'
                                }}
                            >
                                {url && isExtensionInstalled && (
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
                            </Box>
                        )}
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
                    {url && !isExtensionInstallPending && !isMobile ? (
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
