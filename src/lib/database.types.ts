export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ItemCategory = 'cabin' | 'weapon' | 'module' | 'wheel' | 'decoration' | 'resource';
export type ItemRarity = 'common' | 'rare' | 'special' | 'epic' | 'legendary' | 'relic';

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          category: ItemCategory
          rarity: ItemRarity
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          category: ItemCategory
          rarity: ItemRarity
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          category?: ItemCategory
          rarity?: ItemRarity
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          item_id: string
          type: 'purchase' | 'sale'
          price: number
          quantity: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          type: 'purchase' | 'sale'
          price: number
          quantity: number
          date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          type?: 'purchase' | 'sale'
          price?: number
          quantity?: number
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export const ITEM_CATEGORIES: ItemCategory[] = ['cabin', 'weapon', 'module', 'wheel', 'decoration', 'resource'];
export const ITEM_RARITIES: ItemRarity[] = ['common', 'rare', 'special', 'epic', 'legendary', 'relic'];

export const RARITY_COLORS = {
  common: 'text-gray-300',
  rare: 'text-blue-400',
  special: 'text-teal-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
  relic: 'text-red-400'
} as const;