import { useAccount } from 'wagmi'
import { useReadContract, useReadContracts } from 'wagmi'
import { Link } from 'react-router-dom'
import { Plus, ArrowRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

const FACTORY_ADDRESS = '0x0000000000000000000000000000000000000000' // Replace with deployed address

const FACTORY_ABI = [
  {
    "inputs": [{"name": "client", "type": "address"}],
    "name": "getEscrowsByClient",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "freelancer", "type": "address"}],
    "name": "getEscrowsByFreelancer",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
]

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
  }
]

export default function Dashboard() {
  const { address, isConnected } = useAccount()

  const { data: clientEscrows } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getEscrowsByClient',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: freelancerEscrows } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getEscrowsByFreelancer',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const allEscrows = [...(clientEscrows || []), ...(freelancerEscrows || [])]
  const uniqueEscrows = [...new Set(allEscrows)]

  const { data: escrowDetails } = useReadContracts({
    contracts: uniqueEscrows.map(escrow => ({
      address: escrow,
      abi: ESCROW_ABI,
      functionName: 'client'
    })),
    query: { enabled: uniqueEscrows.length > 0 }
  })

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">Connect Your Wallet</h1>
          <p className="text-text2">Please connect your wallet to view your projects</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Dashboard</h1>
          <p className="text-text2">Manage your escrow projects</p>
        </div>
        <Link to="/create" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Project
        </Link>
      </div>

      {uniqueEscrows.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-surface2 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-text2" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">No Projects Yet</h3>
          <p className="text-text2 mb-6">Create your first milestone escrow project</p>
          <Link to="/create" className="btn btn-primary">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {uniqueEscrows.map((escrow, index) => (
            <ProjectCard key={escrow} address={escrow} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ address }) {
  const { data: details } = useReadContracts({
    contracts: [
      { address, abi: ESCROW_ABI, functionName: 'client' },
      { address, abi: ESCROW_ABI, functionName: 'freelancer' },
      { address, abi: ESCROW_ABI, functionName: 'isFunded' },
      { address, abi: ESCROW_ABI, functionName: 'totalEscrowAmount' },
      { address, abi: ESCROW_ABI, functionName: 'milestoneCount' }
    ]
  })

  const [client, freelancer, isFunded, totalAmount, milestoneCount] = details?.map(d => d.result) || []

  return (
    <Link to={`/project/${address}`} className="block">
      <div className="card hover:border-success transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm text-text2 mb-1">Project Address</div>
            <div className="font-mono text-sm text-text">{address?.slice(0, 10)}...{address?.slice(-8)}</div>
          </div>
          <div className="flex items-center gap-2">
            {isFunded ? (
              <span className="badge badge-approved">Funded</span>
            ) : (
              <span className="badge badge-pending">Unfunded</span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-text2 mb-1">Total Amount</div>
            <div className="font-semibold text-text">{totalAmount ? (Number(totalAmount) / 1e6).toFixed(2) : '0'} USDC</div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Milestones</div>
            <div className="font-semibold text-text">{milestoneCount || 0}</div>
          </div>
          <div>
            <div className="text-sm text-text2 mb-1">Status</div>
            <div className="font-semibold text-success">Active</div>
          </div>
        </div>

        <div className="flex items-center text-text2 text-sm">
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </div>
      </div>
    </Link>
  )
}
