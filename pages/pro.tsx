import { zodResolver } from '@hookform/resolvers/zod'
import { Portal } from '@mui/base'
import { SearchRounded as SearchRoundedIcon, Send as SendIcon, Tab as TabIcon } from '@mui/icons-material'
import { Box, Button, FormControl, Input, List, ListItem, ListItemDecorator, Typography } from '@mui/joy'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import Layout from '../components/Layout'
import { TScraperConfig } from '../types'
import { getPortalContainer, schema } from '../utils'

const Home: NextPage = () => {
    const router = useRouter()
    const { control, handleSubmit } = useForm<TScraperConfig>({
        resolver: zodResolver(schema),
        mode: 'onSubmit'
    })
    useFieldArray({
        control,
        name: 'items'
    })

    const onSubmit = handleSubmit(values => {
        router.push({
            pathname: '/',
            query: {
                url: values.url
            }
        })
    })

    return (
        <>
            <NextSeo
                title="Cloud Scraping"
                titleTemplate="Jawa Pro | %s"
                description="Jawa Pro is a subscription-based service that allows you to get more usage out of our tool. You will be able to scrape even more pages and get more data from each page."
            />
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
                            disabled
                            title="Run it"
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
                        }
                    }}
                ></Layout.Side>
                <Layout.Main
                    sx={{
                        position: 'relative'
                    }}
                >
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
                            Jawa Pro
                        </Typography>

                        <Typography
                            level="body1"
                            sx={{
                                marginBottom: 5,
                                maxWidth: '700px'
                            }}
                        >
                            <Typography color="info">Jawa Pro</Typography> is a subscription-based service that allows
                            you to get more usage out of our tool. You will be able to scrape even more pages and get
                            more data from each page.
                        </Typography>

                        <Typography
                            level="h3"
                            textAlign="center"
                            sx={{
                                marginBottom: 2
                            }}
                        >
                            What is included:
                        </Typography>
                        <List
                            component="ol"
                            size="sm"
                            sx={{
                                listStyleType: 'decimal',
                                flex: 0,
                                marginBottom: 2
                            }}
                        >
                            <ListItem>
                                <ListItemDecorator>❤️</ListItemDecorator> Support development of this product and
                                it&apos;s features, thank you!
                            </ListItem>
                            <ListItem>
                                <ListItemDecorator>😎</ListItemDecorator> Cloud scraping execution duration is increased
                                to 2 minutes (vs 10 seconds in free tier)
                            </ListItem>
                            <ListItem>
                                <ListItemDecorator>🚀</ListItemDecorator> Increased rate limit (vs free tier)
                            </ListItem>

                            <ListItem>
                                <ListItemDecorator>🤙</ListItemDecorator> 1 hour no commitment meet with us to discuss
                                your scraping needs
                            </ListItem>
                        </List>

                        <Button
                            sx={{
                                marginBottom: 5
                            }}
                            component="a"
                            href={process.env.NEXT_PUBLIC_SPONSOR_HREF as string}
                            target="_blank"
                        >
                            Subscribe to Jawa Pro
                        </Button>

                        <Typography
                            level="body2"
                            component="em"
                            sx={{
                                maxWidth: '700px',
                                marginBottom: 2
                            }}
                        >
                            Jawa Pro subscription is per user and is not transferable. So please do not share your key
                            with other people. If we detect unfair usage or sharing of your key we reserve the right to
                            cancel your subscription at any time. If you have any questions about usage or in doubt we
                            are happy to help.
                        </Typography>

                        <Typography level="body1" component="em">
                            ~ Utinni!
                        </Typography>
                    </Box>
                </Layout.Main>
            </Layout.Container>
        </>
    )
}

export default Home
