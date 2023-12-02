import { DarkModeRounded as DarkModeRoundedIcon, LightModeRounded as LightModeRoundedIcon } from '@mui/icons-material'
import { IconButton } from '@mui/joy'
import { useColorScheme } from '@mui/joy/styles'
import { useEffect, useState } from 'react'

const ColorSchemeToggle = () => {
    const { mode, setMode } = useColorScheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <IconButton size="sm" variant="outlined" color="primary" />
    }

    return (
        <IconButton
            id="toggle-mode"
            size="sm"
            variant="outlined"
            color="primary"
            title={`Toggle ${mode === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => {
                if (mode === 'light') {
                    setMode('dark')
                } else {
                    setMode('light')
                }
            }}
        >
            {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
        </IconButton>
    )
}

export default ColorSchemeToggle
