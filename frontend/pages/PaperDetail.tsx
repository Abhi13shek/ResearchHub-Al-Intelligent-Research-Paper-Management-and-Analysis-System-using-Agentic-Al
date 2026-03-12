import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Users, Calendar, ExternalLink, Sparkles } from 'lucide-react'
import { papersAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function PaperDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paper, setPaper] = useState<any>(null)
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPaper()
    }
  }, [id])

  const fetchPaper = async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const response = await papersAPI.getById(id)
      setPaper(response.data)
    } catch (error) {
      toast.error('Failed to load paper')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = async () => {
    if (!id) return

    setIsGeneratingSummary(true)
    try {
      const response = await aiAPI.chat({
        context: paper?.abstract || '',
        question: `Provide a concise summary of this research paper: ${paper?.title}`
      })
      setSummary(response.data.answer)
      toast.success('Summary generated!')
    } catch (error) {
      toast.error('Failed to generate summary')
      console.error(error)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Paper not found</h2>
          <button onClick={() => navigate(-1)} className="text-violet-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-violet-600 hover:text-violet-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Paper Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{paper.title}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            {paper.authors && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{paper.authors}</span>
              </div>
            )}
            {paper.publication_date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{paper.publication_date}</span>
              </div>
            )}
            {paper.venue && (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <span>{paper.venue}</span>
              </div>
            )}
          </div>

          {/* Abstract */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Abstract</h2>
            <p className="text-gray-700 leading-relaxed">
              {paper.abstract || 'No abstract available'}
            </p>
          </div>

          {/* Links */}
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Paper
            </a>
          )}
        </div>

        {/* AI Summary Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-violet-600" />
              AI-Generated Summary
            </h2>
            <button
              onClick={generateSummary}
              disabled={isGeneratingSummary}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold disabled:opacity-50"
            >
              {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>

          {summary ? (
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <p className="text-gray-800 leading-relaxed">{summary}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Click "Generate Summary" to create an AI-powered summary of this paper
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
