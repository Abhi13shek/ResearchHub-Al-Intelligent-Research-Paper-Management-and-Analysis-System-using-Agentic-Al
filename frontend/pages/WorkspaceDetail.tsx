import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, MessageSquare, BookOpen, Trash2, Send, Sparkles } from 'lucide-react'
import { workspaceAPI, aiAPI } from '../services/api'
import toast from 'react-hot-toast'

type Paper = {
  id: string
  title: string
  authors: string
  abstract?: string
  url?: string
}

export default function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [papers, setPapers] = useState<Paper[]>([])
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'papers' | 'chat' | 'review'>('papers')

  useEffect(() => {
    if (id) {
      loadWorkspacePapers()
    }
  }, [id])

  const loadWorkspacePapers = async () => {
    if (!id) return

    setIsLoading(true)
    try {
      console.log('Loading papers for workspace:', id)
      const response = await workspaceAPI.getPapers(id)
      console.log('Papers response:', response.data)
      
      const loadedPapers = response.data.papers || response.data || []
      setPapers(loadedPapers)
      
      toast.success(`Loaded ${loadedPapers.length} papers`)
    } catch (error: any) {
      console.error('Failed to load papers:', error)
      toast.error('Failed to load workspace papers')
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

  const removePaper = async (paperId: string) => {
    if (!id || !confirm('Remove this paper?')) return

    try {
      await workspaceAPI.removePaperFromWorkspace(id, paperId)
      setPapers(papers.filter(p => p.id !== paperId))
      setSelectedPapers(selectedPapers.filter(sid => sid !== paperId))
      toast.success('Paper removed')
    } catch (error) {
      toast.error('Failed to remove paper')
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (selectedPapers.length === 0) {
      toast.error('Please select at least one paper')
      return
    }

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const question = chatInput
    setChatInput('')

    try {
      const selectedPaperTexts = papers
        .filter(p => selectedPapers.includes(p.id))
        .map(p => `${p.title}: ${p.abstract || ''}`)
        .join('\n\n')

      const response = await aiAPI.chat({
        context: selectedPaperTexts,
        question: question
      })

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.answer,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error('Chat failed: ' + (error.response?.data?.detail || error.message))
    }
  }

  const generateReview = async () => {
    if (selectedPapers.length === 0) {
      toast.error('Please select papers first')
      return
    }

    try {
      toast.loading('Generating review...')
      const response = await aiAPI.generateReview(selectedPapers)
      const review = response.data.literature_review
      
      // Download as file
      const blob = new Blob([review], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `review_${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success('Review generated!')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to generate review')
    }
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
        <button
          onClick={() => navigate('/dashboard')}
          className="text-violet-600 hover:text-violet-700 mb-4 font-semibold"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{workspaceName}</h1>
        <div className="flex items-center mt-4 space-x-4">
          <span className="text-sm text-gray-500 font-semibold">
            📄 {papers.length} papers
          </span>
          <span className="text-sm text-violet-600 font-semibold">
            ✓ {selectedPapers.length} selected
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('papers')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition ${
              activeTab === 'papers'
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Papers ({papers.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition ${
              activeTab === 'chat'
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition ${
              activeTab === 'review'
                ? 'border-violet-500 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Generate Review
          </button>
        </nav>
      </div>

      {/* Papers Tab */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          {papers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No Papers Yet</h3>
              <p className="text-gray-500 mb-6">Search and import papers to get started</p>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold"
              >
                Search Papers
              </button>
            </div>
          ) : (
            papers.map(paper => (
              <div
                key={paper.id}
                className={`bg-white p-6 rounded-lg border-2 transition ${
                  selectedPapers.includes(paper.id)
                    ? 'border-violet-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedPapers.includes(paper.id)}
                    onChange={() => togglePaperSelection(paper.id)}
                    className="mt-1 h-5 w-5 text-violet-600 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 font-medium">
                      {paper.authors}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                      {paper.abstract || 'No abstract available'}
                    </p>
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-violet-600 hover:underline font-semibold"
                      >
                        View Paper →
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => removePaper(paper.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-6 border-b bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-7 h-7 text-violet-600" />
              <div>
                <h3 className="font-bold text-lg">AI Research Assistant</h3>
                <p className="text-sm text-gray-600">
                  {selectedPapers.length > 0
                    ? `${selectedPapers.length} paper(s) selected - Ask anything!`
                    : 'Select papers from the Papers tab first'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold">Ready to chat!</p>
                <p className="text-sm">Select papers and ask questions about them</p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl px-5 py-3 rounded-2xl shadow ${
                      msg.type === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  selectedPapers.length > 0
                    ? 'Ask about the selected papers...'
                    : 'Select papers first...'
                }
                disabled={selectedPapers.length === 0}
                className="flex-1 px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-100"
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button
                onClick={sendChatMessage}
                disabled={selectedPapers.length === 0}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Tab */}
      {activeTab === 'review' && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-lg">
          <BookOpen className="w-20 h-20 text-violet-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-3">Generate Literature Review</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            AI will analyze {selectedPapers.length} selected paper(s) and generate a comprehensive review
          </p>
          <button
            onClick={generateReview}
            disabled={selectedPapers.length === 0}
            className="px-8 py-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedPapers.length > 0
              ? `Generate Review (${selectedPapers.length} papers)`
              : 'Select papers first'}
          </button>
        </div>
      )}
    </div>
  )
}

