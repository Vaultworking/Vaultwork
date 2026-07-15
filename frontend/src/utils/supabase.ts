import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface ProjectMetadata {
  id: string
  escrow_address: string
  client_address: string
  freelancer_address: string
  title: string
  description: string
  created_at: string
  updated_at: string
  status: 'active' | 'completed' | 'cancelled' | 'disputed'
}

export interface UserProfile {
  id: string
  wallet_address: string
  display_name: string
  bio: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export const createProjectMetadata = async (
  escrowAddress: string,
  clientAddress: string,
  freelancerAddress: string,
  title: string,
  description: string
) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      escrow_address: escrowAddress,
      client_address: clientAddress,
      freelancer_address: freelancerAddress,
      title,
      description,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getProjectMetadata = async (escrowAddress: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('escrow_address', escrowAddress)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const getProjectsByAddress = async (address: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .or(`client_address.eq.${address},freelancer_address.eq.${address}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const updateProjectMetadata = async (
  escrowAddress: string,
  updates: Partial<ProjectMetadata>
) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('escrow_address', escrowAddress)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserProfile = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const createOrUpdateProfile = async (
  walletAddress: string,
  displayName: string,
  bio?: string,
  avatarUrl?: string
) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      wallet_address: walletAddress,
      display_name: displayName,
      bio: bio || '',
      avatar_url: avatarUrl || ''
    })
    .select()
    .single()

  if (error) throw error
  return data
}
