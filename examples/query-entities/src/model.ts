import { createQuery } from '../../../src'

export const query = createQuery({
    handler: (message: string) => new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve(message)
        }, 1000)
    }),
    initialData: '',
    name: 'query/message',
})

export const errorQuery = createQuery({
    handler: (message: string) => new Promise<string>((_, reject) => {
        setTimeout(() => {
            reject(new Error(message))
        }, 1000)
    }),
    name: 'query/error',
})