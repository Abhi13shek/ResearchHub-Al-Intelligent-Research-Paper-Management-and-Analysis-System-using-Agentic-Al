import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { workspaceAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CreateWorkspace() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      await workspaceAPI.create({
        name,
        description,
        tags: tagsArray
      })
      toast.success('Workspace created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50">

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto glass rounded-3xl p-12 card-hover animate-fadeIn">
          <h2 className="text-3xl font-bold gradient-text text-center mb-8">Create a New Workspace</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="e.g., AI Literature Review"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Describe your workspace..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="AI, Deep Learning, NLP"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? <div className="spinner mx-auto"></div> : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
