import Box, { BoxProps } from '@mui/joy/Box'

const Container = (props: BoxProps) => (
    <Box
        {...props}
        sx={[
            {
                bgcolor: 'background.appBody',
                display: 'flex',
                flexDirection: props.flexDirection || 'column'
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx])
        ]}
    />
)

const Header = (props: BoxProps) => (
    <Box
        component="header"
        className="Header"
        {...props}
        sx={[
            {
                p: 2,
                gap: 2,
                bgcolor: 'background.componentBg',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gridColumn: '1 / -1',
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                flex: 1,
                height: '64px'
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx])
        ]}
    />
)

const Side = (props: BoxProps) => (
    <Box
        className="Side"
        {...props}
        sx={[
            {
                bgcolor: 'background.componentBg',
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flex: 2
            },
            ...(Array.isArray(props.sx) ? props.sx : [props.sx])
        ]}
    />
)

const Main = (props: BoxProps) => (
    <Box
        component="main"
        className="Main"
        {...props}
        sx={[{ display: 'flex', flex: 3 }, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
)

const Layout = { Header, Main, Container, Side }

export default Layout
