import z from 'zod'

import { ScrapperActions } from '../types'

export const urlRegex =
    /^https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,63}\.[a-zA-Z0-9()]{1,63}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
export const httpRegex = /https?/
export const urlSchema = z.preprocess(value => {
    if (!value || typeof value !== 'string') {
        return ''
    }

    if (!httpRegex.test(value)) {
        return `https://${value}`
    }

    return value
}, z.string().regex(urlRegex, { message: 'Invalid URL' }).min(1, { message: 'Required' }))

export const selectorItemSchema = z.object({
    url: urlSchema,
    selectors: z.object({
        commonSelector: z.string().min(1, { message: 'Required' }),
        uniqueSelector: z.string().min(1, { message: 'Required' }),
        stylingSelector: z.string().optional()
    }),
    node: z.union([
        z.object({
            nodeType: z.literal('a'),
            link: z.string().optional()
        }),
        z.object({
            nodeType: z.enum(['input', 'textarea', 'select'] as const),
            inputValue: z.string().optional(),
            selectOptions: z
                .object({
                    options: z.array(
                        z.object({
                            value: z.string(),
                            label: z.string()
                        })
                    ),
                    currentValue: z.string()
                })
                .optional()
        }),
        z.object({
            nodeType: z.string()
        })
    ]),
    color: z.string().optional(),
    label: z.string().min(1, { message: 'label required' }).optional().nullable(),
    action: z.nativeEnum(ScrapperActions).nullable().optional(),
    valueToInput: z.union([z.boolean().nullable().optional(), z.string().nullable().optional()]),
    blacklist: z.boolean().optional()
})

export const schema = z.object({
    url: urlSchema,
    items: z.array(selectorItemSchema)
})
