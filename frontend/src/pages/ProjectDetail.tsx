import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Clock, Shield, Loader2, ArrowLeft, DollarSign, Users, Calendar, FileText, Send, AlertCircle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Milestone {
  amount: string
  description: string
  state: 'Pending' | 'Delivered' | 'Released' | 'Disputed' | 'Resolved'
  deliveryTimestamp: number
}

interface ProjectData {
  client: string
  freelancer: string
  token: string
  arbiter: string
  isFunded: boolean
  totalEscrowAmount: number
  reviewWindowSeconds: number
  createdAt: number
}

interface ProjectDetailProps {
  walletAddress: string | null
}

export default function ProjectDetail({ walletAddress }: ProjectDetailProps) {
  const { address } = useParams()
  const [loading, setLoading] = useState(false)
  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (address) {
      loadProjectData()
    }
  }, [address])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      setProjectData({
        client: 'G...',
        freelancer: 'G...',
        token: 'G...',
        arbiter: 'G...',
        isFunded: false,
        totalEscrowAmount: 0,
        reviewWindowSeconds: 604800,
        createdAt: Date.now()
      })
      setMilestones([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  const getMilestoneStateColor = (state: string) => {
    switch (state) {
      case 'Released':
      case 'Resolved':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      case 'Delivered':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'Disputed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
    }
  }

  const getMilestoneStateIcon = (state: string) => {
    switch (state) {
      case 'Released':
      case 'Resolved':
        return <CheckCircle className="w-5 h-5" />
      case 'Delivered':
        return <Clock className="w-5 h-5" />
      case 'Disputed':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getTimeRemaining = (deliveryTimestamp: number, reviewWindowSeconds: number) => {
    const now = Date.now()
    const deadline = deliveryTimestamp + reviewWindowSeconds * 1000
    const remaining = deadline - now
    if (remaining <= 0) return 'Expired'
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/25">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Connect Your Wallet</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto">
              Connect your Freighter wallet to view project details
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
              <Info className="w-4 h-4" />
              <span>Wallet connection required</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading project data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <Link to="/dashboard" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
              Return to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
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
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Project Details</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage milestones and payments for this escrow project</p>
            </div>
            <div className="flex items-center gap-2">
              {projectData.isFunded ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Funded
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg font-medium">
                  <Clock className="w-4 h-4" />
                  Unfunded
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Amount</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{projectData.totalEscrowAmount} USDC</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Milestones</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{milestones.length}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Review Window</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.floor(projectData.reviewWindowSeconds / 86400)}d</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {projectData.isFunded ? 'Active' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Participants</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Client</div>
              <div className="font-mono text-sm text-slate-900 dark:text-white font-medium">
                {projectData.client?.slice(0, 8)}...{projectData.client?.slice(-6)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Freelancer</div>
              <div className="font-mono text-sm text-slate-900 dark:text-white font-medium">
                {projectData.freelancer?.slice(0, 8)}...{projectData.freelancer?.slice(-6)}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Arbiter</div>
              <div className="font-mono text-sm text-slate-900 dark:text-white font-medium">
                {projectData.arbiter?.slice(0, 8)}...{projectData.arbiter?.slice(-6)}
              </div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Milestones</h2>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {milestones.filter(m => m.state === 'Released' || m.state === 'Resolved').length} of {milestones.length} completed
            </div>
          </div>
          
          {milestones.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No milestones yet</h3>
              <p className="text-slate-600 dark:text-slate-400">This project doesn't have any milestones configured.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Milestone {index + 1}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getMilestoneStateColor(milestone.state)}`}>
                          {getMilestoneStateIcon(milestone.state)}
                          {milestone.state}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3">{milestone.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {milestone.amount} USDC
                        </span>
                        {milestone.state === 'Delivered' && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getTimeRemaining(milestone.deliveryTimestamp, projectData.reviewWindowSeconds)} remaining
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Action buttons based on role and state */}
                      {milestone.state === 'Pending' && (
                        <button className="inline-flex items-center justify-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium">
                            <Send className="w-4 h-4 mr-2" />
                            Mark Delivered
                        </button>
                      )}
                      {milestone.state === 'Delivered' && (
                        <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
