import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Project {
  address: string
  freelancer: string
  totalAmount: string
  isFunded: boolean
}

interface DashboardProps {
  walletAddress: string | null
}

const FACTORY_ADDRESS = 'STELLAR_FACTORY_ADDRESS_HERE' // Replace with deployed address

export default function Dashboard({ walletAddress }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (walletAddress) {
      loadProjects()
    }
  }, [walletAddress])

  const loadProjects = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual Stellar SDK calls to fetch projects
      // For now, using placeholder data
      setProjects([])
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!walletAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-4">Connect Your Wallet</h2>
          <p className="text-text2">Please connect your Freighter wallet to view your projects.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-text">Your Projects</h1>
        <Link to="/create" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Project
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-text2">Loading projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-text2 mb-4">No projects found</div>
          <Link to="/create" className="text-success hover:underline">
            Create your first project
            <ArrowRight className="inline ml-1 w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div key={project.address} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">
                    Project with {project.freelancer.slice(0, 6)}...{project.freelancer.slice(-4)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-text2">
                    <span>Total: {project.totalAmount}</span>
                    <span className="flex items-center gap-1">
                      {project.isFunded ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-warning" />
                      )}
                      {project.isFunded ? 'Funded' : 'Unfunded'}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/project/${project.address}`}
                  className="btn btn-secondary text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
