import { ChevronRight } from '@mui/icons-material'
import { Box, Typography } from '@mui/joy'
import { useState } from 'react'

type Props = {
    title: string
    children: React.ReactNode
    defaultOpened: boolean
    rightElement?: React.ReactNode
}

export const Collapsable = ({ title, children, defaultOpened, rightElement }: Props) => {
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
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.componentBg',
                    position: 'sticky',
                    zIndex: 1,
                    paddingY: '10px',
                    paddingRight: '10px',
                    top: 0
                }}
            >
                <Box
                    onClick={onToggle}
                    sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignContent: 'center',
                        alignItems: 'center',
                        width: '100%'
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
                        {title}
                    </Typography>
                </Box>
                {rightElement}
            </Box>
            {opened && <Box>{children}</Box>}
        </Box>
    )
}
