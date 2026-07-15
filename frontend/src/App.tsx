import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'
import ArbiterView from './pages/ArbiterView'
import { setAuthenticated, logout } from './utils/auth'
import { isConnected, requestAccess } from '@stellar/freighter-api'

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10
    const retryInterval = 200

    const checkFreighter = async () => {
      try {
        console.log(`Checking for Freighter (attempt ${retryCount + 1}/${maxRetries})...`)
        const connectionResult = await isConnected()
        console.log('Freighter connection result:', connectionResult)
        
        if (connectionResult.isConnected) {
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
      
      let connectionResult
      try {
        connectionResult = await isConnected()
        console.log('Freighter API connection result:', connectionResult)
      } catch (apiError) {
        console.log('Freighter API failed, trying window.freighter:', apiError)
        connectionResult = { isConnected: !!window.freighter }
      }
      
      if (!connectionResult.isConnected) {
        console.error('Freighter not connected')
        setDebugInfo('Freighter not detected. Please install the Freighter extension.')
        alert('Freighter wallet extension not detected. Please install it from the Chrome Web Store or Firefox Add-ons.')
        return
      }
      
      setIsAuthenticating(true)
      console.log('Requesting access...')
      setDebugInfo('Requesting wallet access...')
      
      let address
      try {
        const accessResult = await requestAccess()
        console.log('Access result:', accessResult)
        
        if (accessResult.error) {
          throw new Error(accessResult.error.message)
        }
        
        if (!accessResult.address) {
          throw new Error('No address returned from Freighter')
        }
        
        address = accessResult.address
      } catch (apiError) {
        console.log('Freighter API requestAccess failed, trying window.freighter:', apiError)
        if (!window.freighter) {
          throw new Error('Freighter not available')
        }
        address = await window.freighter.getPublicKey()
        console.log('Got address from window.freighter:', address)
      }
      
      console.log('Got address:', address)
      setDebugInfo(`Connected: ${address}`)
      
      setWalletAddress(address)
      setAuthenticated(address)
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">Vaultwork</span>
              </div>
              <div className="flex items-center space-x-4">
                {walletAddress ? (
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isAuthenticating}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAuthenticating ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        {debugInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-700 dark:text-blue-300">
            <div className="max-w-7xl mx-auto flex items-center gap-2">
              <span className="font-semibold">Debug:</span>
              <span>{debugInfo}</span>
            </div>
          </div>
        )}
        
        <Routes>
          <Route path="/" element={<Landing walletAddress={walletAddress} />} />
          <Route path="/dashboard" element={<Dashboard walletAddress={walletAddress} />} />
          <Route path="/create" element={<CreateProject walletAddress={walletAddress} />} />
          <Route path="/project/:address" element={<ProjectDetail walletAddress={walletAddress} />} />
          <Route path="/arbiter" element={<ArbiterView walletAddress={walletAddress} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
