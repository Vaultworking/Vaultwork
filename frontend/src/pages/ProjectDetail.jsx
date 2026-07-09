import { useParams } from 'react-router-dom'
import { useAccount, useReadContract, useReadContracts, useWriteContract } from 'wagmi'
import { useState } from 'react'
import { CheckCircle, AlertTriangle, Clock, Shield, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const ESCROW_ABI = [
  {
    "inputs": [],
    "name": "client",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freelancer",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "arbiter",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFunded",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalEscrowAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reviewWindowSeconds",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "milestoneCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "index", "type": "uint256"}],
    "name": "getMilestone",
    "outputs": [
      {"name": "amount", "type": "uint256"},
      {"name": "description", "type": "string"},
      {"name": "state", "type": "uint8"},
      {"name": "deliveryTimestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "milestoneIndex", "type": "uint256"}],
    "name": "markDelivered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "milestoneIndex", "type": "uint256"}],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "milestoneIndex", "type": "uint256"}],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "milestoneIndex", "type": "uint256"}, {"name": "clientBps", "type": "uint256"}],
    "name": "resolveDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "milestoneIndex", "type": "uint256"}],
    "name": "claimAfterTimeout",
    "outputs": [],
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
  }
]

const STATE_LABELS = {
  0: 'Pending',
  1: 'Delivered',
  2: 'Approved',
  3: 'Disputed',
  4: 'Resolved',
  5: 'Released'
}

const STATE_BADGES = {
  0: 'badge-pending',
  1: 'badge-delivered',
  2: 'badge-approved',
  3: 'badge-disputed',
  4: 'badge-resolved',
  5: 'badge-released'
}

export default function ProjectDetail() {
  const { address } = useParams()
  const { address: userAddress, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  const [error, setError] = useState('')
  const [disputeSplit, setDisputeSplit] = useState('5000') // 50% default

  const { data: contractData } = useReadContracts({
    contracts: [
      { address, abi: ESCROW_ABI, functionName: 'client' },
      { address, abi: ESCROW_ABI, functionName: 'freelancer' },
      { address, abi: ESCROW_ABI, functionName: 'token' },
      { address, abi: ESCROW_ABI, functionName: 'arbiter' },
      { address, abi: ESCROW_ABI, functionName: 'isFunded' },
      { address, abi: ESCROW_ABI, functionName: 'totalEscrowAmount' },
      { address, abi: ESCROW_ABI, functionName: 'reviewWindowSeconds' },
      { address, abi: ESCROW_ABI, functionName: 'milestoneCount' }
    ]
  })

  const [client, freelancer, token, arbiter, isFunded, totalAmount, reviewWindow, milestoneCount] = 
    contractData?.map(d => d.result) || []

  const { data: milestonesData } = useReadContracts({
    contracts: Array.from({ length: milestoneCount || 0 }, (_, i) => ({
      address,
      abi: ESCROW_ABI,
      functionName: 'getMilestone',
      args: [i]
    })),
    query: { enabled: !!milestoneCount && milestoneCount > 0 }
  })

  const milestones = milestonesData?.map(m => {
    const [amount, description, state, deliveryTimestamp] = m.result
    return { amount, description, state, deliveryTimestamp }
  }) || []

  const userRole = userAddress === client ? 'client' : 
                   userAddress === freelancer ? 'freelancer' :
                   userAddress === arbiter ? 'arbiter' : null

  const handleFund = async () => {
    setError('')
    try {
      // First approve token
      await writeContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [address, totalAmount]
      })
      
      // Then fund
      await writeContract({
        address,
        abi: ESCROW_ABI,
        functionName: 'fund'
      })
    } catch (err) {
      setError(err.message || 'Transaction failed')
    }
  }

  const handleAction = async (functionName, args) => {
    setError('')
    try {
      await writeContract({
        address,
        abi: ESCROW_ABI,
        functionName,
        args
      })
    } catch (err) {
      setError(err.message || 'Transaction failed')
    }
  }

  const canClaimTimeout = (milestone) => {
    if (milestone.state !== 1) return false // Must be Delivered
    const now = Math.floor(Date.now() / 1000)
    return now >= Number(milestone.deliveryTimestamp) + Number(reviewWindow)
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Connect Your Wallet</h1>
          <p className="text-text2">Please connect your wallet to view project details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/dashboard" className="flex items-center text-text2 hover:text-text mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Project Details</h1>
            <div className="font-mono text-sm text-text2">{address}</div>
          </div>
          <div className="flex items-center gap-2">
            {isFunded ? (
              <span className="badge badge-approved">Funded</span>
            ) : (
              <span className="badge badge-pending">Unfunded</span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-text2 mb-1">Total Amount</div>
            <div className="text-xl font-bold text-text">{totalAmount ? (Number(totalAmount) / 1e6).toFixed(2) : '0'} USDC</div>
          </div>
          <div className="card">
            <div className="text-sm text-text2 mb-1">Client</div>
            <div className="text-sm font-mono text-text">{client?.slice(0, 8)}...{client?.slice(-6)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-text2 mb-1">Freelancer</div>
            <div className="text-sm font-mono text-text">{freelancer?.slice(0, 8)}...{freelancer?.slice(-6)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-text2 mb-1">Your Role</div>
            <div className="text-sm font-semibold text-success capitalize">{userRole || 'Observer'}</div>
          </div>
        </div>
      </div>

      {/* Fund Button */}
      {!isFunded && userRole === 'client' && (
        <div className="card mb-8 bg-success/10 border-success/30">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-text mb-1">Fund Project</h3>
              <p className="text-text2 text-sm">Deposit {totalAmount ? (Number(totalAmount) / 1e6).toFixed(2) : '0'} USDC to start the project</p>
            </div>
            <button onClick={handleFund} className="btn btn-primary">
              Fund Project
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-danger mb-6">
          {error}
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text mb-4">Milestones</h2>
        
        {milestones.map((milestone, index) => (
          <div key={index} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-text2 mb-1">Milestone {index + 1}</div>
                <h3 className="text-lg font-semibold text-text">{milestone.description}</h3>
              </div>
              <span className={`badge ${STATE_BADGES[milestone.state]}`}>
                {STATE_LABELS[milestone.state]}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-text2">Amount</div>
                <div className="font-semibold text-text">{(Number(milestone.amount) / 1e6).toFixed(2)} USDC</div>
              </div>
              {milestone.deliveryTimestamp > 0 && (
                <div>
                  <div className="text-sm text-text2">Delivered</div>
                  <div className="text-sm text-text">
                    {new Date(Number(milestone.deliveryTimestamp) * 1000).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isFunded && (
              <div className="border-t border-border pt-4">
                {userRole === 'freelancer' && milestone.state === 0 && (
                  <button
                    onClick={() => handleAction('markDelivered', [index])}
                    className="btn btn-primary w-full"
                  >
                    Mark as Delivered
                  </button>
                )}

                {userRole === 'freelancer' && milestone.state === 1 && canClaimTimeout(milestone) && (
                  <button
                    onClick={() => handleAction('claimAfterTimeout', [index])}
                    className="btn btn-primary w-full"
                  >
                    Claim After Timeout
                  </button>
                )}

                {userRole === 'client' && milestone.state === 1 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction('approve', [index])}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('raiseDispute', [index])}
                      className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Dispute
                    </button>
                  </div>
                )}

                {userRole === 'arbiter' && milestone.state === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-text mb-2">Client Share (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={disputeSplit / 100}
                        onChange={(e) => setDisputeSplit(e.target.value * 100)}
                        className="input"
                      />
                    </div>
                    <button
                      onClick={() => handleAction('resolveDispute', [index, disputeSplit])}
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Resolve Dispute
                    </button>
                  </div>
                )}

                {milestone.state >= 2 && milestone.state !== 3 && (
                  <div className="text-center text-text2 text-sm">
                    {milestone.state === 2 && 'Payment released to freelancer'}
                    {milestone.state === 4 && 'Dispute resolved'}
                    {milestone.state === 5 && 'Payment released'}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
