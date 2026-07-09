import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-text">Vaultwork</span>
              </div>
              <div className="flex items-center space-x-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/project/:address" element={<ProjectDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
