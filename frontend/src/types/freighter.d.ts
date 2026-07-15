interface FreighterWallet {
  getPublicKey(): Promise<string>
  signMessage(message: string, publicKey?: string): Promise<string>
  isConnected(): Promise<boolean>
  isAllowed(): Promise<boolean>
  getUserInfo(): Promise<{ publicKey: string; }>
  signTransaction(xdr: string, network: string): Promise<string>
}

declare global {
  interface Window {
    freighter?: FreighterWallet
  }
}

export {}
