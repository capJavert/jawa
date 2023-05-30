import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Switch, Textarea, TextField, Typography } from '@mui/joy'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { Collapsable } from './collapsible'

type Pagination = {
    enabled: boolean
    paginationStart: string
    paginationEnd: string
    paginationTemplate: string
}

const schema = z.object({
    enabled: z.boolean().default(false),
    paginationStart: z.string(),
    paginationEnd: z.string(),
    paginationTemplate: z.string().regex(/{{page}}/)
})

export const usePagination = () => {
    const { control, watch, formState } = useForm<Pagination>({
        resolver: zodResolver(schema),
        mode: 'onTouched'
    })

    const paginationFields = watch()

    const { enabled } = paginationFields

    const PaginationElement = (
        <Collapsable
            title="Pagination"
            defaultOpened={false}
            rightElement={
                <Controller
                    name="enabled"
                    control={control}
                    render={({ field }) => <Switch checked={field.value} size="sm" {...field} />}
                />
            }
        >
            {!enabled && <Typography sx={{ color: 'text.secondary' }}>Pagination is disabled</Typography>}
            {enabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller
                        name="paginationStart"
                        control={control}
                        render={({ field, formState }) => (
                            <TextField
                                type="number"
                                size="sm"
                                label="Start Page"
                                error={!!formState.errors.paginationStart}
                                helperText={formState.errors.paginationStart?.message}
                                placeholder="Pagination Start"
                                {...field}
                            />
                        )}
                    ></Controller>
                    <Controller
                        name="paginationEnd"
                        control={control}
                        render={({ field, formState }) => (
                            <TextField
                                type="number"
                                size="sm"
                                label="Last Page"
                                error={!!formState.errors.paginationEnd}
                                helperText={formState.errors.paginationEnd?.message}
                                placeholder="Pagination End"
                                {...field}
                            />
                        )}
                    ></Controller>
                    <Controller
                        name="paginationTemplate"
                        control={control}
                        render={({ field, formState }) => (
                            <TextField
                                size="sm"
                                label="Pagination Template"
                                error={!!formState.errors.paginationTemplate}
                                helperText={formState.errors.paginationTemplate?.message}
                                placeholder="Pagination Template"
                                {...field}
                            />
                        )}
                    ></Controller>
                </Box>
            )}
        </Collapsable>
    )
    return {
        PaginationElement,
        isValid: formState.isValid,
        paginationFields
    }
}
