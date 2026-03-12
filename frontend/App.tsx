import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Import all pages
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import SearchPapers from './pages/SearchPapers'
import WorkspaceDetail from './pages/WorkspaceDetail'
import AITools from './pages/AITools'
import DocSpace from './pages/DocSpace'
import Layout from './components/Layout'
import UploadPaper from './pages/UploadPaper'

function App() {
  const { token } = useAuthStore()

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/login" 
          element={!token ? <Login /> : <Navigate to="/home" replace />} 
        />
        
        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            token ? (
              <Layout>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/search" element={<SearchPapers />} />
                  <Route path="/workspace/:id" element={<WorkspaceDetail />} />
                  <Route path="/ai-tools" element={<AITools />} />
                  <Route path="/docspace" element={<DocSpace />} />
                  <Route path="/upload" element={<UploadPaper />} />
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  

                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  )
}

export default App



