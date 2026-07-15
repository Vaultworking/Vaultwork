import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'
import { setAuthenticated, logout } from './utils/auth'
import { isConnected, requestAccess } from '@stellar/freighter-api'

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isFreighterReady, setIsFreighterReady] = useState(false)

  // Check for Freighter availability with retry logic
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10
    const retryInterval = 200 // ms

    const checkFreighter = async () => {
      try {
        console.log(`Checking for Freighter (attempt ${retryCount + 1}/${maxRetries})...`)
        const connectionResult = await isConnected()
        console.log('Freighter connection result:', connectionResult)
        
        if (connectionResult.isConnected) {
          setIsFreighterReady(true)
          setDebugInfo('Freighter detected and ready')
          return true
        }
        
        if (retryCount < maxRetries - 1) {
          retryCount++
          setTimeout(checkFreighter, retryInterval)
        } else {
          setDebugInfo('Freighter not detected after retries')
          return false
        }
      } catch (error) {
        console.error('Error checking Freighter:', error)
        if (retryCount < maxRetries - 1) {
          retryCount++
          setTimeout(checkFreighter, retryInterval)
        } else {
          setDebugInfo('Error checking for Freighter')
          return false
        }
      }
    }

    checkFreighter()
  }, [])

  const connectWallet = async () => {
    try {
      console.log('Starting wallet connection...')
      setDebugInfo('Checking Freighter availability...')
      
      // Check if Freighter is available
      const connectionResult = await isConnected()
      console.log('Freighter connection result:', connectionResult)
      
      if (!connectionResult.isConnected) {
        console.error('Freighter not connected')
        setDebugInfo('Freighter not detected. Please install the Freighter extension.')
        alert('Freighter wallet extension not detected. Please install it from the Chrome Web Store or Firefox Add-ons.')
        return
      }
      
      setIsAuthenticating(true)
      console.log('Requesting access...')
      setDebugInfo('Requesting wallet access...')
      
      const accessResult = await requestAccess()
      console.log('Access result:', accessResult)
      
      if (accessResult.error) {
        throw new Error(accessResult.error.message)
      }
      
      if (!accessResult.address) {
        throw new Error('No address returned from Freighter')
      }
      
      console.log('Got address:', accessResult.address)
      setDebugInfo(`Connected: ${accessResult.address}`)
      
      setWalletAddress(accessResult.address)
      setAuthenticated(accessResult.address)
      console.log('Wallet connected successfully')
      setDebugInfo('Wallet connected successfully!')
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const disconnectWallet = () => {
    if (walletAddress) {
      logout(walletAddress)
    }
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
                    disabled={isAuthenticating}
                    className="px-4 py-2 bg-success text-white rounded hover:bg-success-hover disabled:opacity-50"
                  >
                    {isAuthenticating ? 'Authenticating...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 text-sm text-blue-300">
            <strong>Debug:</strong> {debugInfo}
          </div>
        )}
        
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
