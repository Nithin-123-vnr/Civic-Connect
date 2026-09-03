import { INDIA_JURISDICTION_DATA } from '@/data/jurisdictions/indiaData';
import { TELANGANA_DISTRICTS, buildTelanganaAdministrativeUnits } from '@/data/jurisdictions/telanganaData';
import type { StateInfo, DistrictInfo, AdministrativeUnitInfo, AdministrativeUnitType } from '@/data/jurisdictions/types';
import type { Territory } from '@/types';

const TELANGANA_ADMIN_UNITS = buildTelanganaAdministrativeUnits();

/**
 * Returns all 36 Indian States and Union Territories sorted alphabetically
 * (28 States + 8 Union Territories)
 */
export function getStates(): StateInfo[] {
  return [...INDIA_JURISDICTION_DATA.states].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get state metadata by ID, name, or code
 */
export function getStateById(stateIdOrName: string): StateInfo | undefined {
  if (!stateIdOrName) return undefined;
  const raw = stateIdOrName.trim().toLowerCase();
  const query = raw.replace(/\s+/g, '-');
  return INDIA_JURISDICTION_DATA.states.find(
    s => s.id === query || s.name.toLowerCase() === raw || s.code.toLowerCase() === raw
  );
}

/**
 * Returns the proper regional terminology for a state's sub-district
 * e.g. 'Mandal' for Telangana/AP, 'Taluk' for Karnataka/TN/Kerala, 'Taluka' for Maharashtra/Gujarat, 'Tehsil' for UP/MP/Rajasthan
 */
export function getAdministrativeUnitLabel(stateIdOrName: string): AdministrativeUnitType {
  const state = getStateById(stateIdOrName);
  return state ? state.administrativeUnitType : 'Mandal';
}

/**
 * Get districts belonging to a specific state (returns authoritative 33 districts for Telangana)
 */
export function getDistricts(stateIdOrName: string): DistrictInfo[] {
  const state = getStateById(stateIdOrName);
  if (!state) return [];

  if (state.id === 'telangana') {
    return [...TELANGANA_DISTRICTS].sort((a, b) => a.name.localeCompare(b.name));
  }

  const list = INDIA_JURISDICTION_DATA.districts[state.id] || [];
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a specific district
 */
export function getDistrictById(stateIdOrName: string, districtIdOrName: string): DistrictInfo | undefined {
  if (!districtIdOrName) return undefined;
  const districts = getDistricts(stateIdOrName);
  const raw = districtIdOrName.trim().toLowerCase();
  const query = raw.replace(/\s+/g, '-');
  return districts.find(
    d => d.id === query || d.name.toLowerCase() === raw || d.id === `dist-${query}`
  );
}

/**
 * Get administrative units (Mandals/Taluks/Tehsils) belonging to a specific district
 * (returns authoritative 612 mandals for Telangana districts)
 */
export function getAdministrativeUnits(stateIdOrName: string, districtIdOrName: string): AdministrativeUnitInfo[] {
  const state = getStateById(stateIdOrName);
  const district = getDistrictById(stateIdOrName, districtIdOrName);
  if (!district) return [];

  if (state?.id === 'telangana') {
    const list = TELANGANA_ADMIN_UNITS[district.id] || [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  const list = INDIA_JURISDICTION_DATA.administrativeUnits[district.id] || [];
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build a standard full Territory object from user selections
 */
export function createTerritoryObject(
  stateNameOrId: string,
  districtNameOrId?: string,
  unitNameOrId?: string
): Territory {
  const stateObj = getStateById(stateNameOrId);
  const stateName = stateObj ? stateObj.name : stateNameOrId;
  const stateId = stateObj ? stateObj.id : (stateName || 'telangana').toLowerCase().replace(/\s+/g, '-');

  if (!districtNameOrId) {
    return {
      id: stateId,
      name: stateName,
      type: 'state',
      stateId,
      state: stateName,
    };
  }

  const distObj = getDistrictById(stateNameOrId, districtNameOrId);
  const distName = distObj ? distObj.name : districtNameOrId;
  const distId = distObj ? distObj.id : `dist-${(distName || 'district').toLowerCase().replace(/\s+/g, '-')}`;

  if (!unitNameOrId) {
    return {
      id: distId,
      name: distName,
      type: 'district',
      stateId,
      state: stateName,
      districtId: distId,
      district: distName,
    };
  }

  const unitList = getAdministrativeUnits(stateNameOrId, districtNameOrId);
  const unitObj = unitList.find(u => u.name.toLowerCase() === unitNameOrId.toLowerCase() || u.id === unitNameOrId);

  const unitType = stateObj?.administrativeUnitType || 'Mandal';
  const unitName = unitObj ? unitObj.name : unitNameOrId;
  const unitId = unitObj ? unitObj.id : `mandal-${(unitNameOrId || 'unit').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return {
    id: unitId,
    name: unitName,
    type: 'administrative_unit',
    stateId,
    state: stateName,
    districtId: distId,
    district: distName,
    administrativeUnitId: unitId,
    administrativeUnitName: unitName,
    administrativeUnitType: unitType,
    mandal: unitName, // backward compatibility
  };
}

/**
 * Returns string list of authentic mandals belonging to a Telangana district
 */
export function getMandalsForDistrict(districtName: string): string[] {
  if (!districtName) return [];
  const units = getAdministrativeUnits('telangana', districtName);
  return units.map(u => u.name);
}

/**
 * Validates whether a District ↔ Mandal relationship strictly belongs to authoritative Telangana jurisdiction data.
 */
export function validateDistrictMandalPair(
  districtName: string,
  mandalName: string
): { isValid: boolean; normalizedDistrict?: string; normalizedMandal?: string; reason?: string } {
  if (!districtName || !districtName.trim()) {
    return { isValid: false, reason: 'District name is missing' };
  }
  if (!mandalName || !mandalName.trim()) {
    return { isValid: false, reason: 'Mandal name is missing' };
  }

  const distObj = getDistrictById('telangana', districtName);
  if (!distObj) {
    return { isValid: false, reason: `District "${districtName}" is not a recognized Telangana district` };
  }

  const mandalList = getAdministrativeUnits('telangana', distObj.name);
  const rawMandal = mandalName.trim().toLowerCase();

  const matchedMandal = mandalList.find(
    m =>
      m.name.toLowerCase() === rawMandal ||
      m.id.toLowerCase() === rawMandal ||
      m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === rawMandal.replace(/[^a-z0-9]/g, '')
  );

  if (!matchedMandal) {
    // Permit generic 'Headquarters' or exact match
    if (rawMandal === 'headquarters') {
      return { isValid: true, normalizedDistrict: distObj.name, normalizedMandal: 'Headquarters' };
    }
    return {
      isValid: false,
      reason: `Mandal "${mandalName}" does not belong to district "${distObj.name}" in authoritative Telangana jurisdiction registry.`,
    };
  }

  return {
    isValid: true,
    normalizedDistrict: distObj.name,
    normalizedMandal: matchedMandal.name,
  };
}

export interface JurisdictionValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a single complaint record for full State -> District -> Mandal -> Officer consistency.
 */
export function validateComplaintJurisdiction(
  complaint: {
    stateId?: string;
    districtName?: string;
    mandalName?: string;
    assignedTo?: string;
    assignedToName?: string;
    assignedDepartment?: string;
  },
  personnelMap?: Map<string, { districtName: string; mandalName?: string | null; level: string }>
): JurisdictionValidationResult {
  const errors: string[] = [];

  // 1. State check
  const stateId = complaint.stateId || 'state-telangana';
  if (stateId !== 'state-telangana' && stateId !== 'telangana') {
    errors.push(`Invalid state ID: "${stateId}". Expected "state-telangana".`);
  }

  // 2. District & Mandal pairing
  if (!complaint.districtName) {
    errors.push('Missing district name in complaint.');
  } else if (!complaint.mandalName) {
    errors.push('Missing mandal name in complaint.');
  } else {
    const pairCheck = validateDistrictMandalPair(complaint.districtName, complaint.mandalName);
    if (!pairCheck.isValid) {
      errors.push(pairCheck.reason || 'Invalid District-Mandal pair.');
    }
  }

  // 3. Officer assignment jurisdiction check
  if (complaint.assignedTo && personnelMap && personnelMap.has(complaint.assignedTo)) {
    const p = personnelMap.get(complaint.assignedTo)!;
    if (complaint.districtName && p.districtName.toLowerCase() !== complaint.districtName.toLowerCase()) {
      errors.push(
        `Cross-district assignment: Personnel "${p.districtName}" assigned to complaint in "${complaint.districtName}".`
      );
    }
    if (
      p.level === 'mandal' &&
      p.mandalName &&
      complaint.mandalName &&
      p.mandalName.toLowerCase() !== complaint.mandalName.toLowerCase()
    ) {
      errors.push(
        `Cross-mandal assignment: Mandal personnel "${p.mandalName}" assigned to complaint in "${complaint.mandalName}".`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export interface JurisdictionAuditSummary {
  totalComplaints: number;
  validJurisdiction: number;
  invalidJurisdiction: number;
  crossDistrictAssignments: number;
  crossMandalAssignments: number;
  districtCounts: Record<string, number>;
  mismatchDetails: { referenceId?: string; district: string; mandal: string; reason: string }[];
}

/**
 * Audits an array of complaints against the authoritative jurisdiction registry.
 */
export function validateAllComplaintJurisdictions(
  complaints: any[],
  personnelList: any[] = []
): JurisdictionAuditSummary {
  const personnelMap = new Map<string, { districtName: string; mandalName?: string | null; level: string }>();
  for (const p of personnelList) {
    personnelMap.set(p.id, {
      districtName: p.districtName || p.district_name,
      mandalName: p.mandalName || p.mandal_name,
      level: p.level || 'district',
    });
  }

  let valid = 0;
  let invalid = 0;
  let crossDistrict = 0;
  let crossMandal = 0;
  const districtCounts: Record<string, number> = {};
  const mismatchDetails: { referenceId?: string; district: string; mandal: string; reason: string }[] = [];

  for (const c of complaints) {
    const dist = c.districtName || c.district_name || 'Unknown';
    districtCounts[dist] = (districtCounts[dist] || 0) + 1;

    const validation = validateComplaintJurisdiction(
      {
        stateId: c.stateId || c.state_id,
        districtName: c.districtName || c.district_name,
        mandalName: c.mandalName || c.mandal_name,
        assignedTo: c.assignedTo || c.assigned_to,
        assignedToName: c.assignedToName || c.assigned_to_name,
        assignedDepartment: c.assignedDepartment || c.assigned_department,
      },
      personnelMap
    );

    if (validation.isValid) {
      valid++;
    } else {
      invalid++;
      for (const err of validation.errors) {
        if (err.includes('Cross-district')) crossDistrict++;
        if (err.includes('Cross-mandal')) crossMandal++;
        mismatchDetails.push({
          referenceId: c.referenceId || c.reference_id,
          district: dist,
          mandal: c.mandalName || c.mandal_name || 'None',
          reason: err,
        });
      }
    }
  }

  return {
    totalComplaints: complaints.length,
    validJurisdiction: valid,
    invalidJurisdiction: invalid,
    crossDistrictAssignments: crossDistrict,
    crossMandalAssignments: crossMandal,
    districtCounts,
    mismatchDetails,
  };
}
