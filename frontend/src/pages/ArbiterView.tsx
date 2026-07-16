import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Scale, Gavel, AlertTriangle, CheckCircle, Clock, ArrowLeft, Search, Users, DollarSign, Info, Lock } from 'lucide-react'

interface Dispute {
  address: string
  projectAddress: string
  milestoneIndex: number
  milestoneDescription: string
  amount: string
  client: string
  freelancer: string
  raisedAt: number
  status: 'pending' | 'resolved'
}

interface ArbiterViewProps {
  walletAddress: string | null
}

export default function ArbiterView({ walletAddress }: ArbiterViewProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all')

  useEffect(() => {
    if (walletAddress) {
      loadDisputes()
    }
  }, [walletAddress])

  const loadDisputes = async () => {
    setLoading(true)
    try {
      // Placeholder data - replace with Stellar SDK calls
      setDisputes([])
    } catch (error) {
      console.error('Failed to load disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.freelancer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.projectAddress.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || dispute.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalDisputes: disputes.length,
    pendingDisputes: disputes.filter(d => d.status === 'pending').length,
    resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
    totalAmount: disputes.reduce((acc, d) => acc + parseFloat(d.amount || '0'), 0)
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Arbiter Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Review and resolve milestone disputes fairly</p>
          </div>

          {/* Guest Mode Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Connect Wallet to Access Arbiter Dashboard</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              You need to connect your Freighter wallet to access the arbiter dashboard and resolve disputes on the Stellar network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                <Users className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">What arbiters can do:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Review Disputes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Examine disputed milestones and evidence from both parties</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Gavel className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Make Fair Decisions</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Determine fair fund distribution between client and freelancer</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Resolve Conflicts</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Help resolve conflicts impartially based on provided evidence</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Track Activity</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monitor dispute resolution history and statistics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Arbiter Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Review and resolve milestone disputes fairly</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Disputes</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalDisputes}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingDisputes}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.resolvedDisputes}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total in Dispute</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Arbiter Responsibilities</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Review disputed milestones impartially</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Determine fair fund distribution between client and freelancer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Make decisions based on evidence provided by both parties</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading disputes...</p>
            </div>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                <Scale className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No matching disputes' : 'No disputes yet'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'When disputes are raised, they will appear here for your review'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDisputes.map((dispute) => (
              <div key={dispute.address} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Milestone #{dispute.milestoneIndex + 1} Dispute
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dispute.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      }`}>
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">{dispute.milestoneDescription}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Amount: {dispute.amount} USDC
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Client: {dispute.client.slice(0, 6)}...{dispute.client.slice(-4)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Freelancer: {dispute.freelancer.slice(0, 6)}...{dispute.freelancer.slice(-4)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(dispute.raisedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/project/${dispute.projectAddress}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                  >
                    {dispute.status === 'pending' ? 'Resolve Dispute' : 'View Details'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
