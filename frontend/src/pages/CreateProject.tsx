import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Loader2, ArrowLeft, Info, DollarSign, Clock, Shield, CheckCircle } from 'lucide-react'

const FACTORY_ADDRESS = 'STELLAR_FACTORY_ADDRESS_HERE'
const USDC_ADDRESS = 'STELLAR_USDC_ADDRESS_HERE'

interface Milestone {
  amount: string
  description: string
}

interface FormData {
  freelancer: string
  token: string
  arbiter: string
  reviewWindowSeconds: string
}

interface CreateProjectProps {
  walletAddress: string | null
}

export default function CreateProject({ walletAddress }: CreateProjectProps) {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    freelancer: '',
    token: USDC_ADDRESS,
    arbiter: '',
    reviewWindowSeconds: '604800'
  })

  const [milestones, setMilestones] = useState<Milestone[]>([
    { amount: '', description: '' }
  ])

  const [error, setError] = useState('')

  const addMilestone = () => {
    setMilestones([...milestones, { amount: '', description: '' }])
  }

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index))
    }
  }

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones]
    updated[index][field] = value
    setMilestones(updated)
  }

  const calculateTotal = () => {
    return milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!walletAddress) {
      setError('Please connect your wallet first')
      return
    }

    if (!formData.freelancer || !formData.arbiter) {
      setError('Please fill in all required fields')
      return
    }

    const validMilestones = milestones.filter(m => m.amount && m.description)
    if (validMilestones.length === 0) {
      setError('Please add at least one milestone with amount and description')
      return
    }

    const milestoneAmounts = validMilestones.map(m => m.amount)
    const milestoneDescriptions = validMilestones.map(m => m.description)
    const totalAmount = calculateTotal()

    try {
      setIsCreating(true)
      console.log('Creating project with:', {
        client: walletAddress,
        freelancer: formData.freelancer,
        token: formData.token,
        arbiter: formData.arbiter,
        milestoneAmounts,
        milestoneDescriptions,
        reviewWindowSeconds: Number(formData.reviewWindowSeconds)
      })
      alert('Project creation functionality will be implemented with Stellar SDK')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
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
              Connect your Freighter wallet to create a new milestone escrow project
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Create New Project</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">Set up a milestone-based escrow for your freelance project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Project Details</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Freelancer Address *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="G..."
                  value={formData.freelancer}
                  onChange={(e) => setFormData({ ...formData, freelancer: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Enter the Stellar address of the freelancer</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Token Address (USDC on Stellar)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed"
                  value={formData.token}
                  disabled
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Currently only USDC on Stellar is supported</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Arbiter Address *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="G..."
                  value={formData.arbiter}
                  onChange={(e) => setFormData({ ...formData, arbiter: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Trusted third party who can resolve disputes</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Review Window (seconds)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={formData.reviewWindowSeconds}
                  onChange={(e) => setFormData({ ...formData, reviewWindowSeconds: e.target.value })}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Time client has to review each milestone (default: 604800 = 7 days)</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Milestones</h2>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 md:p-6 space-y-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Milestone {index + 1}</span>
                    </div>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="100"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Description</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="e.g., Design mockups"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Amount</span>
                </div>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{calculateTotal()} USDC</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How it works</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Funds will be locked in the smart contract upon creation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Freelancer can claim funds after each milestone is approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Arbiter can resolve disputes if needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Create Project
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
