export type Paper = {
  id: string
  title: string
  authors: string
  abstract?: string
  url?: string
  publication_date?: string
  venue?: string
  citation_count?: number
  citationCount?: number  // compatibility with old property if needed
  source?: string         // THIS is the fix!
}
