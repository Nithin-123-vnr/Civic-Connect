import { supabase } from './supabase';
import { createNotification } from './notificationService';
import { canTransitionStatus, getStatusDisplayName } from './statusService';
import { INITIAL_COMPLAINTS } from './seedService';
import type { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory, ComplaintUpdate, Role } from '@/types';

export interface ComplaintFilterOptions {
  status?: ComplaintStatus | 'all';
  category?: ComplaintCategory | 'all';
  priority?: ComplaintPriority | 'all';
  search?: string;
  mandalId?: string;
  mandalName?: string;
  districtId?: string;
  districtName?: string;
  citizenId?: string;
  isEscalated?: boolean;
}

export function mapDbToComplaint(row: any): Complaint {
  const updates: ComplaintUpdate[] = (row.complaint_updates || []).map((u: any) => ({
    id: u.id,
    complaintId: u.complaint_id,
    timestamp: u.created_at,
    status: u.status as ComplaintStatus,
    note: u.note,
    updatedBy: u.updated_by,
    updatedByName: u.updated_by_name,
    isPublic: u.is_public ?? true,
  })).sort((a: ComplaintUpdate, b: ComplaintUpdate) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const latVal = row.lat !== null && row.lat !== undefined && row.lat !== '' ? Number(row.lat) : undefined;
  const lngVal = row.lng !== null && row.lng !== undefined && row.lng !== '' ? Number(row.lng) : undefined;

  return {
    id: row.id,
    referenceId: row.reference_id,
    title: row.title,
    description: row.description,
    category: row.category as ComplaintCategory,
    status: row.status as ComplaintStatus,
    priority: row.priority as ComplaintPriority,
    citizenId: row.citizen_id,
    citizenName: row.citizen_name,
    location: {
      lat: latVal as any,
      lng: lngVal as any,
      address: row.address || undefined,
    },
    areaId: row.area_id || `area-${(row.area_name || 'default').toLowerCase().replace(/\s+/g, '-')}`,
    areaName: row.area_name,
    mandalId: row.mandal_id || `mandal-${(row.mandal_name || 'default').toLowerCase().replace(/\s+/g, '-')}`,
    mandalName: row.mandal_name,
    districtId: row.district_id || `dist-${(row.district_name || 'default').toLowerCase().replace(/\s+/g, '-')}`,
    districtName: row.district_name,
    stateId: row.state_id || 'state-telangana',
    photoUrls: Array.isArray(row.photo_urls) ? row.photo_urls : [],
    videoUrls: Array.isArray(row.video_urls) ? row.video_urls : [],
    resolutionPhotoUrls: Array.isArray(row.resolution_photo_urls) ? row.resolution_photo_urls : [],
    assignedTo: row.assigned_to || undefined,
    assignedToName: row.assigned_to_name || undefined,
    assignedDepartment: row.assigned_department || undefined,
    assignedDesignation: row.assigned_designation || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at || undefined,
    closedAt: row.closed_at || undefined,
    citizenConfirmedAt: row.citizen_confirmed_at || undefined,
    citizenConfirmationNote: row.citizen_confirmation_note || undefined,
    escalationLevel: (row.escalation_level ?? 0) as 0 | 1 | 2,
    escalatedAt: row.escalated_at || undefined,
    updates,
    citizenRating: row.citizen_rating || undefined,
    citizenFeedback: row.citizen_feedback || undefined,
  };
}

export async function getComplaints(filters: ComplaintFilterOptions = {}): Promise<Complaint[]> {
  try {
    let query = supabase
      .from('complaints')
      .select('*, complaint_updates (*)')
      .order('created_at', { ascending: false });

    if (filters.citizenId) {
      query = query.eq('citizen_id', filters.citizenId);
    }

    const mandalFilter = filters.mandalName || (filters.mandalId ? filters.mandalId.replace('mandal-', '') : undefined);
    if (mandalFilter && mandalFilter.trim() && mandalFilter.toLowerCase() !== 'all mandals') {
      const m = mandalFilter.trim();
      query = query.or(`mandal_name.ilike.${m},mandal_id.ilike.%${m}%`);
    }

    const districtFilter = filters.districtName || (filters.districtId ? filters.districtId.replace('dist-', '').replace('district-', '') : undefined);
    if (districtFilter && districtFilter.trim() && districtFilter.toLowerCase() !== 'all districts') {
      const d = districtFilter.trim();
      query = query.or(`district_name.ilike.${d},district_id.ilike.%${d}%`);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }
    if (filters.isEscalated !== undefined) {
      if (filters.isEscalated) {
        query = query.or('status.eq.escalated,escalation_level.gt.0');
      } else {
        query = query.neq('status', 'escalated').eq('escalation_level', 0);
      }
    }
    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim();
      query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,reference_id.ilike.%${s}%,area_name.ilike.%${s}%,mandal_name.ilike.%${s}%,district_name.ilike.%${s}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('Supabase getComplaints error, falling back to seed:', error);
      return filterLocalComplaints([...INITIAL_COMPLAINTS], filters);
    }

    return data.map(mapDbToComplaint);
  } catch (err) {
    console.error('Error in getComplaints:', err);
    return filterLocalComplaints([...INITIAL_COMPLAINTS], filters);
  }
}

export function subscribeToComplaints(onUpdate: () => void): () => void {
  const channel = supabase
    .channel('public:complaints:all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

function filterLocalComplaints(list: Complaint[], filters: ComplaintFilterOptions): Complaint[] {
  const mFilter = (filters.mandalName || filters.mandalId || '').replace('mandal-', '').trim().toLowerCase();
  const dFilter = (filters.districtName || filters.districtId || '').replace('dist-', '').replace('district-', '').trim().toLowerCase();

  return list.filter(item => {
    if (filters.citizenId && item.citizenId !== filters.citizenId) return false;
    if (mFilter && mFilter !== 'all mandals' && !item.mandalName.toLowerCase().includes(mFilter) && !item.mandalId.toLowerCase().includes(mFilter)) return false;
    if (dFilter && dFilter !== 'all districts' && !item.districtName.toLowerCase().includes(dFilter) && !item.districtId.toLowerCase().includes(dFilter)) return false;
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.priority && filters.priority !== 'all' && item.priority !== filters.priority) return false;
    if (filters.isEscalated !== undefined) {
      const isItemEsc = item.status === 'escalated' || item.escalationLevel > 0;
      if (filters.isEscalated !== isItemEsc) return false;
    }
    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim().toLowerCase();
      const match =
        item.title.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        item.referenceId.toLowerCase().includes(s) ||
        item.areaName.toLowerCase().includes(s) ||
        item.mandalName.toLowerCase().includes(s) ||
        item.districtName.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });
}

export async function getComplaintById(idOrRef: string): Promise<Complaint | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrRef);
    let query = supabase
      .from('complaints')
      .select('*, complaint_updates (*)');

    if (isUuid) {
      query = query.or(`id.eq.${idOrRef},reference_id.eq.${idOrRef}`);
    } else {
      query = query.eq('reference_id', idOrRef);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const fallback = INITIAL_COMPLAINTS.find(c => c.id === idOrRef || c.referenceId === idOrRef);
      return fallback || null;
    }

    return mapDbToComplaint(data[0]);
  } catch (err) {
    console.error('Error fetching complaint by ID:', err);
    const fallback = INITIAL_COMPLAINTS.find(c => c.id === idOrRef || c.referenceId === idOrRef);
    return fallback || null;
  }
}

export async function createComplaint(data: {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  citizenId: string;
  citizenName: string;
  location: { lat: number; lng: number; address?: string };
  areaName: string;
  mandalName: string;
  districtName: string;
  stateName: string;
  photoUrls?: string[];
}): Promise<Complaint> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authUser = authData?.user;
  if (authError || !authUser) {
    throw new Error('You must be signed in to submit a grievance.');
  }

  const authenticatedCitizenId = authUser.id;
  const citizenDisplayName = (data.citizenName && data.citizenName.trim()) || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Citizen';

  const refNumber = Math.floor(1000 + Math.random() * 9000);
  const referenceId = `CC-${refNumber}`;
  const nowIso = new Date().toISOString();

  const insertPayload = {
    reference_id: referenceId,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    status: 'pending',
    priority: data.priority,
    citizen_id: authenticatedCitizenId,
    citizen_name: citizenDisplayName,
    lat: data.location.lat,
    lng: data.location.lng,
    address: data.location.address || `${data.areaName}, ${data.mandalName}`,
    area_id: `area-${data.areaName.toLowerCase().replace(/\s+/g, '-')}`,
    area_name: data.areaName,
    mandal_id: `mandal-${data.mandalName.toLowerCase().replace(/\s+/g, '-')}`,
    mandal_name: data.mandalName,
    district_id: `dist-${data.districtName.toLowerCase().replace(/\s+/g, '-')}`,
    district_name: data.districtName,
    state_id: `state-${data.stateName.toLowerCase().replace(/\s+/g, '-')}`,
    photo_urls: data.photoUrls || [],
    video_urls: [],
    escalation_level: 0,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const { data: createdRow, error } = await supabase
    .from('complaints')
    .insert(insertPayload)
    .select('*, complaint_updates (*)')
    .single();

  if (error || !createdRow) {
    console.error('Failed to create complaint in Supabase:', error);
    throw new Error(`Submission failed: ${error?.message || 'Unable to register complaint.'}`);
  }

  // Create initial timeline record
  await supabase.from('complaint_updates').insert({
    complaint_id: createdRow.id,
    status: 'pending',
    note: 'Grievance submitted by citizen. Forwarded to Mandal Grievance Cell for inspection.',
    updated_by: authenticatedCitizenId,
    updated_by_name: citizenDisplayName,
    is_public: true,
  });

  // Create notification for citizen
  await createNotification({
    userId: authenticatedCitizenId,
    type: 'new_complaint',
    title: `Complaint Submitted (${referenceId})`,
    body: `Your grievance "${data.title}" has been registered successfully. Tracking Reference ID: ${referenceId}`,
    complaintId: createdRow.id,
    complaintRef: referenceId,
  });

  return (await getComplaintById(createdRow.id)) as Complaint;
}

/**
 * Patch photo_urls on an existing complaint after evidence has been uploaded.
 * Used by the two-phase complaint submission in ReportComplaintWizard.
 */
export async function patchComplaintPhotoUrls(
  complaintId: string,
  photoUrls: string[]
): Promise<void> {
  const { error } = await supabase
    .from('complaints')
    .update({ photo_urls: photoUrls, updated_at: new Date().toISOString() })
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to patch photo_urls:', error);
    // Non-fatal — complaint is already created; log and continue
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  targetStatus: ComplaintStatus,
  note: string,
  user: { uid: string; fullName: string; role: Role },
  resolutionPhotoUrls?: string[]
): Promise<Complaint> {
  const current = await getComplaintById(complaintId);
  if (!current) throw new Error('Complaint not found.');

  if (!canTransitionStatus(current.status, targetStatus, user.role)) {
    throw new Error(`Cannot transition complaint from "${current.status}" to "${targetStatus}" under role "${user.role}".`);
  }

  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status: targetStatus,
    updated_at: nowIso,
  };

  if (targetStatus === 'resolved') {
    updatePayload.resolved_at = nowIso;
    if (resolutionPhotoUrls && resolutionPhotoUrls.length > 0) {
      updatePayload.resolution_photo_urls = resolutionPhotoUrls;
    }
  }
  if (targetStatus === 'closed') {
    updatePayload.closed_at = nowIso;
  }

  const { error } = await supabase
    .from('complaints')
    .update(updatePayload)
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to update complaint status in Supabase:', error);
    throw new Error(`Status update failed: ${error.message || 'Unable to update complaint.'}`);
  }

  // Insert timeline update
  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    status: targetStatus,
    note: note || `Status updated to ${getStatusDisplayName(targetStatus)} by ${user.fullName}`,
    updated_by: user.uid,
    updated_by_name: user.fullName,
    is_public: true,
  });

  // Notify citizen
  await createNotification({
    userId: current.citizenId,
    type: targetStatus === 'resolved' ? 'complaint_resolved' : 'complaint_status_update',
    title: targetStatus === 'resolved' ? `Grievance Resolved — Confirmation Requested (${current.referenceId})` : `Status Update: ${current.referenceId}`,
    body: targetStatus === 'resolved'
      ? `The assigned officer has marked your grievance "${current.title}" as Resolved. Please review the resolution evidence and confirm if the issue has been fixed.`
      : `Your grievance "${current.title}" is now marked as "${getStatusDisplayName(targetStatus)}". ${note ? 'Note: ' + note : ''}`,
    complaintId: current.id,
    complaintRef: current.referenceId,
  });

  return (await getComplaintById(complaintId))!;
}

export async function confirmComplaintResolution(
  complaintId: string,
  citizenUser: { uid: string; fullName: string },
  confirmationNote?: string
): Promise<Complaint> {
  const current = await getComplaintById(complaintId);
  if (!current) throw new Error('Complaint not found.');

  if (current.status !== 'resolved') {
    throw new Error(`Only complaints with status "Resolved" can be confirmed. Current status is "${current.status}".`);
  }

  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'closed',
      closed_at: nowIso,
      citizen_confirmed_at: nowIso,
      citizen_confirmation_note: confirmationNote || 'Citizen confirmed satisfactory resolution.',
      updated_at: nowIso,
    })
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to confirm resolution in Supabase:', error);
    throw new Error(`Confirmation failed: ${error.message || 'Unable to confirm resolution.'}`);
  }

  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    status: 'closed',
    note: confirmationNote?.trim()
      ? `Citizen ${citizenUser.fullName} verified and confirmed satisfactory resolution. Note: "${confirmationNote}". Grievance closed.`
      : `Citizen ${citizenUser.fullName} verified and confirmed satisfactory resolution. Grievance closed.`,
    updated_by: citizenUser.uid,
    updated_by_name: citizenUser.fullName,
    is_public: true,
  });

  // Notify assigned officer if present
  if (current.assignedTo) {
    await createNotification({
      userId: current.assignedTo,
      type: 'complaint_status_update',
      title: `Resolution Confirmed by Citizen (${current.referenceId})`,
      body: `Citizen ${citizenUser.fullName} confirmed satisfactory resolution. Grievance "${current.title}" is now formally Closed.`,
      complaintId: current.id,
      complaintRef: current.referenceId,
    });
  }

  return (await getComplaintById(complaintId))!;
}

export async function assignComplaint(
  complaintId: string,
  officerId: string,
  officerName: string,
  assigner: { uid: string; fullName: string; role: Role },
  actionNote?: string,
  department?: string,
  designation?: string
): Promise<Complaint> {
  const current = await getComplaintById(complaintId);
  if (!current) throw new Error('Complaint not found.');

  // Validate officerId is a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(officerId)) {
    throw new Error('Assignment failed: The selected officer does not have a valid system identifier.');
  }

  const nowIso = new Date().toISOString();
  const targetStatus: ComplaintStatus = 'assigned';

  const updatePayload: Record<string, any> = {
    assigned_to: officerId,
    assigned_to_name: officerName,
    status: targetStatus,
    updated_at: nowIso,
  };

  if (department) updatePayload.assigned_department = department;
  if (designation) updatePayload.assigned_designation = designation;

  const { error } = await supabase
    .from('complaints')
    .update(updatePayload)
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to assign complaint in Supabase:', error);
    throw new Error(`Assignment failed: ${error.message || 'Unable to update complaint record.'}`);
  }

  // Insert timeline entry with rich departmental details
  const deptInfo = designation && department ? `${officerName} (${designation} • ${department})` : officerName;
  const noteText = actionNote?.trim()
    ? `Assigned to ${deptInfo} by ${assigner.fullName} (${assigner.role.replace('_', ' ')}). Instructions: ${actionNote}`
    : `Assigned to ${deptInfo} by ${assigner.fullName} (${assigner.role.replace('_', ' ')}).`;

  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    status: targetStatus,
    note: noteText,
    updated_by: assigner.uid,
    updated_by_name: assigner.fullName,
    is_public: true,
  });

  // Notify assigned officer
  await createNotification({
    userId: officerId,
    type: 'complaint_assigned',
    title: `Grievance Assigned (${current.referenceId})`,
    body: `You have been assigned to handle "${current.title}" in ${current.areaName || current.mandalName}.`,
    complaintId: current.id,
    complaintRef: current.referenceId,
  });

  // Notify citizen that an officer has been assigned
  await createNotification({
    userId: current.citizenId,
    type: 'complaint_assigned',
    title: `Officer Assigned (${current.referenceId})`,
    body: `Officer ${officerName} has been assigned to investigate your grievance "${current.title}".`,
    complaintId: current.id,
    complaintRef: current.referenceId,
  });

  return (await getComplaintById(complaintId))!;
}

export async function submitComplaintFeedback(
  complaintId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  feedbackText: string,
  citizenUser: { uid: string; fullName: string }
): Promise<Complaint> {
  const current = await getComplaintById(complaintId);
  if (!current) throw new Error('Complaint not found.');

  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('complaints')
    .update({
      citizen_rating: rating,
      citizen_feedback: feedbackText,
      updated_at: nowIso,
    })
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to submit feedback in Supabase:', error);
    throw new Error(`Feedback submission failed: ${error.message || 'Unable to submit rating.'}`);
  }

  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    status: current.status,
    note: `Citizen submitted feedback: ${rating}/5 stars. "${feedbackText}"`,
    updated_by: citizenUser.uid,
    updated_by_name: citizenUser.fullName,
    is_public: true,
  });

  // Notify assigned officer or mandal officer if assignedTo exists
  if (current.assignedTo) {
    await createNotification({
      userId: current.assignedTo,
      type: 'complaint_resolved',
      title: `Citizen Feedback Received (${current.referenceId})`,
      body: `Citizen ${citizenUser.fullName} gave ${rating}-star feedback: "${feedbackText}" on ${current.title}`,
      complaintId: current.id,
      complaintRef: current.referenceId,
    });
  }

  return (await getComplaintById(complaintId))!;
}

export async function reopenComplaint(
  complaintId: string,
  reason: string,
  citizenUser: { uid: string; fullName: string }
): Promise<Complaint> {
  const current = await getComplaintById(complaintId);
  if (!current) throw new Error('Complaint not found.');

  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'reopened',
      updated_at: nowIso,
    })
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to reopen complaint in Supabase:', error);
    throw new Error(`Reopen failed: ${error.message || 'Unable to reopen complaint.'}`);
  }

  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    status: 'reopened',
    note: `Grievance reopened by citizen ${citizenUser.fullName}. Dissatisfaction Reason: ${reason}`,
    updated_by: citizenUser.uid,
    updated_by_name: citizenUser.fullName,
    is_public: true,
  });

  if (current.assignedTo) {
    await createNotification({
      userId: current.assignedTo,
      type: 'complaint_status_update',
      title: `Complaint Reopened (${current.referenceId})`,
      body: `Citizen reopened grievance "${current.title}". Reason: ${reason}`,
      complaintId: current.id,
      complaintRef: current.referenceId,
    });
  }

  return (await getComplaintById(complaintId))!;
}

export async function escalateComplaint(
  complaintId: string,
  reason: string,
  escalator: { uid: string; fullName: string; role: Role }
): Promise<Complaint> {
  const current = await getComplaintById(complaintId);
  if (!current) throw new Error('Complaint not found.');

  const nextLevel = (Math.min(2, current.escalationLevel + 1)) as 1 | 2;
  const targetAuthority = nextLevel === 1 ? 'District Officer' : 'State Admin';
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from('complaints')
    .update({
      status: 'escalated',
      escalation_level: nextLevel,
      escalated_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', complaintId);

  if (error) {
    console.error('Failed to escalate complaint in Supabase:', error);
    throw new Error(`Escalation failed: ${error.message || 'Unable to escalate complaint.'}`);
  }

  await supabase.from('complaint_updates').insert({
    complaint_id: complaintId,
    status: 'escalated',
    note: `Grievance escalated to Tier ${nextLevel} (${targetAuthority}) by ${escalator.fullName} (${escalator.role.replace('_', ' ')}). Escalation Reason: ${reason}`,
    updated_by: escalator.uid,
    updated_by_name: escalator.fullName,
    is_public: true,
  });

  // Find and notify District or State officers
  try {
    const targetRole = nextLevel === 1 ? 'district_officer' : 'state_admin';
    const { data: targetOfficers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', targetRole)
      .eq('status', 'active')
      .limit(3);

    if (targetOfficers && targetOfficers.length > 0) {
      for (const off of targetOfficers) {
        await createNotification({
          userId: off.id,
          type: 'complaint_escalated',
          title: `Tier ${nextLevel} Escalation Received (${current.referenceId})`,
          body: `Grievance "${current.title}" in ${current.mandalName} has been escalated to your authority. Reason: ${reason}`,
          complaintId: current.id,
          complaintRef: current.referenceId,
        });
      }
    }
  } catch (notifErr) {
    console.warn('Escalation notification warning:', notifErr);
  }

  return (await getComplaintById(complaintId))!;
}
