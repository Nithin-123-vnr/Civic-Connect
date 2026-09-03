import { supabase } from './supabase';
import type { AppUser } from '@/types/auth';
import type { Role, Territory } from '@/types';

export function mapProfileToAppUser(profile: any): AppUser {
  const territory: Territory = {
    id: profile.administrative_unit_id || profile.district_id || profile.state_id || 'territory-default',
    name: profile.administrative_unit_name || profile.mandal_name || profile.district_name || profile.state_name || 'Telangana',
    type: profile.role === 'state_admin' ? 'state' : profile.role === 'district_officer' ? 'district' : 'mandal',
    stateId: profile.state_id || 'state-telangana',
    state: profile.state_name || 'Telangana',
    districtId: profile.district_id || undefined,
    district: profile.district_name || undefined,
    administrativeUnitId: profile.administrative_unit_id || undefined,
    administrativeUnitName: profile.administrative_unit_name || profile.mandal_name || undefined,
    administrativeUnitType: profile.administrative_unit_type || 'Mandal',
    mandal: profile.mandal_name || profile.administrative_unit_name || undefined,
  };

  return {
    uid: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    phoneNumber: profile.phone_number || undefined,
    role: profile.role as Role,
    status: profile.status || 'active',
    territory,
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || new Date().toISOString(),
  };
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    if (error || !data) {
      return null;
    }

    return mapProfileToAppUser(data);
  } catch (err) {
    console.error('Failed to get user profile from Supabase:', err);
    return null;
  }
}

export async function createUserProfile(
  uid: string,
  data: Omit<AppUser, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<AppUser> {
  const now = new Date().toISOString();
  const dbRecord = {
    id: uid,
    full_name: data.fullName,
    email: data.email,
    phone_number: data.phoneNumber || null,
    role: data.role,
    status: data.status || 'active',
    state_id: data.territory?.stateId || 'state-telangana',
    state_name: data.territory?.state || 'Telangana',
    district_id: data.territory?.districtId || null,
    district_name: data.territory?.district || null,
    administrative_unit_id: data.territory?.administrativeUnitId || null,
    administrative_unit_name: data.territory?.administrativeUnitName || data.territory?.mandal || null,
    administrative_unit_type: data.territory?.administrativeUnitType || 'Mandal',
    mandal_name: data.territory?.mandal || data.territory?.administrativeUnitName || null,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert(dbRecord)
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile in Supabase:', error);
    throw error;
  }

  return mapProfileToAppUser(inserted);
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<AppUser, 'uid' | 'createdAt'>>
): Promise<void> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.fullName !== undefined) updatePayload.full_name = data.fullName;
  if (data.phoneNumber !== undefined) updatePayload.phone_number = data.phoneNumber;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.role !== undefined) updatePayload.role = data.role;

  if (data.territory) {
    if (data.territory.state) updatePayload.state_name = data.territory.state;
    if (data.territory.district) updatePayload.district_name = data.territory.district;
    if (data.territory.administrativeUnitName || data.territory.mandal) {
      updatePayload.administrative_unit_name = data.territory.administrativeUnitName || data.territory.mandal;
      updatePayload.mandal_name = data.territory.mandal || data.territory.administrativeUnitName;
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', uid);

  if (error) {
    console.error('Error updating user profile in Supabase:', error);
    throw error;
  }
}

export async function getOfficerProfiles(): Promise<AppUser[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['state_admin', 'district_officer', 'mandal_officer'])
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapProfileToAppUser);
  } catch (err) {
    console.error('Error fetching officer profiles:', err);
    return [];
  }
}

export async function getAllProfiles(includeCitizens: boolean = false): Promise<AppUser[]> {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeCitizens) {
      query = query.in('role', ['state_admin', 'district_officer', 'mandal_officer']);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapProfileToAppUser);
  } catch (err) {
    console.error('Error fetching all profiles:', err);
    return [];
  }
}

export async function getEligibleOfficers(params: {
  district?: string;
  mandal?: string;
  role?: 'mandal_officer' | 'district_officer';
}): Promise<AppUser[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['district_officer', 'mandal_officer'])
      .eq('status', 'active');

    if (error || !data) {
      console.warn('Error fetching eligible officers from Supabase:', error);
      return [];
    }

    const allOfficers = data.map(mapProfileToAppUser);

    return allOfficers.filter(officer => {
      if (params.role && officer.role !== params.role) return false;

      const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      const complaintDist = norm(params.district);
      const complaintMandal = norm(params.mandal);

      const officerDist = norm(officer.territory?.district);
      const officerMandal = norm(officer.territory?.mandal || officer.territory?.administrativeUnitName);

      if (officer.role === 'district_officer') {
        if (!complaintDist) return true;
        return officerDist === complaintDist || officerDist.includes('alldistricts');
      }

      if (officer.role === 'mandal_officer') {
        if (complaintDist && officerDist && officerDist !== complaintDist) return false;
        if (complaintMandal && officerMandal && officerMandal !== complaintMandal) return false;
        return true;
      }

      return false;
    });
  } catch (err) {
    console.error('Exception fetching eligible officers:', err);
    return [];
  }
}
