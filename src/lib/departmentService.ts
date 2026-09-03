import { supabase } from './supabase';
import type { ComplaintCategory, Role } from '@/types';

export interface DepartmentMetadata {
  code: string;
  name: string;
  category: ComplaintCategory;
  fieldDesignations: string[];
  description: string;
}

export interface DepartmentalPersonnel {
  id: string;
  fullName: string;
  designation: string;
  department: string;
  category: ComplaintCategory;
  level: 'mandal' | 'district';
  stateName: string;
  districtName: string;
  mandalName?: string | null;
  phoneNumber?: string;
  email?: string;
  employeeId?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export const DEPARTMENT_MAPPINGS: Record<ComplaintCategory, DepartmentMetadata> = {
  roads: {
    code: 'DEPT_ROADS',
    name: 'Roads & Buildings / Panchayat Engineering',
    category: 'roads',
    fieldDesignations: [
      'Junior Engineer (Roads)',
      'Assistant Engineer (R&B)',
      'Section Officer (Highways & Panchayat)'
    ],
    description: 'Pothole repair, road laying, culverts, pavement maintenance, and civil works.',
  },
  water: {
    code: 'DEPT_WATER',
    name: 'Mission Bhagiratha / Rural & Urban Water Supply',
    category: 'water',
    fieldDesignations: [
      'Water Works Inspector',
      'Assistant Engineer (Water Supply)',
      'Line Superintendent (Mission Bhagiratha)'
    ],
    description: 'Drinking water pipeline maintenance, supply scheduling, overhead tanks, and leak repairs.',
  },
  drainage: {
    code: 'DEPT_DRAINAGE',
    name: 'Drainage & Sewerage Engineering Department',
    category: 'drainage',
    fieldDesignations: [
      'Drainage Maintenance Engineer',
      'Assistant Engineer (Sewerage)',
      'Sanitary Inspector (Drainage)'
    ],
    description: 'Stormwater drains, sewer desilting, manhole covers, and wastewater canal networks.',
  },
  electricity: {
    code: 'DEPT_POWER',
    name: 'Power & Electricity Department (TSSPDCL / TSNPDCL)',
    category: 'electricity',
    fieldDesignations: [
      'Electrical Inspector',
      'Assistant Engineer (Electrical Operations)',
      'Sub-Engineer (Distribution)'
    ],
    description: 'Street lighting, transformer repairs, low-hanging wires, and electrical hazard safety.',
  },
  sanitation: {
    code: 'DEPT_SANITATION',
    name: 'Municipal Sanitation & Public Health Department',
    category: 'sanitation',
    fieldDesignations: [
      'Sanitary Inspector',
      'Health & Sanitation Officer',
      'Ward Sanitation Supervisor'
    ],
    description: 'Solid waste management, garbage clearance, door-to-door collection, and public hygiene.',
  },
  parks: {
    code: 'DEPT_HORTICULTURE',
    name: 'Urban Forestry & Horticulture Department',
    category: 'parks',
    fieldDesignations: [
      'Horticulture Inspector',
      'Parks Field Supervisor',
      'Assistant Director (Horticulture)'
    ],
    description: 'Public parks maintenance, tree trimming, botanical garden upkeep, and green zone safety.',
  },
  public_safety: {
    code: 'DEPT_ENFORCEMENT',
    name: 'Public Safety, Traffic & Municipal Enforcement',
    category: 'public_safety',
    fieldDesignations: [
      'Municipal Enforcement Officer',
      'Town Planning Inspector',
      'Safety & Traffic Coordinator'
    ],
    description: 'Obstruction removal, encroachment clearance, footpath safety, and unauthorized structures.',
  },
  disaster_mgmt: {
    code: 'DEPT_DISASTER',
    name: 'Emergency & Disaster Response Department',
    category: 'disaster_mgmt',
    fieldDesignations: [
      'Disaster Management Officer',
      'Emergency Field Coordinator',
      'Relief & Rescue Inspector'
    ],
    description: 'Monsoon waterlogging, storm damage, structural hazards, fallen trees, and emergency relief.',
  },
  other: {
    code: 'DEPT_CIVIC_WORKS',
    name: 'General Municipal Administration & Public Works',
    category: 'other',
    fieldDesignations: [
      'Public Works Inspector',
      'Municipal Field Officer',
      'Ward Technical Assistant'
    ],
    description: 'Cross-functional civic maintenance, public amenities, and general utility grievances.',
  },
};

export function getDepartmentForCategory(category: ComplaintCategory): DepartmentMetadata {
  return (
    DEPARTMENT_MAPPINGS[category] || {
      code: 'DEPT_GENERAL',
      name: 'Municipal Public Works',
      category: 'other',
      fieldDesignations: ['Municipal Field Officer'],
      description: 'General municipal complaints and works.',
    }
  );
}

function normalize(str?: string | null): string {
  return (str || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Single Central Source of Truth for fetching eligible departmental field personnel.
 * Strictly enforces:
 * - Category -> Department matching
 * - State -> District -> Mandal jurisdiction boundaries
 * - Distinguishes Mandal-level field personnel and District-level departmental engineers
 */
export async function getEligibleAssignmentPersonnel(params: {
  category?: ComplaintCategory;
  districtName?: string;
  mandalName?: string;
  officerRole?: Role;
}): Promise<DepartmentalPersonnel[]> {
  try {
    let query = supabase
      .from('departmental_personnel')
      .select('*')
      .eq('status', 'active');

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.districtName && params.districtName !== 'All Districts') {
      query = query.ilike('district_name', params.districtName);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('Error querying departmental personnel:', error);
      return [];
    }

    const normDistrict = normalize(params.districtName);
    const normMandal = normalize(params.mandalName);

    const mapped: DepartmentalPersonnel[] = data.map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      designation: row.designation,
      department: row.department,
      category: row.category as ComplaintCategory,
      level: row.level as 'mandal' | 'district',
      stateName: row.state_name,
      districtName: row.district_name,
      mandalName: row.mandal_name || undefined,
      phoneNumber: row.phone_number || undefined,
      email: row.email || undefined,
      employeeId: row.employee_id || undefined,
      status: row.status as 'active' | 'inactive',
      createdAt: row.created_at,
    }));

    // Jurisdiction filtering based on officer role and complaint location
    return mapped.filter(p => {
      // 1. Department/Category check
      if (params.category && p.category !== params.category) {
        return false;
      }

      const pDist = normalize(p.districtName);
      const pMandal = normalize(p.mandalName);

      // 2. District Check
      if (normDistrict && pDist !== normDistrict) {
        return false;
      }

      // 3. Mandal Officer Scope:
      // Can assign:
      // a) Departmental personnel assigned specifically to this Mandal
      // b) District-level departmental engineers for this district (who serve all mandals)
      if (params.officerRole === 'mandal_officer') {
        if (p.level === 'mandal') {
          return normMandal ? pMandal === normMandal : true;
        }
        return true; // District level personnel can assist
      }

      // 4. District Officer Scope:
      // Can assign any departmental personnel within this district (all mandals in the district + district engineers)
      if (params.officerRole === 'district_officer') {
        return true;
      }

      // 5. State Admin Scope:
      // Can assign eligible personnel within the complaint's district & mandal
      if (params.officerRole === 'state_admin') {
        if (normMandal && p.level === 'mandal') {
          return pMandal === normMandal;
        }
        return true;
      }

      return true;
    });
  } catch (err) {
    console.error('Exception in getEligibleAssignmentPersonnel:', err);
    return [];
  }
}
