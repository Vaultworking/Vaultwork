// Challenge-signing authentication for Stellar wallets
// This provides a more secure way to authenticate users by having them sign a challenge message

export const generateChallenge = (walletAddress: string): string => {
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).substring(2, 15)
  return `Sign this message to authenticate with Vaultwork\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nNonce: ${nonce}`
}

export const verifySignature = async (
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> => {
  try {
    // In a real implementation, you would verify the signature on the backend
    // For now, we'll do a basic check that the signature exists and the message matches
    if (!signature || signature.length === 0) {
      return false
    }

    // Extract the wallet address from the message to ensure it matches
    const messageAddress = message.match(/Wallet: (G[A-Z0-9]{55})/)?.[1]
    if (messageAddress !== walletAddress) {
      return false
    }

    // Check if the message is recent (within 5 minutes)
    const timestampMatch = message.match(/Timestamp: (\d+)/)?.[1]
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch, 10)
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      if (now - timestamp > fiveMinutes) {
        return false
      }
    }

    // In production, you would use Stellar SDK to verify the signature:
    // import { Keypair } from '@stellar/stellar-sdk'
    // const keypair = Keypair.fromPublicKey(walletAddress)
    // const isValid = keypair.verify(message, signature)
    
    // For now, basic validation that signature exists
    return signature && signature.length > 0
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

export const authenticateWithChallenge = async (walletAddress: string): Promise<boolean> => {
  try {
    if (!window.freighter) {
      throw new Error('Freighter wallet not found')
    }

    const challenge = generateChallenge(walletAddress)
    const signature = await window.freighter.signMessage(challenge, walletAddress)
    
    const isValid = await verifySignature(walletAddress, signature, challenge)
    return isValid
  } catch (error) {
    console.error('Challenge authentication failed:', error)
    return false
  }
}

export const checkAuthentication = async (walletAddress: string): Promise<boolean> => {
  // Check if the user has a valid session
  // This would typically check localStorage or a cookie for an auth token
  const authData = localStorage.getItem(`auth_${walletAddress}`)
  if (!authData) return false

  try {
    const { timestamp } = JSON.parse(authData)
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    // Session expires after 1 hour
    if (now - timestamp > oneHour) {
      localStorage.removeItem(`auth_${walletAddress}`)
      return false
    }
    
    return true
  } catch {
    return false
  }
}

export const setAuthenticated = (walletAddress: string) => {
  localStorage.setItem(`auth_${walletAddress}`, JSON.stringify({
    timestamp: Date.now()
  }))
}

export const logout = (walletAddress: string) => {
  localStorage.removeItem(`auth_${walletAddress}`)
}
