import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/PostAdd'
import { Button, Typography } from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Sheet from '@mui/joy/Sheet'
import TextArea from '@mui/joy/Textarea'
import TextField from '@mui/joy/TextField'
import { Controller } from 'react-hook-form'

import { capitalize, determineActions } from '../extension/utils'
import { ScrapeActions } from '../types'

type Props = {
    // TODO: fix types
    field: any
    index: number
    control: any
    selectorsField: any
    watch: any
    gotoUrl: (url: string) => void
}

export const SelectedCSSSelectors = ({ field, index, control, selectorsField, watch, gotoUrl }: Props) => {
    const watchItem = watch?.[0]
    const blackListed = field?.blacklisted
    const nodeType = field?.nodeType
    if (blackListed) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    borderLeftWidth: 4,
                    borderLeftStyle: 'solid',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                    borderColor: field.color,
                    backgroundColor: `${field.color}20`,
                    padding: '0.5rem'
                }}
            >
                <Controller
                    name={`items.${index}.uniqueSelector`}
                    control={control}
                    render={({ field, fieldState }) => {
                        return <Typography> {field.value} </Typography>
                    }}
                />
                <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    title="Remove item"
                    onClick={() => {
                        selectorsField.remove(index)
                    }}
                >
                    <DeleteForeverIcon />
                </IconButton>
            </div>
        )
    }
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                borderLeftWidth: 4,
                borderLeftStyle: 'solid',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
                borderColor: field.color,
                backgroundColor: `${field.color}20`,
                padding: '0.5rem'
            }}
        >
            <div
                key={field.id}
                style={{
                    display: 'flex',
                    flexDirection: 'row'
                }}
            >
                <Controller
                    name={`items.${index}.action`}
                    control={control}
                    render={({ field }) => {
                        return (
                            <Select
                                sx={{
                                    width: 340
                                }}
                                size="sm"
                                name={`items.${index}.action`}
                                placeholder="Scrapper Action"
                                variant="soft"
                                defaultValue={field.value?.toString() || undefined}
                                onChange={(e, newValue) => {
                                    const eventWithNewValue = {
                                        target: {
                                            name: field.name,
                                            value: newValue
                                        }
                                    }
                                    field.onChange(eventWithNewValue)
                                }}
                                onBlur={field.onBlur}
                            >
                                {determineActions(nodeType).map(action => (
                                    <Option value={action} key={action}>
                                        {action
                                            .split('_')
                                            .map(str => capitalize(str))
                                            .join(' ')}

                                        {action === ScrapeActions.SCRAPE_CONTENT && '(Default)'}
                                    </Option>
                                ))}
                            </Select>
                        )
                    }}
                />

                <Controller
                    name={`items.${index}.label`}
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <TextField
                                sx={{
                                    marginLeft: '0.5rem',
                                    marginRight: '0.5rem',
                                    width: '100%'
                                }}
                                error={!!fieldState.error}
                                size="sm"
                                name={`items.${index}.label`}
                                placeholder="Label"
                                variant="soft"
                                value={field.value?.toString() || ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                            />
                        )
                    }}
                />

                <div
                    style={{
                        display: 'flex'
                    }}
                >
                    <>
                        <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            title="Edit item"
                            onClick={() => {
                                const element = document.querySelector<HTMLInputElement>(
                                    `input[name="items.${index}.label"]`
                                )

                                if (element) {
                                    element.focus()
                                }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton
                            size="sm"
                            variant="plain"
                            color="neutral"
                            title="Remove item"
                            onClick={() => {
                                selectorsField.remove(index)
                            }}
                        >
                            <DeleteForeverIcon />
                        </IconButton>
                    </>
                </div>
            </div>
            <div>
                {watchItem?.[index]?.action === ScrapeActions.INPUT_VALUE && (
                    <Controller
                        name={`items.${index}.valueToInput`}
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <TextArea
                                    error={!!fieldState.error}
                                    size="sm"
                                    name={`items.${index}.valeToInput`}
                                    placeholder="value to input"
                                    variant="soft"
                                    value={field.value?.toString() || ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                            )
                        }}
                    />
                )}

                {watchItem?.[index]?.action === ScrapeActions.GO_TO_URL && (
                    <Button
                        variant="soft"
                        size="sm"
                        sx={{
                            marginTop: '0.5rem'
                        }}
                        onClick={() => {
                            const url = field?.link
                            if (url) {
                                gotoUrl(url)
                            }
                        }}
                    >
                        Go to URL and Scrape Content
                    </Button>
                )}
            </div>
        </div>
    )
}
