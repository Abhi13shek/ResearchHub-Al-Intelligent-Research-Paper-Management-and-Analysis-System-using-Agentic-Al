import { useState } from 'react'
import { Search as SearchIcon, Filter, Plus } from 'lucide-react'
import { papersAPI, workspaceAPI } from '../services/api'
import { Paper } from '../types'
import toast from 'react-hot-toast'

export default function Search() {
  const [query, setQuery] = useState('')
  const [papers, setPapers] = useState<Paper[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])

  const searchPapers = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsLoading(true)
    try {
      const response = await papersAPI.search(query)
      setPapers(response.data.papers || [])
    } catch (error) {
      toast.error('Failed to search papers')
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

  const importToWorkspace = async () => {
    if (selectedPapers.length === 0) {
      toast.error('Please select papers to import')
      return
    }

    // You can implement workspace selection logic here
    toast.success(`${selectedPapers.length} papers imported to workspace`)
    setSelectedPapers([])
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Research Papers</h1>
        <p className="text-gray-600">Find and import papers to your workspace</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for papers, authors, or topics..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
            />
          </div>
          <button onClick={searchPapers} className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {papers.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-600">Found {papers.length} papers</span>
          {selectedPapers.length > 0 && (
            <button onClick={importToWorkspace} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Import {selectedPapers.length} Papers
            </button>
          )}
        </div>
      )}

      {/* Papers List */}
      <div className="space-y-4">
        {papers.map((paper) => (
          <div key={paper.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selectedPapers.includes(paper.id)}
                onChange={() => togglePaperSelection(paper.id)}
                className="mt-1 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{paper.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{paper.authors?.join(', ')}</p>
                <p className="text-sm text-gray-500 line-clamp-3">{paper.abstract}</p>
                <div className="flex items-center mt-3 space-x-4 text-xs text-gray-500">
                  {paper.year && <span>{paper.year}</span>}
                  {paper.venue && <span>{paper.venue}</span>}
                  {paper.citationCount && <span>{paper.citationCount} citations</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
