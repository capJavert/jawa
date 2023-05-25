import z from 'zod'

import { ScrapeActions } from '../types'

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

const regex = new RegExp('^{{(.*?)}}$')

export const selectorItemSchema = z.object({
    url: urlSchema,
    commonSelector: z.string().min(1, { message: 'Required' }),
    uniqueSelector: z.string().min(1, { message: 'Required' }),
    nodeType: z.string().min(1, { message: 'Required' }),
    label: z.string().min(1, { message: 'Required' }).optional(),
    value: z.string().regex(regex).nullable().optional(),
    action: z.nativeEnum(ScrapeActions).nullable().optional(),
    valueToInput: z.string().nullable().optional()
})

export const schema = z.object({
    url: urlSchema,
    items: z.array(selectorItemSchema)
})
