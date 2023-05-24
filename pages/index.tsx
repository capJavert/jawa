/* eslint-disable react/jsx-key */
import { zodResolver } from '@hookform/resolvers/zod'
import Portal from '@mui/base/Portal'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
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
import IconButton from '@mui/joy/IconButton'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Sheet from '@mui/joy/Sheet'
import TextField from '@mui/joy/TextField'
import Typography from '@mui/joy/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
// @ts-ignore
import * as sha1 from 'js-sha1'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import randomColor from 'randomcolor'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useController, useFieldArray, useForm } from 'react-hook-form'

import Browser from '../components/Browser'
import DownloadModal from '../components/DownloadModal'
import Layout from '../components/Layout'
import { SelectedCSSSelectors } from '../components/SelectedCSSSelectors'
import { useExtensionPort } from '../hooks/useExtensionPort'
import { useQueryURL } from '../hooks/useQueryURL'
import { schema, selectorItemSchema, urlSchema } from '../lib/zod'
import {
    EScraperMessageType,
    isNeitherNullNorUndefined,
    TScraperConfig,
    TScraperConfigFromExtension,
    TScraperMessage,
    TScraperSelector,
    TScraperSelectorFromExtension
} from '../types'

const getPortalContainer = (() => () => {
    let container

    if (!container) {
        container = document.getElementById('header-top-bar')
    }

    return container
})()

const Home: NextPage = () => {
    const { control, handleSubmit, formState } = useForm<TScraperConfig>({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    })
    const selectorsField = useFieldArray({
        control,
        name: 'items'
    })
    const extensionPort = useExtensionPort()
    const isExtensionInstalled = !!extensionPort
    const isExtensionInstallPending = typeof extensionPort === undefined

    useEffect(() => {
        async function sendOver() {
            window.postMessage({
                type: EScraperMessageType.update,
                payload: selectorsField.fields
            })
        }
        sendOver()
    }, [selectorsField.fields, extensionPort])

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

    const onMessage = useCallback((event: MessageEvent<TScraperMessage>) => {
        // TODO add valid origins check
        const { type, payload } = event.data

        if (!type || typeof payload !== 'object' || Array.isArray(payload)) {
            return
        }

        switch (type) {
            case EScraperMessageType.scrape: {
                const {
                    payload: { url, commonSelector, uniqueSelector, nodeType }
                } = event.data as TScraperMessage<TScraperSelectorFromExtension>

                if (!commonSelector || !uniqueSelector || !nodeType) {
                    return
                }
                if (!selectorItemSchema.safeParse({ url, commonSelector, uniqueSelector, nodeType }).success) {
                    return
                }
                const fieldInstance = selectorsFieldRef.current
                const currentFieldIndex = fieldInstance.fields.findIndex(item => item.commonSelector === commonSelector)
                const currentUniqueFieldIndex = fieldInstance.fields.findIndex(
                    item => item.uniqueSelector === uniqueSelector && item.blacklisted
                )

                const currentField = currentFieldIndex !== -1 ? fieldInstance.fields[currentFieldIndex] : null
                const currentUniqueField =
                    currentUniqueFieldIndex !== -1 ? fieldInstance.fields[currentUniqueFieldIndex] : null

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
                    fieldInstance.append({
                        url,
                        uniqueSelector,
                        nodeType,
                        commonSelector,
                        color: randomColor({
                            format: 'hex'
                        }),
                        blacklisted: true
                    })
                    return
                }

                fieldInstance.append({
                    url,
                    commonSelector,
                    uniqueSelector,
                    nodeType,
                    color: randomColor({
                        format: 'hex'
                    }),
                    blacklisted: false
                })

                break
            }
            default:
                break
        }
    }, [])

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

    const onSubmit = handleSubmit(values => {
        setActiveUrl(current => {
            setIframeLoading(current !== values.url)

            return values.url
        })
    })

    const { fields } = selectorsField
    const onIframeLoad = useCallback(() => {
        setIframeLoading(false)
    }, [setIframeLoading])
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

    return (
        <>
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
                            color="info"
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
                        }
                    }}
                >
                    {/* TODO: use a memo for blacklisted elements */}
                    {fields.length > 0 ? (
                        <Layout.Container
                            marginLeft={1}
                            sx={{
                                flex: 1
                            }}
                        >
                            <Typography px={3} py={2}>
                                Selected elements
                            </Typography>
                            {fields
                                .filter(el => !el.blacklisted)
                                .map(field => {
                                    const index = fields.findIndex(item => item.id === field.id)
                                    if (index === -1) {
                                        return null
                                    }
                                    return (
                                        <SelectedCSSSelectors
                                            field={field}
                                            index={index}
                                            control={control}
                                            selectorsField={selectorsField}
                                        />
                                    )
                                })}
                            {fields.filter(el => el.blacklisted).length > 0 && (
                                <Typography px={3}> BlackListed elements </Typography>
                            )}
                            {fields
                                .filter(el => el.blacklisted)
                                .map(field => {
                                    const index = fields.findIndex(item => item.id === field.id)
                                    if (index === -1) {
                                        return null
                                    }
                                    return (
                                        <SelectedCSSSelectors
                                            field={field}
                                            index={index}
                                            control={control}
                                            selectorsField={selectorsField}
                                        />
                                    )
                                })}
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
