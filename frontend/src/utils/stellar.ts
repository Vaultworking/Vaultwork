import { Server, TransactionBuilder, Networks, BASE_FEE, Asset, Contract } from '@stellar/stellar-sdk'
import { xdr } from '@stellar/stellar-sdk'

const server = new Server(import.meta.env.VITE_STELLAR_NETWORK || 'https://horizon-testnet.stellar.org')

export const initializeContract = (contractId: string, walletAddress: string) => {
  const contract = new Contract(contractId)
  return contract
}

export const strToScVal = (str: string) => {
  return xdr.ScVal.scvString(str)
}

export const addressToScVal = (address: string) => {
  return xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(
    xdr.PublicKey.publicKeyTypeEd25519(
      Buffer.from(address, 'base64')
    )
  ))
}

export const i128ToScVal = (num: number) => {
  return xdr.ScVal.scvI128(new xdr.Int128(num))
}

export const scValToNative = (scVal: xdr.ScVal) => {
  switch (scVal.switch().name) {
    case 'scvString':
      return scVal.str()
    case 'scvAddress':
      const address = scVal.address()
      return Buffer.from(address.accountId().value()).toString('base64')
    case 'scvI128':
      return scVal.i128().toNumber()
    case 'scvU128':
      return scVal.u128().toNumber()
    case 'scvBool':
      return scVal.b()
    case 'scvVoid':
      return null
    default:
      return scVal
  }
}

export const fetchProjectsByAddress = async (address: string) => {
  try {
    // TODO: Implement actual contract call to fetch projects
    // This is a placeholder for the actual implementation
    return []
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    throw error
  }
}

export const fetchProjectData = async (contractAddress: string) => {
  try {
    // TODO: Implement actual contract call to fetch project data
    // This is a placeholder for the actual implementation
    return null
  } catch (error) {
    console.error('Failed to fetch project data:', error)
    throw error
  }
}

export const fetchMilestones = async (contractAddress: string) => {
  try {
    // TODO: Implement actual contract call to fetch milestones
    // This is a placeholder for the actual implementation
    return []
  } catch (error) {
    console.error('Failed to fetch milestones:', error)
    throw error
  }
}

export const createProject = async (
  walletAddress: string,
  freelancerAddress: string,
  tokenAddress: string,
  arbiterAddress: string,
  milestoneAmounts: number[],
  milestoneDescriptions: string[],
  reviewWindowSeconds: number
) => {
  try {
    // TODO: Implement actual contract call to create project
    // This is a placeholder for the actual implementation
    console.log('Creating project with:', {
      walletAddress,
      freelancerAddress,
      tokenAddress,
      arbiterAddress,
      milestoneAmounts,
      milestoneDescriptions,
      reviewWindowSeconds
    })
    return 'CONTRACT_ADDRESS_HERE'
  } catch (error) {
    console.error('Failed to create project:', error)
    throw error
  }
}

export const markDelivered = async (contractAddress: string, walletAddress: string, milestoneIndex: number) => {
  try {
    // TODO: Implement actual contract call to mark milestone as delivered
    console.log('Marking milestone as delivered:', { contractAddress, walletAddress, milestoneIndex })
  } catch (error) {
    console.error('Failed to mark milestone as delivered:', error)
    throw error
  }
}

export const approveMilestone = async (contractAddress: string, walletAddress: string, milestoneIndex: number) => {
  try {
    // TODO: Implement actual contract call to approve milestone
    console.log('Approving milestone:', { contractAddress, walletAddress, milestoneIndex })
  } catch (error) {
    console.error('Failed to approve milestone:', error)
    throw error
  }
}

export const raiseDispute = async (contractAddress: string, walletAddress: string, milestoneIndex: number) => {
  try {
    // TODO: Implement actual contract call to raise dispute
    console.log('Raising dispute:', { contractAddress, walletAddress, milestoneIndex })
  } catch (error) {
    console.error('Failed to raise dispute:', error)
    throw error
  }
}

export const resolveDispute = async (
  contractAddress: string,
  walletAddress: string,
  milestoneIndex: number,
  clientSplit: number,
  freelancerSplit: number
) => {
  try {
    // TODO: Implement actual contract call to resolve dispute
    console.log('Resolving dispute:', { contractAddress, walletAddress, milestoneIndex, clientSplit, freelancerSplit })
  } catch (error) {
    console.error('Failed to resolve dispute:', error)
    throw error
  }
}

export const claimAfterTimeout = async (contractAddress: string, walletAddress: string, milestoneIndex: number) => {
  try {
    // TODO: Implement actual contract call to claim after timeout
    console.log('Claiming after timeout:', { contractAddress, walletAddress, milestoneIndex })
  } catch (error) {
    console.error('Failed to claim after timeout:', error)
    throw error
  }
}
