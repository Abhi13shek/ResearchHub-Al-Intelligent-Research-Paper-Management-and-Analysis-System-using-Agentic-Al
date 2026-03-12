import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Calendar, FileText, Trash2 } from 'lucide-react'
import { workspaceAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    setIsLoading(true)
    try {
      const response = await workspaceAPI.getAll()
      
      // Fetch paper count for each workspace
      const workspacesWithCounts = await Promise.all(
        response.data.map(async (ws: any) => {
          try {
            const papersRes = await workspaceAPI.getPapers(ws.id.toString())
            const papers = papersRes.data.papers || papersRes.data || []
            return { ...ws, paper_count: papers.length }
          } catch {
            return { ...ws, paper_count: 0 }
          }
        })
      )
      
      setWorkspaces(workspacesWithCounts)
    } catch (error: any) {
      console.error('Fetch error:', error)
      toast.error('Failed to load workspaces')
    } finally {
      setIsLoading(false)
    }
  }

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Please enter a workspace name')
      return
    }

    try {
      await workspaceAPI.create(newWorkspace)
      toast.success('Workspace created!')
      setShowCreateModal(false)
      setNewWorkspace({ name: '', description: '' })
      fetchWorkspaces()
    } catch (error) {
      toast.error('Failed to create workspace')
    }
  }

 const deleteWorkspace = async (id: string) => {
  const confirmDelete = window.confirm('Delete this workspace? This action cannot be undone.')
  if (!confirmDelete) return

  // Immediately remove from UI
  const workspaceId = parseInt(id)
  setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId))
  toast.success('Workspace deleted!')

  // Call API in background
  try {
    await workspaceAPI.delete(id.toString())
  } catch (error: any) {
    console.error('Delete API error:', error)
    // Refetch to ensure consistency
    fetchWorkspaces()
  }
}



  // Calculate total imported papers
  const totalPapers = workspaces.reduce((sum, ws) => sum + (ws.paper_count || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your research workspaces</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Workspaces</p>
              <h3 className="text-3xl font-bold text-gray-900">{workspaces.length}</h3>
            </div>
            <div className="p-3 bg-violet-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Papers Imported</p>
              <h3 className="text-3xl font-bold text-gray-900">{totalPapers}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Quick Actions</p>
              <button
                onClick={() => navigate('/search')}
                className="mt-2 text-violet-600 font-semibold hover:text-violet-700 flex items-center"
              >
                🔍 Search Papers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="mb-6 flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold shadow-md transition"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create New Workspace
      </button>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace: any) => (
          <div
            key={workspace.id}
            className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-violet-300 hover:shadow-lg transition relative"
          >
            {/* Delete Button - Top Right Corner */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteWorkspace(workspace.id)
              }}
              className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete workspace"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Workspace Content - Clickable */}
            <div
              onClick={() => navigate(`/workspace/${workspace.id}`)}
              className="cursor-pointer pr-8"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 flex-1 mr-2">{workspace.name}</h3>
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full whitespace-nowrap">
                  {workspace.paper_count || 0} papers
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {workspace.description || 'No description'}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Created {new Date(workspace.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Workspace</h3>
            <input
              type="text"
              value={newWorkspace.name}
              onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
              placeholder="Workspace name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              autoFocus
            />
            <textarea
              value={newWorkspace.description}
              onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
              placeholder="Description (optional)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={createWorkspace}
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




