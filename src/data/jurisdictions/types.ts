export type AdministrativeUnitType =
  | 'Mandal'
  | 'Taluk'
  | 'Tehsil'
  | 'Taluka'
  | 'Block'
  | 'Circle'
  | 'Sub-division'
  | 'Subdivision';

export interface StateInfo {
  id: string;
  name: string;
  code: string;
  type: 'state' | 'ut';
  administrativeUnitType: AdministrativeUnitType;
}

export interface DistrictInfo {
  id: string;
  name: string;
  stateId: string;
  stateCode: string;
}

export interface AdministrativeUnitInfo {
  id: string;
  name: string;
  districtId: string;
  stateId: string;
  type: AdministrativeUnitType;
}

export interface JurisdictionHierarchy {
  metadata: {
    source: string;
    authority: string;
    version: string;
    lastUpdated: string;
    totalStatesAndUTs: number;
  };
  states: StateInfo[];
  districts: Record<string, DistrictInfo[]>;
  administrativeUnits: Record<string, AdministrativeUnitInfo[]>;
}
