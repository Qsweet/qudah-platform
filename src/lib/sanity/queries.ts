import { defineQuery } from 'next-sanity'

// The "Knowledge Query" for AI Context
export const ALL_CONTENT_QUERY = defineQuery(`
  *[_type in ["post", "lesson"]] {
    _id,
    title,
    "slug": slug.current,
    "body": pt::text(body) // Convert Portable Text to plain text
  }
`)

export const POSTS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)]|order(publishedAt desc){
  _id,
  title,
  slug,
  publishedAt,
  mainImage
}`)
