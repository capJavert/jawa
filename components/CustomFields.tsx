import { zodResolver } from '@hookform/resolvers/zod'
import { Add, Delete } from '@mui/icons-material'
import { Box, Button, IconButton, Sheet, TextField } from '@mui/joy'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'
import z from 'zod'

import { CustomFieldsEnum } from '../types'
import Layout from './Layout'
import { Collapsable } from './Collpsable'

type Props = {
    activeUrl: string
}

type CustomField = {
    label: string
    value: string
    url: string
}

type CustomFields = {
    customFields: CustomField[]
}
const allowedCustomFields = Object.values(CustomFieldsEnum).join('|')
const regexValue = new RegExp('^{{(' + allowedCustomFields + ')}}$')
const regexRawValue = new RegExp('^"(.*?)"$')

const customFieldSchema = z.object({
    url: z.string(),
    label: z.string().min(1, {
        message: 'Required'
    }),
    value: z.string().refine(value => {
        if (regexRawValue.test(value)) {
            return true
        }
        return regexValue.test(value)
    }, 'value should be in format, "value" or "{{value}}"')
})

const schema = z.object({
    customFields: z.array(customFieldSchema)
})

export const CustomFields = ({ activeUrl }: Props) => {
    const { control } = useForm<CustomFields>({
        resolver: zodResolver(schema),
        mode: 'onTouched'
    })

    const customFields = useFieldArray({
        control: control,
        name: 'customFields'
    })

    const { fields, append, remove } = customFields

    const addCustomField = () => {
        if (!activeUrl) {
            toast.error('You need to load a page first', {
                duration: 1000,
                position: 'top-center'
            })
            return
        }
        append({
            label: '',
            value: '',
            url: activeUrl
        })
    }

    return (
        <Layout.Container
            sx={{
                marginTop: '.4rem'
            }}
        >
            <Collapsable
                title={`Custom Fields ${fields.length > 0 ? `(${fields.length})` : ''}  `}
                defaultOpened={false}
            >
                <div>
                    {fields.map((field, index) => {
                        return (
                            <Sheet
                                variant="plain"
                                sx={{
                                    paddingY: '.1rem',
                                    marginBottom: '.4rem',
                                    paddingLeft: '.5rem',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between'
                                }}
                                key={field.id}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row'
                                    }}
                                >
                                    <Controller
                                        control={control}
                                        name={`customFields.${index}.label`}
                                        render={({ field, fieldState }) => (
                                            <Box
                                                sx={{
                                                    marginTop: '.5rem'
                                                }}
                                            >
                                                <TextField
                                                    size="sm"
                                                    variant="outlined"
                                                    label="label"
                                                    placeholder="label"
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    {...field}
                                                />
                                            </Box>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name={`customFields.${index}.value`}
                                        render={({ field, fieldState }) => (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    marginTop: '.5rem',
                                                    marginLeft: '.5rem'
                                                }}
                                            >
                                                <TextField
                                                    size="sm"
                                                    label="value"
                                                    fullWidth
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    placeholder="value"
                                                    {...field}
                                                />
                                            </Box>
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <IconButton size="sm" variant="plain" color="danger" onClick={() => remove(index)}>
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </Sheet>
                        )
                    })}
                    <Box
                        sx={{
                            marginY: '.5rem'
                        }}
                    >
                        <Button variant="soft" startDecorator={<Add />} onClick={addCustomField}>
                            Add a custom field
                        </Button>
                    </Box>
                </div>
            </Collapsable>
        </Layout.Container>
    )
}
