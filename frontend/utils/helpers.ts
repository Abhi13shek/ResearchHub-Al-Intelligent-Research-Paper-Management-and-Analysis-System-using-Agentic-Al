export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatAuthors = (authors: string[]): string => {
  if (!authors || authors.length === 0) return 'Unknown'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return authors.join(' and ')
  return `${authors[0]} et al.`
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700'
    case 'reading':
      return 'bg-yellow-100 text-yellow-700'
    case 'to_read':
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export const getSourceBadgeColor = (source: string) => {
  switch (source?.toLowerCase()) {
    case 'arxiv':
      return 'bg-red-100 text-red-700'
    case 'semantic_scholar':
      return 'bg-blue-100 text-blue-700'
    case 'openalex':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-violet-100 text-violet-700'
  }
}
