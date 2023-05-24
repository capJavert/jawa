import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/joy/IconButton'
import Sheet from '@mui/joy/Sheet'
import TextField from '@mui/joy/TextField'
import { Controller } from 'react-hook-form'

type Props = {
    // TODO: fix types
    field: any
    index: number
    control: any
    selectorsField: any
}

export const SelectedCSSSelectors = ({ field, index, control, selectorsField }: Props) => {
    return (
        <div
            key={field.id}
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
            <Controller
                name={`items.${index}.uniqueSelector`}
                control={control}
                render={({ field, fieldState }) => {
                    return (
                        <TextField
                            error={!!fieldState.error}
                            size="sm"
                            name={`items.${index}.selector`}
                            placeholder="Selector"
                            endDecorator={
                                <>
                                    <IconButton
                                        variant="plain"
                                        color="neutral"
                                        title="Edit item"
                                        onClick={() => {
                                            const element = document.querySelector<HTMLInputElement>(
                                                `input[name="items.${index}.selector"]`
                                            )

                                            if (element) {
                                                element.focus()
                                            }
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        sx={{
                                            marginLeft: 2
                                        }}
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
                            }
                            variant="soft"
                            value={field.value?.toString() || undefined}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                        />
                    )
                }}
            />
        </div>
    )
}
