import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Loader2 } from 'lucide-react'

const FACTORY_ADDRESS = '0x0000000000000000000000000000000000000000' // Replace with deployed address

const FACTORY_ABI = [
  {
    "inputs": [
      {"name": "freelancer", "type": "address"},
      {"name": "token", "type": "address"},
      {"name": "arbiter", "type": "address"},
      {"name": "milestoneAmounts", "type": "uint256[]"},
      {"name": "milestoneDescriptions", "type": "string[]"},
      {"name": "reviewWindowSeconds", "type": "uint256"}
    ],
    "name": "createProject",
    "outputs": [{"name": "escrowAddress", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const ERC20_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export default function CreateProject() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const { writeContract: createProject, isPending: isCreating } = useWriteContract()
  const { writeContract: approveToken, isPending: isApproving } = useWriteContract()

  const [formData, setFormData] = useState({
    freelancer: '',
    token: '0x7169D38820F8C5AdE8C61a789B022d207993A047', // USDC on Base Sepolia
    arbiter: '',
    reviewWindowSeconds: '604800' // 7 days
  })

  const [milestones, setMilestones] = useState([
    { amount: '', description: '' }
  ])

  const [error, setError] = useState('')

  const addMilestone = () => {
    setMilestones([...milestones, { amount: '', description: '' }])
  }

  const removeMilestone = (index) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index))
    }
  }

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones]
    updated[index][field] = value
    setMilestones(updated)
  }

  const calculateTotal = () => {
    return milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isConnected) {
      setError('Please connect your wallet')
      return
    }

    // Validation
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
      // First approve token spending
      await approveToken({
        address: formData.token,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [FACTORY_ADDRESS, totalAmount]
      })

      // Then create project
      createProject({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createProject',
        args: [
          formData.freelancer,
          formData.token,
          formData.arbiter,
          milestoneAmounts,
          milestoneDescriptions,
          Number(formData.reviewWindowSeconds)
        ]
      }, {
        onSuccess: (data) => {
          navigate(`/project/${data}`)
        },
        onError: (err) => {
          setError(err.message || 'Failed to create project')
        }
      })
    } catch (err) {
      setError(err.message || 'Transaction failed')
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Connect Your Wallet</h1>
          <p className="text-text2">Please connect your wallet to create a project</p>
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
              placeholder="0x..."
              value={formData.freelancer}
              onChange={(e) => setFormData({ ...formData, freelancer: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Token Address (USDC on Base Sepolia)</label>
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
              placeholder="0x..."
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
          disabled={isCreating || isApproving}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {(isCreating || isApproving) ? (
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
