import type { ComplaintStatus, Role } from '@/types';

export const ALLOWED_STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  pending: ['assigned', 'in_progress', 'rejected', 'escalated'],
  assigned: ['in_progress', 'rejected', 'escalated'],
  in_progress: ['resolved', 'rejected', 'escalated'],
  resolved: ['closed'],
  escalated: ['assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
  rejected: [],
  closed: [],
  reopened: ['assigned', 'in_progress', 'resolved'],
};

export const ROLE_STATUS_PERMISSIONS: Record<Role, ComplaintStatus[]> = {
  citizen: ['closed', 'reopened'],
  mandal_officer: ['in_progress', 'resolved', 'closed', 'rejected'],
  district_officer: ['in_progress', 'resolved', 'closed', 'rejected'],
  state_admin: ['assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
};

export function getValidNextStatuses(
  currentStatus: ComplaintStatus,
  userRole?: Role
): ComplaintStatus[] {
  // If complaint is closed or rejected, it is in a terminal state
  if (currentStatus === 'closed' || currentStatus === 'rejected') {
    return [];
  }

  // State admin has apex authority across open cases
  if (userRole === 'state_admin') {
    const allOptions: ComplaintStatus[] = ['assigned', 'in_progress', 'resolved', 'closed', 'rejected'];
    return allOptions.filter(s => s !== currentStatus);
  }

  const transitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (userRole) {
    const permitted = ROLE_STATUS_PERMISSIONS[userRole] || [];
    return transitions.filter(s => permitted.includes(s));
  }
  return transitions;
}

export function canTransitionStatus(
  currentStatus: ComplaintStatus,
  targetStatus: ComplaintStatus,
  userRole: Role
): boolean {
  if (currentStatus === targetStatus) return false;
  if (currentStatus === 'closed' || currentStatus === 'rejected') return false;

  // State admin has apex override authority on active cases
  if (userRole === 'state_admin') return true;

  // Check if role has permission to set target status
  const permittedForRole = ROLE_STATUS_PERMISSIONS[userRole]?.includes(targetStatus);
  if (!permittedForRole) return false;

  // Check if valid workflow transition
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(targetStatus);
  return !!allowed;
}

export function getStatusDisplayName(status: ComplaintStatus): string {
  switch (status) {
    case 'pending': return 'Submitted';
    case 'assigned': return 'Assigned';
    case 'in_progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    case 'rejected': return 'Rejected';
    case 'escalated': return 'Escalated';
    case 'reopened': return 'Reopened';
    default: return status;
  }
}

export function getStatusSemanticDescription(status: ComplaintStatus): string {
  switch (status) {
    case 'pending': return 'Complaint submitted by citizen and awaiting initial review & triage.';
    case 'assigned': return 'Complaint has been assigned to an officer.';
    case 'in_progress': return 'Officer is actively working on the complaint.';
    case 'resolved': return 'The reported issue has been fixed/resolved.';
    case 'closed': return 'Final verification and administrative closure is completed.';
    case 'rejected': return 'Complaint is invalid, duplicate, or outside the applicable scope.';
    case 'escalated': return 'Transferred to higher administrative tier due to SLA breach.';
    case 'reopened': return 'Citizen indicated issue recurrence or dissatisfaction.';
    default: return '';
  }
}

