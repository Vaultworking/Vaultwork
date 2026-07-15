import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Clock, Shield, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Milestone {
  amount: string
  description: string
  state: string
}

interface ProjectData {
  client: string
  freelancer: string
  token: string
  arbiter: string
  isFunded: boolean
  totalEscrowAmount: number
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
      // Placeholder data - replace with Stellar SDK calls
      setProjectData({
        client: 'G...',
        freelancer: 'G...',
        token: 'G...',
        arbiter: 'G...',
        isFunded: false,
        totalEscrowAmount: 0
      })
      setMilestones([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  if (!walletAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Connect Your Wallet</h1>
          <p className="text-text2">Please connect your Freighter wallet to view project details</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-text2" />
          <p className="text-text2">Loading project data...</p>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Project Not Found</h1>
          <p className="text-text2 mb-4">The project you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard" className="text-success hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/dashboard" className="text-text2 hover:text-text flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-text mb-2">Project Details</h1>
        <p className="text-text2">Manage milestones and payments for this escrow project</p>
      </div>

      {/* Project Info */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-text2 mb-1">Project Address</div>
            <div className="font-mono text-sm text-text">{address?.slice(0, 10)}...{address?.slice(-8)}</div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Status</div>
            <div className="flex items-center gap-2">
              {projectData.isFunded ? (
                <span className="badge badge-approved">Funded</span>
              ) : (
                <span className="badge badge-pending">Unfunded</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Total Amount</div>
            <div className="font-semibold text-text">{projectData.totalEscrowAmount} USDC</div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Client</div>
            <div className="font-mono text-sm text-text">{projectData.client?.slice(0, 6)}...{projectData.client?.slice(-4)}</div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Freelancer</div>
            <div className="font-mono text-sm text-text">{projectData.freelancer?.slice(0, 6)}...{projectData.freelancer?.slice(-4)}</div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Arbiter</div>
            <div className="font-mono text-sm text-text">{projectData.arbiter?.slice(0, 6)}...{projectData.arbiter?.slice(-4)}</div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="card">
        <h2 className="text-xl font-semibold text-text mb-4">Milestones</h2>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-text2">
            No milestones found
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-surface2 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-text">Milestone {index + 1}</h3>
                    <p className="text-sm text-text2">{milestone.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-text">{milestone.amount} USDC</div>
                    <div className="text-sm text-text2">{milestone.state}</div>
                  </div>
                </div>
                {/* Action buttons would go here based on role and state */}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger mt-6">
          {error}
        </div>
      )}
    </div>
  )
}
