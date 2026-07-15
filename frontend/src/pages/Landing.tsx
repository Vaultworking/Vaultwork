import { Link } from 'react-router-dom'
import { Shield, Clock, Users, ArrowRight } from 'lucide-react'

interface LandingProps {
  walletAddress: string | null
}

export default function Landing({ walletAddress }: LandingProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-text mb-6">
            Trust-Minimized
            <span className="text-success"> Milestone Escrow</span>
          </h1>
          <p className="text-xl text-text2 mb-8 max-w-2xl mx-auto">
            Secure freelance payments on Stellar. Release funds only when milestones are delivered and approved.
          </p>
          <div className="flex justify-center gap-4">
            {walletAddress ? (
              <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
                Go to Dashboard
                <ArrowRight className="inline ml-2 w-5 h-5" />
              </Link>
            ) : (
              <button className="btn btn-primary text-lg px-8 py-3">
                Connect Wallet to Get Started
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">Secure Escrow</h3>
            <p className="text-text2">
              Funds are locked in smart contracts and only released when milestones are approved.
            </p>
          </div>
          <div className="card">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">Auto-Release</h3>
            <p className="text-text2">
              If client doesn't respond within the review window, freelancer can claim funds automatically.
            </p>
          </div>
          <div className="card">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">Dispute Resolution</h3>
            <p className="text-text2">
              Trusted arbiter can resolve disputes by splitting funds fairly between parties.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-text text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">1</div>
            <h3 className="font-semibold text-text mb-2">Create Project</h3>
            <p className="text-text2 text-sm">Client defines milestones and deposits funds</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">2</div>
            <h3 className="font-semibold text-text mb-2">Deliver Work</h3>
            <p className="text-text2 text-sm">Freelancer marks milestones as delivered</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">3</div>
            <h3 className="font-semibold text-text mb-2">Review & Approve</h3>
            <p className="text-text2 text-sm">Client reviews and approves each milestone</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">4</div>
            <h3 className="font-semibold text-text mb-2">Get Paid</h3>
            <p className="text-text2 text-sm">Funds are released automatically on approval</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-text2 text-sm">
            Built on Stellar • Smart Contract Powered
          </p>
        </div>
      </div>
    </div>
  )
}
