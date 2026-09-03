// ============================================================
// Core Domain Types — CivicConnect
// ============================================================

export type Role =
  | 'citizen'
  | 'mandal_officer'
  | 'district_officer'
  | 'state_admin';

export interface Territory {
  id: string;
  name: string;
  type: 'state' | 'district' | 'administrative_unit' | 'mandal' | 'taluk' | 'tehsil' | 'area';
  parentId?: string;
  stateId?: string;
  state?: string;
  districtId?: string;
  district?: string;
  administrativeUnitId?: string;
  administrativeUnitName?: string;
  administrativeUnitType?: string; // 'Mandal' | 'Taluk' | 'Tehsil' | 'Taluka' | 'Block' | 'Circle' | 'Subdivision'
  mandal?: string; // backward compatibility
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: Role;
  territory: Territory;
  avatarUrl?: string;
  createdAt: string; // ISO string
  lastLoginAt?: string;
}

// ============================================================
// Complaint Enums
// ============================================================

export type ComplaintStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'escalated'
  | 'rejected'
  | 'closed'
  | 'reopened';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintCategory =
  | 'roads'
  | 'water'
  | 'drainage'
  | 'sanitation'
  | 'electricity'
  | 'parks'
  | 'public_safety'
  | 'disaster_mgmt'
  | 'other';

// ============================================================
// Complaint
// ============================================================

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface ComplaintUpdate {
  id: string;
  complaintId: string;
  timestamp: string; // ISO
  status: ComplaintStatus;
  note: string;
  updatedBy: string; // user uid
  updatedByName: string;
  isPublic: boolean;
}

export interface Complaint {
  id: string;
  referenceId: string; // e.g. "CC-5102"
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  // Submitter
  citizenId: string;
  citizenName: string;
  // Location hierarchy
  location: GeoLocation;
  areaId: string;
  areaName: string;
  mandalId: string;
  mandalName: string;
  districtId: string;
  districtName: string;
  stateId: string;
  // Evidence
  photoUrls: string[];
  videoUrls: string[];
  resolutionPhotoUrls?: string[];
  // Assignment
  assignedTo?: string; // field officer id
  assignedToName?: string;
  assignedDepartment?: string;
  assignedDesignation?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  citizenConfirmedAt?: string;
  citizenConfirmationNote?: string;
  // Escalation
  escalationLevel: 0 | 1 | 2; // 0=mandal, 1=district, 2=state
  escalatedAt?: string;
  // Updates timeline
  updates: ComplaintUpdate[];
  // Feedback
  citizenRating?: 1 | 2 | 3 | 4 | 5;
  citizenFeedback?: string;
}

// ============================================================
// Notification
// ============================================================

export type NotificationType =
  | 'complaint_status_update'
  | 'complaint_assigned'
  | 'complaint_escalated'
  | 'complaint_resolved'
  | 'new_complaint'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  complaintId?: string;
  complaintRef?: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================================
// Dashboard KPI types
// ============================================================

export interface KPISummary {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  rejected: number;
  closed: number;
}

export interface CategoryBreakdown {
  category: ComplaintCategory;
  count: number;
  percentage: number;
}

export interface DailyTrend {
  date: string; // e.g. 'Mon', 'Tue'
  count: number;
}
