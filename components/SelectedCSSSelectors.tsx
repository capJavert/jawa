import { CheckCircleOutline, ForwardSharp, Watch } from '@mui/icons-material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/PostAdd'
import { Button, Typography } from '@mui/joy'
import Checkbox from '@mui/joy/Checkbox'
import IconButton from '@mui/joy/IconButton'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Sheet from '@mui/joy/Sheet'
import TextField from '@mui/joy/TextField'
import { Control, Controller, FieldArrayWithId, UseFieldArrayReturn } from 'react-hook-form'

import { capitalize, determineActions } from '../lib/utils'
import { CSSPath, isInput, isLink, ScrapperActions, TScraperConfig } from '../types'

type Props = {
    field: FieldArrayWithId<TScraperConfig, 'items', 'id'>
    index: number
    control: Control<TScraperConfig, any>
    selectorsField: UseFieldArrayReturn<TScraperConfig, 'items', 'id'>
    watch: [CSSPath[]]
    gotoUrl: (url: string) => void
    onApply: (el: CSSPath) => void
}

export const SelectedCSSSelectors = ({ field, index, control, selectorsField, watch, gotoUrl, onApply }: Props) => {
    const watchItem = watch?.[0]?.[index]
    const blackListed = field?.blacklisted
    const node = field?.node
    const inputType = isInput(node) ? node?.inputType : null
    const nodeType = field?.node.nodeType
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
                    name={`items.${index}.selectors.uniqueSelector`}
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
                    render={({ field, fieldState }) => {
                        return (
                            <Select
                                sx={{
                                    width: 340
                                }}
                                size="sm"
                                name={`items.${index}.action`}
                                placeholder="Scrapper Action"
                                variant="outlined"
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
                                {determineActions(nodeType, inputType ?? null).map(action => (
                                    <Option value={action} key={action}>
                                        {action
                                            .split('_')
                                            .map(str => capitalize(str))
                                            .join(' ')}

                                        {action === ScrapperActions.SCRAPE_CONTENT && '(Default)'}
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
                                helperText={fieldState.error?.message}
                                size="sm"
                                name={`items.${index}.label`}
                                placeholder="Label"
                                variant="outlined"
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
                {watchItem.action &&
                    [ScrapperActions.INPUT_VALUE, ScrapperActions.INPUT_VALUE_AND_ENTER].includes(watchItem.action) && (
                        <Controller
                            name={`items.${index}.valueToInput`}
                            control={control}
                            render={({ field, fieldState }) => {
                                switch (nodeType) {
                                    case 'textarea':
                                    case 'input':
                                        if (inputType && ['checkbox', 'radio'].includes(inputType)) {
                                            return (
                                                <Sheet
                                                    sx={{
                                                        marginTop: '0.5rem',
                                                        paddingY: 1,
                                                        paddingX: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <Checkbox
                                                        sx={{
                                                            background: 'background.body',
                                                            paddingY: 1
                                                        }}
                                                        size="sm"
                                                        name={`items.${index}.valeToInput`}
                                                        placeholder="value to input"
                                                        variant="soft"
                                                        value={field.value?.toString() || ''}
                                                        onChange={field.onChange}
                                                        onBlur={field.onBlur}
                                                        label="Value to input"
                                                    />
                                                    <Button
                                                        sx={{
                                                            marginLeft: 10
                                                        }}
                                                        size="sm"
                                                        onClick={() => {
                                                            onApply(watchItem)
                                                        }}
                                                        variant="soft"
                                                        disabled={field.value === undefined}
                                                    >
                                                        Apply
                                                    </Button>
                                                </Sheet>
                                            )
                                        }
                                        return (
                                            <Sheet
                                                sx={{
                                                    marginTop: '0.5rem',
                                                    paddingY: 1,
                                                    paddingX: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <TextField
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    size="sm"
                                                    name={`items.${index}.valeToInput`}
                                                    placeholder="value to input"
                                                    variant="outlined"
                                                    value={field.value?.toString() || ''}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        onApply(watchItem)
                                                    }}
                                                    variant="soft"
                                                    disabled={!field.value}
                                                >
                                                    Apply
                                                </Button>
                                            </Sheet>
                                        )

                                    case 'select':
                                        return (
                                            <Sheet
                                                sx={{
                                                    marginTop: '0.5rem',
                                                    paddingY: 1,
                                                    paddingX: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                {node.selectOptions && (
                                                    <Select
                                                        size="sm"
                                                        name={`items.${index}.valeToInput`}
                                                        placeholder="value to input"
                                                        variant="soft"
                                                        value={
                                                            field.value?.toString() ||
                                                            watchItem.node.selectOptions.currentValue
                                                        }
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
                                                        {node.selectOptions.options?.map(option => (
                                                            <Option value={option.value} key={option.value}>
                                                                {option.label}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                )}
                                                <Button
                                                    sx={{
                                                        marginLeft: 10
                                                    }}
                                                    size="sm"
                                                    onClick={() => {
                                                        onApply(watchItem)
                                                    }}
                                                    variant="soft"
                                                    disabled={!field.value}
                                                >
                                                    Apply
                                                </Button>
                                            </Sheet>
                                        )
                                    default:
                                        return <h1> ?{nodeType}? </h1>
                                }
                            }}
                        />
                    )}

                {watchItem.action === ScrapperActions.GO_TO_URL && isLink(node) && (
                    <Button
                        variant="soft"
                        size="sm"
                        sx={{
                            marginTop: '0.5rem'
                        }}
                        onClick={() => {
                            const url = node?.link
                            if (url) {
                                gotoUrl(url)
                            }
                        }}
                    >
                        Go to URL and Scrape Content
                    </Button>
                )}
                {watchItem.action === ScrapperActions.CLICK_AND_CONTINUE && (
                    <Button
                        variant="soft"
                        size="sm"
                        sx={{
                            marginTop: '0.5rem'
                        }}
                        onClick={() => {
                            onApply(watchItem)
                        }}
                    >
                        Click and Continue
                    </Button>
                )}
            </div>
        </div>
    )
}
