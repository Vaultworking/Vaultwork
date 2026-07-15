/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_STELLAR_NETWORK: string
  readonly VITE_MILESTONE_ESCROW_ADDRESS: string
  readonly VITE_ESCROW_FACTORY_ADDRESS: string
  readonly VITE_USDC_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
