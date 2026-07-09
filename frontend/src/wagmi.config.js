import { baseSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Vaultwork',
  projectId: 'YOUR_PROJECT_ID', // Replace with WalletConnect project ID
  chains: [baseSepolia],
  ssr: true,
})
