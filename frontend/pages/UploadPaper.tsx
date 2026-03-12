import { useState } from 'react'
import { Upload, FileText, Check, Download, Sparkles, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { workspaceAPI, aiAPI } from '../services/api'

export default function UploadPaper() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setExtractedText('')
      setAiSummary('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    setExtractedText('')
    setAiSummary('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      const response = await fetch('http://127.0.0.1:8000/papers/extract-pdf', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to extract PDF')
      }

      const data = await response.json()
      setExtractedText(data.text || 'No text found in PDF.')
      toast.success(`PDF extracted! ${data.text.length} characters extracted.`)
    } catch (err: any) {
      console.error('PDF extraction error:', err)
      setExtractedText(`Error: ${err.message || 'Failed to extract PDF text'}`)
      toast.error('Failed to extract PDF: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const generateAISummary = async () => {
    if (!extractedText || extractedText.length < 50) {
      toast.error('Not enough text to summarize')
      return
    }

    setGeneratingSummary(true)
    try {
      const response = await aiAPI.chat({
        context: extractedText,
        question: `Provide a comprehensive summary of this research paper in 5-7 bullet points. Include: 1) Main topic, 2) Key findings, 3) Methodology, 4) Conclusions.`
      })

      setAiSummary(response.data.answer)
      toast.success('AI summary generated!')
    } catch (error) {
      toast.error('Failed to generate summary')
      console.error(error)
    } finally {
      setGeneratingSummary(false)
    }
  }

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll()
      setWorkspaces(response.data)
    } catch (error) {
      toast.error('Failed to load workspaces')
    }
  }

  const openSaveModal = async () => {
    await loadWorkspaces()
    setShowSaveModal(true)
  }

  const savePaperToWorkspace = async () => {
    if (!selectedWorkspace) {
      toast.error('Please select a workspace')
      return
    }

    try {
      const paperData = {
        paper_id: `uploaded_${Date.now()}`,
        title: file?.name.replace('.pdf', '') || 'Uploaded Paper',
        authors: 'Unknown',
        abstract: aiSummary || extractedText.substring(0, 500) + '...',
        url: ''
      }

      await workspaceAPI.addPaper(selectedWorkspace, paperData)
      toast.success('Paper saved to workspace!')
      setShowSaveModal(false)
    } catch (error) {
      toast.error('Failed to save paper')
      console.error(error)
    }
  }

  const downloadExtractedText = () => {
    if (!extractedText) {
      toast.error('No text to download')
      return
    }

    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${file?.name || 'extracted'}_text.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Text downloaded!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Research Paper</h1>
      <p className="text-gray-600 mb-8">Upload a PDF to extract text and generate AI insights</p>

      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload PDF</h3>
        <p className="text-gray-500 mb-6">Drop your PDF file here or click to browse</p>
        
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold inline-block"
        >
          Select PDF File
        </label>

        {file && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">{file.name}</span>
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
        )}
      </div>

      {file && !extractedText && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-6 w-full px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Extracting Text...' : 'Upload & Extract'}
        </button>
      )}

      {extractedText && (
        <>
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={generateAISummary}
              disabled={generatingSummary}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generatingSummary ? 'Generating...' : 'Generate AI Summary'}
            </button>
            
            <button
              onClick={openSaveModal}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Workspace
            </button>
            
            <button
              onClick={downloadExtractedText}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Text
            </button>
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                AI Summary
              </h3>
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </div>
            </div>
          )}

          {/* Extracted Text */}
          <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-4">Extracted Text:</h3>
            <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {extractedText}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Save to Workspace Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save to Workspace</h3>
            <p className="text-gray-600 mb-4">Select a workspace to save this paper</p>
            
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Select workspace...</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={savePaperToWorkspace}
                disabled={!selectedWorkspace}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


