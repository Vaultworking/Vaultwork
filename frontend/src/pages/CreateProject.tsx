import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Loader2 } from 'lucide-react'

const FACTORY_ADDRESS = 'STELLAR_FACTORY_ADDRESS_HERE' // Replace with deployed address
const USDC_ADDRESS = 'STELLAR_USDC_ADDRESS_HERE' // Replace with Stellar USDC address

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
    reviewWindowSeconds: '604800' // 7 days
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
      // TODO: Replace with actual Stellar SDK calls to create project
      // For now, this is a placeholder
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Connect Your Wallet</h1>
          <p className="text-text2">Please connect your Freighter wallet to create a project</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Create New Project</h1>
        <p className="text-text2">Set up a milestone-based escrow for your freelance project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-text mb-4">Project Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-text mb-2">Freelancer Address *</label>
            <input
              type="text"
              className="input"
              placeholder="G..."
              value={formData.freelancer}
              onChange={(e) => setFormData({ ...formData, freelancer: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Token Address (USDC on Stellar)</label>
            <input
              type="text"
              className="input"
              value={formData.token}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Arbiter Address *</label>
            <input
              type="text"
              className="input"
              placeholder="G..."
              value={formData.arbiter}
              onChange={(e) => setFormData({ ...formData, arbiter: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Review Window (seconds)</label>
            <input
              type="number"
              className="input"
              value={formData.reviewWindowSeconds}
              onChange={(e) => setFormData({ ...formData, reviewWindowSeconds: e.target.value })}
            />
            <p className="text-xs text-text2 mt-1">Default: 604800 (7 days)</p>
          </div>
        </div>

        {/* Milestones */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-text">Milestones</h2>
            <button
              type="button"
              onClick={addMilestone}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          {milestones.map((milestone, index) => (
            <div key={index} className="bg-surface2 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-text">Milestone {index + 1}</span>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-danger hover:text-danger/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Amount (USDC)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="100"
                  value={milestone.amount}
                  onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Description</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Design mockups"
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-text font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-success">{calculateTotal()} USDC</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isCreating}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Create Project'
          )}
        </button>
      </form>
    </div>
  )
}
