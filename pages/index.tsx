import { zodResolver } from '@hookform/resolvers/zod'
import Portal from '@mui/base/Portal'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Sheet from '@mui/joy/Sheet'
import TextField from '@mui/joy/TextField'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Controller, useController, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { ScraperConfig, ScraperSelector } from '../types'

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
    const { control, handleSubmit } = useForm<ScraperConfig>({
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

    useEffect(() => {
        if (queryUrl && schema.safeParse({ url: queryUrl }).success) {
            setActiveUrl(queryUrl as string)
            urlController.field.onChange(queryUrl as string)

            const { url: _url, ...restQuery } = router.query

            router.replace({
                pathname: router.pathname,
                query: restQuery
            })
        }
    }, [queryUrl, router, urlController.field])

    useEffect(() => {
        const onMessage = (event: MessageEvent<ScraperSelector>) => {
            // TODO add valid origins check

            const { url, selector } = event.data

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
        }

        window.addEventListener('message', onMessage, false)

        return () => {
            window.removeEventListener('message', onMessage, false)
        }
    }, [])

    const onSubmit = handleSubmit(values => {
        setActiveUrl(values.url)
    })

    const { fields } = selectorsField

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
                            display: 'flex',
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
                    height: '100vh'
                }}
            >
                <Layout.Side>
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
                <Layout.Main>
                    <iframe
                        tabIndex={-1}
                        src={activeUrl}
                        id="vscraper"
                        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                        width="100%"
                        height="100%"
                        frameBorder={0}
                    ></iframe>
                </Layout.Main>
            </Layout.Container>
        </>
    )
}

export default Home
