import { ChevronRight } from '@mui/icons-material'
import { Box, Typography } from '@mui/joy'
import { useState } from 'react'

type Props = {
    title: string
    children: React.ReactNode
    defaultOpened: boolean
}

export const Collapsable = ({ title, children, defaultOpened }: Props) => {
    const [opened, setOpened] = useState(defaultOpened)
    const onToggle = () => {
        setOpened(open => !open)
    }
    return (
        <Box
            sx={{
                marginBottom: '5px'
            }}
        >
            <Box
                onClick={onToggle}
                sx={{
                    bgcolor: 'background.componentBg',
                    position: 'sticky',
                    zIndex: 1,
                    paddingY: '10px',
                    top: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignContent: 'center',
                    alignItems: 'center'
                }}
            >
                <ChevronRight
                    sx={{
                        color: 'text.primary',
                        marginRight: '10px',
                        transform: opened ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                    onClick={onToggle}
                />
                <Typography
                    sx={{
                        fontWeight: 'bold'
                    }}
                >
                    {' '}
                    {title}{' '}
                </Typography>
            </Box>

            {opened && <Box>{children}</Box>}
        </Box>
    )
}
