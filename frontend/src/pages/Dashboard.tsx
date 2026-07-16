import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Clock, CheckCircle, AlertTriangle, Search, Filter, TrendingUp, DollarSign, Users, Activity } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Project {
  address: string
  freelancer: string
  totalAmount: string
  isFunded: boolean
  status: 'pending' | 'active' | 'completed' | 'disputed'
  milestoneCount: number
  completedMilestones: number
  createdAt: string
}

interface DashboardProps {
  walletAddress: string | null
}

const FACTORY_ADDRESS = 'STELLAR_FACTORY_ADDRESS_HERE'

export default function Dashboard({ walletAddress }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'completed' | 'disputed'>('all')

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.freelancer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalEscrowed: projects.reduce((acc, p) => acc + parseFloat(p.totalAmount || '0'), 0)
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your Projects</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your milestone escrow contracts</p>
          </div>

          {/* Guest Mode Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Connect Your Wallet to Get Started</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
              Connect your Freighter wallet to view your projects, create new escrow contracts, and manage your milestone payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">What you can do with Vaultwork:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Create Projects</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Set up milestone-based escrow contracts for freelance work</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Track Progress</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monitor milestone completion and payment releases</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Gavel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Resolve Disputes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fair dispute resolution with trusted arbiters</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your Projects</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your milestone escrow contracts</p>
          </div>
          <Link to="/create" className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
            <Plus className="w-5 h-5 mr-2" />
            Create Project
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Projects</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeProjects}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedProjects}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Escrowed</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalEscrowed.toLocaleString()}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No matching projects' : 'No projects yet'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first milestone escrow project to get started'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Link to="/create" className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                  Create your first project
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map((project) => (
              <div key={project.address} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Project with {project.freelancer.slice(0, 6)}...{project.freelancer.slice(-4)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        project.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        project.status === 'disputed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Total: {project.totalAmount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {project.completedMilestones}/{project.milestoneCount} milestones
                      </span>
                      <span className="flex items-center gap-1">
                        {project.isFunded ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                        {project.isFunded ? 'Funded' : 'Unfunded'}
                      </span>
                      <span className="text-slate-400">• {project.createdAt}</span>
                    </div>
                  </div>
                  <Link
                    to={`/project/${project.address}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4" />
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
