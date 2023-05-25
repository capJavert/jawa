import { Add } from '@mui/icons-material'
import { Button } from '@mui/joy'

import Layout from './Layout'

type Props = {
    activeUrl: string
}

export const CustomFields = ({ activeUrl }: Props) => {
    return (
        <Layout.Container
            sx={{
                marginTop: '1rem'
            }}
        >
            <div>
                <Button variant="soft" startDecorator={<Add />}>
                    Add a custom field
                </Button>
            </div>
        </Layout.Container>
    )
}
