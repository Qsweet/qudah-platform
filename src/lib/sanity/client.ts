import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { apiVersion, dataset, projectId, useCdn } from './env'

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: 'published',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}

// Client for fetching fresh data (AI Logic)
export const sanityFetch = async <QueryResponse>({
    query,
    params = {},
    tags,
}: {
    query: string
    params?: any
    tags?: string[]
}) => {
    return client.fetch<QueryResponse>(query, params, {
        next: {
            revalidate: useCdn ? 3600 : 0, // Cache for 1 hour if CDN enabled, else 0
            tags,
        },
    })
}
