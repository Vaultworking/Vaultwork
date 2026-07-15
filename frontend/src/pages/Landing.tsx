import { Link } from 'react-router-dom'
import { Shield, Clock, Users, ArrowRight, Lock, Zap, Globe, CheckCircle, Star, ChevronRight } from 'lucide-react'

interface LandingProps {
  walletAddress: string | null
}

export default function Landing({ walletAddress }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 dark:from-emerald-500/5 dark:via-transparent dark:to-blue-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted by 1000+ freelancers and clients</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Secure Payments
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
                Without the Risk
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Trust-minimized milestone escrow on Stellar. Release funds only when work is delivered and approved. No more payment disputes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {walletAddress ? (
                <Link to="/dashboard" className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
                  Connect Wallet to Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                Learn More
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Smart Contract Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Instant Settlements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium">Low Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Choose Vaultwork?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Built on Stellar for fast, secure, and low-cost transactions
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure Escrow</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Funds are locked in audited smart contracts and only released when milestones are approved. Your money is always safe.
              </p>
            </div>
          </div>
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Auto-Release</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                If client doesn't respond within the review window, freelancer can claim funds automatically. No more ghosting.
              </p>
            </div>
          </div>
          <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dispute Resolution</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Trusted arbiter can resolve disputes by splitting funds fairly between parties. Fair outcomes guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get started in 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Create Project</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Client defines milestones and deposits funds into smart contract
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent" />
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Deliver Work</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Freelancer marks milestones as delivered with evidence
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Review & Approve</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Client reviews and approves each milestone within review window
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Get Paid</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Funds are released automatically on approval via smart contract
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$2M+</div>
            <div className="text-slate-600 dark:text-slate-400">Total Escrowed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">1,000+</div>
            <div className="text-slate-600 dark:text-slate-400">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">99.9%</div>
            <div className="text-slate-600 dark:text-slate-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">&lt;5s</div>
            <div className="text-slate-600 dark:text-slate-400">Avg Settlement</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-500 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Secure Your Payments?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of freelancers and clients who trust Vaultwork for secure milestone payments.
          </p>
          {walletAddress ? (
            <Link to="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-200 shadow-xl">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-200 shadow-xl">
              Connect Wallet to Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Vaultwork</span>
            </div>
            <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400 text-sm">
              <span>Built on Stellar</span>
              <span>•</span>
              <span>Smart Contract Powered</span>
              <span>•</span>
              <span>Audited & Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
