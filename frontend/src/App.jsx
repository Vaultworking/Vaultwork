import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'

function App() {
  const [walletAddress, setWalletAddress] = useState(null)

  const connectWallet = async () => {
    try {
      // Check if Freighter is available
      if (!window.freighter) {
        alert('Please install Freighter wallet extension')
        return
      }
      
      const address = await window.freighter.getPublicKey()
      setWalletAddress(address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setWalletAddress(null)
  }

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
                {walletAddress ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                    <button
                      onClick={disconnectWallet}
                      className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-surface-hover"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-success text-white rounded hover:bg-success-hover"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Landing walletAddress={walletAddress} />} />
          <Route path="/dashboard" element={<Dashboard walletAddress={walletAddress} />} />
          <Route path="/create" element={<CreateProject walletAddress={walletAddress} />} />
          <Route path="/project/:address" element={<ProjectDetail walletAddress={walletAddress} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
