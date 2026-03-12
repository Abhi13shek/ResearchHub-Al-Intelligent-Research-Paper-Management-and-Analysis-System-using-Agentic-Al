type Paper = {
  id: string
  title: string
  authors: string
  abstract?: string
  url?: string
  publication_date?: string
  venue?: string
  citation_count?: number
  source?: string
}
import { useState } from 'react'
import { Search as SearchIcon, Plus, Filter } from 'lucide-react'
import { papersAPI, workspaceAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function SearchPapers() {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('')

  const searchPapers = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsLoading(true)
    try {
      const response = await papersAPI.search(query, { source })
      setPapers(response.data.papers || [])
      toast.success(`Found ${response.data.papers?.length || 0} papers`)
    } catch (error) {
      toast.error('Failed to search papers')
      setPapers([])
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePaperSelection = (paperId: string) => {
    setSelectedPapers(prev =>
      prev.includes(paperId)
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    )
  }

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll()
      setWorkspaces(response.data)
    } catch (error) {
      toast.error('Failed to load workspaces')
    }
  }

  const openImportModal = async () => {
    if (selectedPapers.length === 0) {
      toast.error('Please select papers to import')
      return
    }
    await loadWorkspaces()
    setShowWorkspaceModal(true)
  }

  const importToWorkspace = async () => {
  if (!selectedWorkspaceId) {
    toast.error('Please select a workspace')
    return
  }

  try {
    let successCount = 0
    for (const paperId of selectedPapers) {
      const paper = papers.find(p => p.id === paperId)
      if (paper) {
        await workspaceAPI.addPaper(selectedWorkspaceId, {
          paper_id: paperId,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract || '',
          url: paper.url || ''
        })
        successCount++
      }
    }
    toast.success(`${successCount} paper(s) imported successfully!`)
    setSelectedPapers([])
    setShowWorkspaceModal(false)
  } catch (error: any) {
    console.error('Import error:', error)
    toast.error('Failed to import papers: ' + (error.response?.data?.detail || error.message))
  }
}

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Research Papers</h1>
        <p className="text-gray-600">Search across millions of research papers and import them to your workspace</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for papers, authors, topics, or keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
              onKeyDown={(e) => e.key === 'Enter' && searchPapers()}
            />
          </div>
          <button
            onClick={searchPapers}
            className="btn-primary px-8"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Source:</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="arxiv">arXiv</option>
            <option value="openalex">OpenAlex</option>
            <option value="semantic_scholar">Semantic Scholar</option>
          </select>
        </div>
      </div>

      {/* Results Header */}
      {papers.length > 0 && (
        <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
          <div>
            <span className="text-gray-900 font-semibold">Found {papers.length} papers</span>
            {selectedPapers.length > 0 && (
              <span className="ml-4 text-violet-600">
                {selectedPapers.length} selected
              </span>
            )}
          </div>
          {selectedPapers.length > 0 && (
            <button onClick={openImportModal} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Import to Workspace
            </button>
          )}
        </div>
      )}

      {/* Papers List */}
      <div className="space-y-4">
        {papers.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No papers found</h3>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        )}

        {papers.map((paper) => (
          <div
            key={paper.id}
            className={`bg-white p-6 rounded-lg border-2 transition-all ${
              selectedPapers.includes(paper.id)
                ? 'border-violet-300 bg-violet-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedPapers.includes(paper.id)}
                onChange={() => togglePaperSelection(paper.id)}
                className="mt-1 h-5 w-5 text-violet-600 focus:ring-violet-500 border-gray-300 rounded cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 flex-1">
                    {paper.title}
                  </h3>
                  {paper.source && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{paper.source}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {paper.authors || 'Unknown authors'}
                </p>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                  {paper.abstract || 'No abstract available'}
                </p>
                <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                  {paper.publication_date && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {paper.publication_date}
                    </span>
                  )}
                  {paper.venue && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {paper.venue}
                    </span>
                  )}
                  {(paper.citation_count !== undefined) && (
                    <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded">
                      {paper.citation_count} citations
                    </span>
                  )}
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:text-violet-700 underline"
                    >
                      View Paper
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import to Workspace Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Import to Workspace
            </h3>
            <p className="text-gray-600 mb-4">
              Select a workspace to import {selectedPapers.length} paper(s)
            </p>

            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Select a workspace...</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={importToWorkspace}
                className="flex-1 btn-primary"
                disabled={!selectedWorkspaceId}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

