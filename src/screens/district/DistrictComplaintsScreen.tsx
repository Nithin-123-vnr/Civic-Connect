import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Modal } from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { ComplaintJourney } from '@/components/common/ComplaintJourney';
import { BeforeAfterEvidence } from '@/components/common/BeforeAfterEvidence';
import { GovernmentActionChain } from '@/components/common/GovernmentActionChain';
import { SLACard } from '@/components/common/SLACard';
import { ResolutionEvidenceUploader } from '@/components/common/ResolutionEvidenceUploader';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { getComplaints, updateComplaintStatus, assignComplaint, escalateComplaint, subscribeToComplaints } from '@/lib/complaintService';
import { getEligibleAssignmentPersonnel, getDepartmentForCategory, type DepartmentalPersonnel } from '@/lib/departmentService';
import { getStatusSemanticDescription, getValidNextStatuses, getStatusDisplayName } from '@/lib/statusService';
import type { Complaint, ComplaintStatus, ComplaintPriority } from '@/types';

export function DistrictComplaintsScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/district' },
    { icon: 'assignment', label: t('complaints'), active: true, href: '/district/complaints' },
    { icon: 'warning', label: t('escalations'), href: '/district/escalations' },
    { icon: 'map', label: t('mapView'), href: '/district/map' },
    { icon: 'analytics', label: t('analytics'), href: '/district/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/district/notifications' },
    { icon: 'person', label: t('profile'), href: '/district/profile' },
  ];

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [eligiblePersonnel, setEligiblePersonnel] = useState<DepartmentalPersonnel[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMandal, setSelectedMandal] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'all'>('all');
  const [search, setSearch] = useState('');

  // Modal state
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState<'assign' | 'status' | 'escalate' | 'inspect' | null>(null);
  const [selectedOfficerUid, setSelectedOfficerUid] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('in_progress');
  const [actionNote, setActionNote] = useState('');
  const [uploadedResolutionUrls, setUploadedResolutionUrls] = useState<string[]>([]);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadComplaints();
    const unsubscribe = subscribeToComplaints(() => {
      loadComplaints();
    });
    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (activeComplaint && (actionType === 'assign' || actionType === 'inspect')) {
      loadPersonnelForComplaint(activeComplaint);
    }
  }, [activeComplaint, actionType]);

  async function loadPersonnelForComplaint(complaint: Complaint) {
    setLoadingPersonnel(true);
    try {
      const personnel = await getEligibleAssignmentPersonnel({
        category: complaint.category,
        districtName: user?.territory?.district || complaint.districtName,
        mandalName: complaint.mandalName,
        officerRole: 'district_officer',
      });
      setEligiblePersonnel(personnel);
      if (personnel.length > 0) {
        const currentAssigned = personnel.find(p => p.id === complaint.assignedTo);
        setSelectedOfficerUid(currentAssigned ? currentAssigned.id : personnel[0].id);
      } else {
        setSelectedOfficerUid('');
      }
    } catch (err) {
      console.error('Failed to load eligible personnel:', err);
    } finally {
      setLoadingPersonnel(false);
    }
  }

  // Deep-link query param check
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && complaints.length > 0) {
      const match = complaints.find(c => c.referenceId === refParam || c.id === refParam);
      if (match) {
        setActiveComplaint(match);
        setActionType('inspect');
      }
    }
  }, [searchParams, complaints]);

  async function loadComplaints() {
    setLoading(true);
    const filter = { districtName: user?.territory?.district };
    const list = await getComplaints(filter);
    setComplaints(list);
    setLoading(false);
  }

  const mandals: string[] = Array.from(new Set(complaints.map((c: Complaint) => c.mandalName))).filter(Boolean) as string[];

  const filtered = complaints.filter(c => {
    if (selectedMandal !== 'all' && c.mandalName !== selectedMandal) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const match =
        c.title.toLowerCase().includes(s) ||
        c.referenceId.toLowerCase().includes(s) ||
        c.areaName.toLowerCase().includes(s) ||
        c.mandalName.toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  const handleExecuteAction = async () => {
    if (!activeComplaint || !user) return;
    setActionError(null);
    setActionSuccess(null);
    setSubmittingAction(true);

    try {
      if (actionType === 'assign') {
        const personnel = eligiblePersonnel.find(p => p.id === selectedOfficerUid);
        if (!personnel) {
          throw new Error('Unable to assign: Selected departmental officer is invalid or unavailable.');
        }

        await assignComplaint(
          activeComplaint.id,
          personnel.id,
          personnel.fullName,
          {
            uid: user.uid,
            fullName: user.fullName || 'District Collector',
            role: user.role,
          },
          actionNote,
          personnel.department,
          personnel.designation
        );
        setActionSuccess(`Case ${activeComplaint.referenceId} assigned to ${personnel.fullName} (${personnel.designation} • ${personnel.department}).`);
      } else if (actionType === 'status') {
        await updateComplaintStatus(
          activeComplaint.id,
          targetStatus,
          actionNote || `District status update to ${targetStatus}`,
          {
            uid: user.uid,
            fullName: user.fullName || 'District Collector',
            role: user.role,
          },
          targetStatus === 'resolved' ? uploadedResolutionUrls : undefined
        );
        setActionSuccess(`Case ${activeComplaint.referenceId} transitioned to "${targetStatus.toUpperCase()}".`);
      } else if (actionType === 'escalate') {
        await escalateComplaint(
          activeComplaint.id,
          actionNote || 'District escalation to State Secretariat for apex intervention.',
          {
            uid: user.uid,
            fullName: user.fullName || 'District Collector',
            role: user.role,
          }
        );
        setActionSuccess(`Case ${activeComplaint.referenceId} escalated to State Secretariat.`);
      }

      await loadComplaints();
      setActiveComplaint(null);
      setActionType(null);
      setActionNote('');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'Action failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <DashboardLayout
      title="District Grievances Repository"
      subtitle={`${user?.territory?.district || 'Hyderabad'} District Collectorate · Grievances Across All Mandals`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'District Officer'}
      userRole="District Officer"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Button variant="primary" size="sm" icon="refresh" onClick={loadComplaints}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Success Banner */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between gap-3 text-xs font-bold shadow-sm animate-slide-down">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" size={18} className="text-emerald-600 animate-success-pop" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-current opacity-70 hover:opacity-100">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {actionError && !activeComplaint && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center justify-between gap-3 text-xs font-bold shadow-sm animate-slide-down">
            <div className="flex items-center gap-2">
              <Icon name="error" size={18} className="text-rose-600" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-current opacity-70 hover:opacity-100">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Icon name="search" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search across all mandals by ID, title, locality..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMandal}
              onChange={e => setSelectedMandal(e.target.value)}
              className="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Mandals ({complaints.length})</option>
              {mandals.map(m => (
                <option key={m} value={m}>{m} Mandal</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="reopened">Reopened</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          {loading ? (
            <div className="p-8">
              <LoadingState />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState icon="search_off" title="No matching grievances" description="Try selecting a different mandal or search filter." />
            </div>
          ) : (
            <div className="table-touch-scroll">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-5 py-3.5">Ref ID</th>
                    <th className="px-4 py-3.5">Title & Area</th>
                    <th className="px-4 py-3.5">Mandal</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Assigned Officer</th>
                    <th className="px-5 py-3.5 text-right">District Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-primary whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveComplaint(c);
                            setActionType('inspect');
                          }}
                          className="hover:underline text-left cursor-pointer"
                        >
                          {c.referenceId}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-semibold text-sm sm:text-base text-on-surface truncate">{c.title}</p>
                        <p className="text-on-surface-variant text-xs truncate mt-0.5">{c.areaName}</p>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-sm text-on-surface">
                        {c.mandalName}
                      </td>
                      <td className="px-4 py-3.5 capitalize font-medium text-sm text-on-surface">
                        {c.category}
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={c.status} />
                          {c.citizenRating && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold">
                              ★ {c.citizenRating}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant text-sm">
                        {c.assignedToName || <span className="text-amber-700 italic text-xs">Unassigned</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {c.status !== 'closed' && c.status !== 'rejected' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setActionError(null);
                                  setActiveComplaint(c);
                                  setActionType('assign');
                                }}
                              >
                                Assign
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const nextOptions = getValidNextStatuses(c.status, user?.role);
                                  if (nextOptions.length === 0) {
                                    setActionError(`Case ${c.referenceId} is ${c.status} and cannot be transitioned.`);
                                    return;
                                  }
                                  setTargetStatus(nextOptions[0]);
                                  setActionError(null);
                                  setActiveComplaint(c);
                                  setActionType('status');
                                }}
                              >
                                Update
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Inspect Grievance"
                            onClick={() => {
                              setActionError(null);
                              setActiveComplaint(c);
                              setActionType('inspect');
                            }}
                          >
                            <Icon name="visibility" size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DISTRICT ACTION MODAL (Portaled & Centered) */}
      {activeComplaint && actionType && (
        <Modal
          isOpen={Boolean(activeComplaint && actionType)}
          onClose={() => {
            setActiveComplaint(null);
            setActionType(null);
            setActionError(null);
          }}
          maxWidth="lg"
          title={
            actionType === 'assign'
              ? 'Assign District Officer / Department'
              : actionType === 'status'
              ? 'District Grievance Status Action'
              : actionType === 'escalate'
              ? 'Escalate to State Secretariat'
              : 'District Case Audit & Inspection'
          }
          subtitle={<span className="font-mono text-sm font-bold text-primary">{activeComplaint.referenceId}</span>}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setActiveComplaint(null);
                  setActionType(null);
                  setActionError(null);
                }}
                disabled={submittingAction}
              >
                {actionType === 'inspect' ? 'Close Inspection' : 'Cancel'}
              </Button>
              {actionType !== 'inspect' && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleExecuteAction}
                  isLoading={submittingAction}
                  disabled={submittingAction || (actionType === 'assign' && (eligiblePersonnel.length === 0 || !selectedOfficerUid))}
                >
                  {actionType === 'assign' && 'Confirm Field Dispatch'}
                  {actionType === 'status' && 'Apply Status Update'}
                </Button>
              )}
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Error Message */}
            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <Icon name="error" size={18} />
                <span>{actionError}</span>
              </div>
            )}

            {/* ASSIGN */}
            {actionType === 'assign' && (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-xs">Administrative Handler:</span>
                    <span className="font-bold text-on-surface">
                      {user?.fullName || 'District Collector'} (District Grievance Officer • {user?.territory?.district || activeComplaint.districtName})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-xs">Responsible Department:</span>
                    <span className="font-bold text-primary">
                      {getDepartmentForCategory(activeComplaint.category).name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex justify-between items-center">
                    <span>SELECT RESPONSIBLE DEPARTMENT OFFICER / FIELD PERSONNEL *</span>
                    <span className="text-xs text-on-surface-variant normal-case font-normal">
                      Dept: <strong className="capitalize">{activeComplaint.category}</strong>
                    </span>
                  </label>

                  {loadingPersonnel ? (
                    <div className="h-11 px-3 rounded-xl border border-outline-variant bg-surface-container-low flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading authorized department engineers for {activeComplaint.districtName} District...</span>
                    </div>
                  ) : eligiblePersonnel.length === 0 ? (
                    <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm">
                      <p className="font-bold">No Authorized Field Personnel Found</p>
                      <p className="text-xs mt-0.5">
                        No official personnel roster found for {getDepartmentForCategory(activeComplaint.category).name} in {activeComplaint.districtName} District.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedOfficerUid}
                      onChange={e => setSelectedOfficerUid(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                    >
                      {eligiblePersonnel.some(p => p.level === 'district') && (
                        <optgroup label={`District Executive Engineers (${activeComplaint.districtName} District)`}>
                          {eligiblePersonnel
                            .filter(p => p.level === 'district')
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} — {p.designation} • {p.department} (District HQ)
                              </option>
                            ))}
                        </optgroup>
                      )}
                      {eligiblePersonnel.some(p => p.level === 'mandal') && (
                        <optgroup label={`Mandal Field Officers (${activeComplaint.mandalName} Mandal)`}>
                          {eligiblePersonnel
                            .filter(p => p.level === 'mandal')
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.fullName} — {p.designation} • {p.department} ({p.mandalName})
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                  )}
                  <p className="text-xs text-on-surface-variant">
                    District Officers can direct local mandal field personnel or dispatch district-level executive engineers.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Executive Directive Note
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    placeholder="Enter district directive, priority instructions, or expected resolution timeline..."
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm text-on-surface bg-surface focus:outline-none focus:border-primary resize-none font-medium"
                  />
                </div>
              </div>
            )}

            {/* STATUS UPDATE */}
            {actionType === 'status' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Select Target Lifecycle State *
                  </label>
                  <select
                    value={targetStatus}
                    onChange={e => setTargetStatus(e.target.value as any)}
                    className="h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {getValidNextStatuses(activeComplaint.status, user?.role).map(st => (
                      <option key={st} value={st}>
                        {getStatusDisplayName(st)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-on-surface-variant">
                    {getStatusSemanticDescription(targetStatus)}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Executive Action Note & Audit Trail *
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    placeholder="Provide detailed description of resolution or directive..."
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm text-on-surface bg-surface focus:outline-none focus:border-primary resize-none font-medium"
                  />
                </div>

                {targetStatus === 'resolved' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-300">
                    <ResolutionEvidenceUploader
                      complaintRef={activeComplaint.referenceId}
                      uploadedUrls={uploadedResolutionUrls}
                      onUploaded={url => setUploadedResolutionUrls(prev => [...prev, url])}
                      onRemoveUrl={url => setUploadedResolutionUrls(prev => prev.filter(u => u !== url))}
                    />
                  </div>
                )}
              </div>
            )}

            {/* INSPECT TIMELINE */}
            {actionType === 'inspect' && (
              <div className="flex flex-col gap-5 text-xs">
                {/* SLA Status Card */}
                {activeComplaint.status !== 'closed' && (
                  <SLACard
                    createdAt={activeComplaint.createdAt}
                    priority={activeComplaint.priority}
                    escalationLevel={activeComplaint.escalationLevel}
                  />
                )}

                {/* Complaint Journey */}
                <ComplaintJourney complaint={activeComplaint} />

                {/* Before / After Evidence */}
                <BeforeAfterEvidence
                  beforePhotos={activeComplaint.photoUrls}
                  afterPhotos={activeComplaint.resolutionPhotoUrls}
                />

                {/* Government Action Chain */}
                <GovernmentActionChain complaint={activeComplaint} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
