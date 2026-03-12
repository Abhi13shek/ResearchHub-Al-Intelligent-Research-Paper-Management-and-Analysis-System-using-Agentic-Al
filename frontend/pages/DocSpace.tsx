import { useState, useEffect } from 'react'
import { Save, Download, FileText, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

type Document = {
  id: string
  title: string
  content: string
  createdAt: string
}

export default function DocSpace() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('Untitled Document')
  const [showNewDocModal, setShowNewDocModal] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')

  // Load documents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('docspace_documents')
    if (saved) {
      setDocuments(JSON.parse(saved))
    }
  }, [])

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('docspace_documents', JSON.stringify(documents))
    }
  }, [documents])

  const createNewDocument = () => {
    if (!newDocTitle.trim()) {
      toast.error('Please enter a document title')
      return
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      title: newDocTitle,
      content: '',
      createdAt: new Date().toISOString()
    }

    setDocuments([...documents, newDoc])
    setCurrentDoc(newDoc)
    setTitle(newDoc.title)
    setContent(newDoc.content)
    setNewDocTitle('')
    setShowNewDocModal(false)
    toast.success('New document created!')
  }

  const saveDocument = () => {
    if (!currentDoc) {
      toast.error('No document selected')
      return
    }

    const updated = documents.map(doc =>
      doc.id === currentDoc.id
        ? { ...doc, title, content }
        : doc
    )

    setDocuments(updated)
    setCurrentDoc({ ...currentDoc, title, content })
    toast.success('Document saved!')
  }

  const loadDocument = (doc: Document) => {
    setCurrentDoc(doc)
    setTitle(doc.title)
    setContent(doc.content)
  }

  const deleteDocument = (id: string) => {
    if (confirm('Delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id))
      if (currentDoc?.id === id) {
        setCurrentDoc(null)
        setContent('')
        setTitle('Untitled Document')
      }
      toast.success('Document deleted')
    }
  }

  const downloadDocument = () => {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Document List */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowNewDocModal(true)}
            className="w-full flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </button>
        </div>

        <div className="p-2">
          {documents.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No documents yet</p>
          )}
          {documents.map(doc => (
            <div
              key={doc.id}
              className={`group p-3 rounded-lg mb-2 cursor-pointer transition ${
                currentDoc?.id === doc.id
                  ? 'bg-violet-50 border-2 border-violet-300'
                  : 'hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div onClick={() => loadDocument(doc)} className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <FileText className="w-4 h-4 text-violet-600 mb-1" />
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDocument(doc.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none outline-none bg-transparent flex-1"
              placeholder="Document title..."
              disabled={!currentDoc}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={saveDocument}
                disabled={!currentDoc}
                className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={downloadDocument}
                disabled={!currentDoc}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="flex-1 overflow-auto p-6">
          {currentDoc ? (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm" style={{ minHeight: '600px' }}>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                style={{ height: '550px' }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ color: [] }, { background: [] }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No document selected</h3>
                <p className="text-gray-500">Create a new document or select an existing one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Document</h3>
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Enter document title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              onKeyDown={(e) => e.key === 'Enter' && createNewDocument()}
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={createNewDocument}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
