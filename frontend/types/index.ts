export interface User {
  id: string
  email: string
  name: string
  institution?: string
  created_at: string
}

export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  publication_date: string
  url?: string
  venue?: string
  year?: number
  citationCount?: number
  doi?: string
  pdf_url?: string
  is_open_access?: boolean
  citation_count?: number
  created_at?: string
  updated_at?: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  user_id: string
  created_at: string
  updated_at: string
  papers?: Paper[]
}

export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
  workspace_id?: string
}

export interface SearchFilters {
  year_from?: number
  year_to?: number
  publication_type?: string
  venue?: string
  min_citations?: number
}
