import type { Role, Territory } from './index';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  territory: Territory;
  status?: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: AppUser | null;
  authUser: SupabaseUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: Role;
  territory: Territory;
}

export interface JurisdictionSelection {
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  mandalId?: string;
  mandalName?: string;
  administrativeUnitName?: string;
}

export interface LoginData {
  email: string;
  password: string;
  designatedRole: Role;
  jurisdiction?: JurisdictionSelection;
}
