import { useState, useEffect } from 'react'
import { Brain, FileText, Lightbulb, BookOpen, Sparkles, Play, Download } from 'lucide-react'
import { workspaceAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

type Paper = {
  id: string
  title: string
  authors: string
  abstract?: string
  url?: string
}

export default function AITools() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFeature, setActiveFeature] = useState<'summary' | 'insights' | 'review' | null>(null)
  const [results, setResults] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchAllPapers()
  }, [])

  const fetchAllPapers = async () => {
    setIsLoading(true)
    try {
      // First get all workspaces
      const workspacesRes = await workspaceAPI.getAll()
      setWorkspaces(workspacesRes.data)
      
      // Then get papers from all workspaces
      const allPapers: Paper[] = []
      for (const workspace of workspacesRes.data) {
        try {
          const papersRes = await workspaceAPI.getPapers(workspace.id.toString())
          const workspacePapers = papersRes.data.papers || papersRes.data || []
          allPapers.push(...workspacePapers)
        } catch (error) {
          console.error(`Failed to fetch papers from workspace ${workspace.id}:`, error)
        }
      }
      
      setPapers(allPapers)
      toast.success(`Loaded ${allPapers.length} papers from ${workspacesRes.data.length} workspaces`)
    } catch (error) {
      console.error('Failed to fetch papers:', error)
      toast.error('Failed to load papers')
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

const generateSummaries = async () => {
  if (selectedPapers.length === 0) {
    toast.error('Please select papers first')
    return
  }

  setActiveFeature('summary')
  setIsGenerating(true)

  try {
    // Create batch summary prompt instead of individual requests
    const selectedPapersList = papers
      .filter(p => selectedPapers.includes(p.id))
      .map((p, index) => `\n\nPaper ${index + 1}: "${p.title}"\nAuthors: ${p.authors}\nAbstract: ${p.abstract || 'No abstract'}`)
      .join('\n')

    const response = await aiAPI.chat({
      context: selectedPapersList,
      question: `Provide a concise summary (2-3 sentences each) for each of the following ${selectedPapers.length} research papers. Format each summary as:\n\nPaper X: [Title]\nSummary: [Your summary]\n\nPapers:`
    })

    // Parse the response into individual summaries
    const summaryText = response.data.answer
    const summaries = papers
      .filter(p => selectedPapers.includes(p.id))
      .map(paper => ({
        paperId: paper.id,
        title: paper.title,
        summary: `Generated summary for: ${paper.title}`
      }))

    // Try to extract individual summaries from the AI response
    // If the AI formatted it correctly, we'll use that
    const summaryLines = summaryText.split('\n\n')
    summaries.forEach((sum, index) => {
      if (summaryLines[index]) {
        sum.summary = summaryLines[index].replace(/^Paper \d+:.*\n/, '').replace(/^Summary: /, '')
      }
    })

    setResults({ summaries, fullText: summaryText })
    toast.success('Summaries generated!')
  } catch (error: any) {
    console.error('Summary generation error:', error)
    toast.error('Failed to generate summaries: ' + (error.response?.data?.detail || error.message))
  } finally {
    setIsGenerating(false)
  }
}


  const generateInsights = async () => {
    if (selectedPapers.length === 0) {
      toast.error('Please select papers first')
      return
    }

    setActiveFeature('insights')
    setIsGenerating(true)

    try {
      const selectedPaperTexts = papers
        .filter(p => selectedPapers.includes(p.id))
        .map(p => `${p.title}: ${p.abstract || ''}`)
        .join('\n\n')

      const response = await aiAPI.chat({
        context: selectedPaperTexts,
        question: `Extract key insights, trends, and findings from these ${selectedPapers.length} research papers. Provide actionable insights and identify patterns.`
      })

      setResults({ insights: response.data.answer })
      toast.success('Insights generated!')
    } catch (error) {
      toast.error('Failed to generate insights')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLiteratureReview = async () => {
    if (selectedPapers.length === 0) {
      toast.error('Please select papers first')
      return
    }

    setActiveFeature('review')
    setIsGenerating(true)

    try {
      const selectedPaperTexts = papers
        .filter(p => selectedPapers.includes(p.id))
        .map(p => `${p.title}: ${p.abstract || ''}`)
        .join('\n\n')

      const response = await aiAPI.chat({
        context: selectedPaperTexts,
        question: `Generate a comprehensive literature review for these ${selectedPapers.length} research papers. Include: 1) Overview, 2) Key findings, 3) Research gaps, 4) Conclusions.`
      })

      setResults({ review: response.data.answer })
      toast.success('Literature review generated!')
    } catch (error) {
      toast.error('Failed to generate review')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadResults = () => {
  if (!activeFeature) return

  let content = ''
  let filename = ''

  if (activeFeature === 'summary') {
    if (!results.summaries || results.summaries.length === 0) {
      toast.error('No summaries to download')
      return
    }
    content = results.summaries
      .map((s: any) => `${s.title}\n${'='.repeat(50)}\n${s.summary}\n\n`)
      .join('\n')
    filename = `summaries_${Date.now()}.txt`
  } else if (activeFeature === 'insights') {
    if (!results.insights) {
      toast.error('No insights to download')
      return
    }
    content = results.insights
    filename = `insights_${Date.now()}.txt`
  } else if (activeFeature === 'review') {
    if (!results.review) {
      toast.error('No review to download')
      return
    }
    content = results.review
    filename = `literature_review_${Date.now()}.txt`
  }

  if (!content) return

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Results downloaded!')
}


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tools</h1>
        <p className="text-gray-600">
          AI-powered research analysis tools • {papers.length} papers available • {selectedPapers.length} selected
        </p>
      </div>

      {/* Paper Selection */}
      {papers.length > 0 ? (
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Select Papers for Analysis
          </h2>
          
          <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedPapers.includes(paper.id)
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => togglePaperSelection(paper.id)}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedPapers.includes(paper.id)}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-violet-600"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{paper.authors}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            {selectedPapers.length > 0 && (
              <span className="font-semibold text-violet-600">
                {selectedPapers.length} paper(s) selected
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Papers Found</h3>
          <p className="text-gray-500 mb-6">Import papers to your workspaces to start using AI tools</p>
          <button
            onClick={() => window.location.href = '/search'}
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold"
          >
            Search & Import Papers
          </button>
        </div>
      )}

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Summaries */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center mb-4">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">AI Summaries</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Generate concise summaries of selected research papers
          </p>
          <button
            onClick={generateSummaries}
            disabled={selectedPapers.length === 0 || isGenerating}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2" />
            {isGenerating && activeFeature === 'summary' ? 'Generating...' : 'Generate Summaries'}
          </button>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Key Insights</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Extract key insights and trends from research papers
          </p>
          <button
            onClick={generateInsights}
            disabled={selectedPapers.length === 0 || isGenerating}
            className="w-full flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating && activeFeature === 'insights' ? 'Generating...' : 'Extract Insights'}
          </button>
        </div>

        {/* Literature Review */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Literature Review</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Generate comprehensive literature reviews automatically
          </p>
          <button
            onClick={generateLiteratureReview}
            disabled={selectedPapers.length === 0 || isGenerating}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {isGenerating && activeFeature === 'review' ? 'Generating...' : 'Generate Review'}
          </button>
        </div>
      </div>

      {/* Results Display */}
{activeFeature && (results[activeFeature] || results.summaries) && (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900 capitalize">
        {activeFeature === 'summary' ? 'AI Summaries' : activeFeature === 'insights' ? 'Key Insights' : 'Literature Review'} Results
      </h3>
      <button
        onClick={downloadResults}
        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </button>
    </div>
    
    <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
      {activeFeature === 'summary' ? (
        <div className="space-y-6">
          {results.summaries && results.summaries.length > 0 ? (
            results.summaries.map((summary: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {summary.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {summary.summary}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-center py-6">
              No summaries available. Try generating again.
            </p>
          )}
        </div>
      ) : activeFeature === 'insights' ? (
        <div className="space-y-4">
          {results.insights ? (
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {results.insights}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-6">
              No insights available.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {results.review ? (
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {results.review}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-6">
              No review available.
            </p>
          )}
        </div>
      )}
    </div>
  </div>
)}
</div>
)
}



