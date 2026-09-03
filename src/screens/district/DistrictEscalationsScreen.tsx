import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Modal } from '@/components/common/Modal';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ComplaintJourney } from '@/components/common/ComplaintJourney';
import { BeforeAfterEvidence } from '@/components/common/BeforeAfterEvidence';
import { GovernmentActionChain } from '@/components/common/GovernmentActionChain';
import { SLACard } from '@/components/common/SLACard';
import { ResolutionEvidenceUploader } from '@/components/common/ResolutionEvidenceUploader';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { getComplaints, updateComplaintStatus, assignComplaint } from '@/lib/complaintService';
import { getEligibleAssignmentPersonnel, getDepartmentForCategory, type DepartmentalPersonnel } from '@/lib/departmentService';
import { getStatusSemanticDescription, getValidNextStatuses, getStatusDisplayName } from '@/lib/statusService';
import type { Complaint, ComplaintStatus } from '@/types';

export function DistrictEscalationsScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/district' },
    { icon: 'assignment', label: t('complaints'), href: '/district/complaints' },
    { icon: 'warning', label: t('escalations'), active: true, href: '/district/escalations' },
    { icon: 'map', label: t('mapView'), href: '/district/map' },
    { icon: 'analytics', label: t('analytics'), href: '/district/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/district/notifications' },
    { icon: 'person', label: t('profile'), href: '/district/profile' },
  ];

  const [escalations, setEscalations] = useState<Complaint[]>([]);
  const [eligiblePersonnel, setEligiblePersonnel] = useState<DepartmentalPersonnel[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
  const [actionMode, setActionMode] = useState<'assign' | 'status' | 'inspect'>('assign');
  const [selectedOfficerUid, setSelectedOfficerUid] = useState<string>('');
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('in_progress');
  const [actionNote, setActionNote] = useState('');
  const [uploadedResolutionUrls, setUploadedResolutionUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadEscalations();
  }, [user]);

  useEffect(() => {
    if (selectedCase && (actionMode === 'assign' || actionMode === 'inspect')) {
      loadPersonnelForCase(selectedCase);
    }
  }, [selectedCase, actionMode]);

  async function loadPersonnelForCase(complaint: Complaint) {
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
      console.error('Failed to load eligible personnel for escalation:', err);
    } finally {
      setLoadingPersonnel(false);
    }
  }

  // Deep-link query param check (?ref=CC-7890)
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && escalations.length > 0) {
      const match = escalations.find(c => c.referenceId === refParam || c.id === refParam);
      if (match) {
        setSelectedCase(match);
        setActionMode('inspect');
      }
    }
  }, [searchParams, escalations]);

  async function loadEscalations() {
    setLoading(true);
    const filter = {
      districtName: user?.territory?.district,
      isEscalated: true,
    };
    const list = await getComplaints(filter);
    setEscalations(list);
    setLoading(false);
  }

  const handleExecuteDistrictAction = async () => {
    if (!selectedCase || !user) return;
    setActionError(null);
    setActionSuccess(null);
    setSubmitting(true);

    try {
      if (actionMode === 'assign') {
        const personnel = eligiblePersonnel.find(p => p.id === selectedOfficerUid);
        if (!personnel) {
          throw new Error('Unable to assign: Selected departmental officer is invalid or unavailable.');
        }

        await assignComplaint(
          selectedCase.id,
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
        setActionSuccess(`Escalated case ${selectedCase.referenceId} dispatched to ${personnel.fullName} (${personnel.designation} • ${personnel.department}).`);
      } else if (actionMode === 'status') {
        if (!actionNote.trim()) {
          throw new Error('Please provide an executive action rationale note.');
        }

        await updateComplaintStatus(
          selectedCase.id,
          targetStatus,
          `District Executive Order: ${actionNote}`,
          {
            uid: user.uid,
            fullName: user.fullName || 'District Collector',
            role: user.role,
          },
          targetStatus === 'resolved' ? uploadedResolutionUrls : undefined
        );
        setActionSuccess(`Case ${selectedCase.referenceId} transitioned to "${targetStatus.toUpperCase()}".`);
      }

      await loadEscalations();
      setSelectedCase(null);
      setActionNote('');
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'District action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="District Escalations Cell"
      subtitle={`${user?.territory?.district || 'Hyderabad'} District Collectorate · Tier-1 Escalation Oversight`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'District Officer'}
      userRole="District Officer"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Button variant="primary" size="sm" icon="refresh" onClick={loadEscalations}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Success Alert */}
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

        {/* Escalation Warning Banner */}
        <div className="p-4.5 rounded-2xl bg-error-container/40 border border-error/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center">
              <Icon name="warning" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-error">Tier-1 Collectorate Escalations</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Grievances requiring inter-mandal coordination, high-tier department assignment, or executive resolution approval.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-error text-on-error font-bold text-xs sm:text-sm shadow-sm">
            {escalations.length} Active Escalations
          </span>
        </div>

        {/* Escalations Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          {loading ? (
            <div className="p-8">
              <LoadingState />
            </div>
          ) : escalations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="check_circle"
                title="Zero Pending Escalations"
                description="All mandal grievances in Hyderabad District are currently within SLA limits."
              />
            </div>
          ) : (
            <div className="table-touch-scroll">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-5 py-3.5">Ref ID</th>
                    <th className="px-4 py-3.5">Title & Mandal</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Escalation Tier</th>
                    <th className="px-5 py-3.5 text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {escalations.map(c => (
                    <tr key={c.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-error whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setActionMode('inspect');
                          }}
                          className="hover:underline text-left cursor-pointer"
                        >
                          {c.referenceId}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-semibold text-sm sm:text-base text-on-surface truncate">{c.title}</p>
                        <p className="text-on-surface-variant text-xs truncate mt-0.5">
                          Mandal: <strong className="text-on-surface">{c.mandalName}</strong> · Area: {c.areaName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 capitalize font-medium text-sm text-on-surface">
                        {c.category}
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error font-bold text-xs">
                          Tier {c.escalationLevel || 1} (District)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {c.status !== 'closed' && c.status !== 'rejected' && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-primary text-on-primary"
                                onClick={() => {
                                  setSelectedCase(c);
                                  setActionMode('assign');
                                  setActionError(null);
                                }}
                              >
                                Assign Officer
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
                                  setSelectedCase(c);
                                  setActionMode('status');
                                  setActionError(null);
                                }}
                              >
                                Take Action
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Inspect Case"
                            onClick={() => {
                              setSelectedCase(c);
                              setActionMode('inspect');
                              setActionError(null);
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

      {/* DISTRICT EXECUTIVE INTERVENTION MODAL (Portaled & Centered) */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => {
            setSelectedCase(null);
            setActionError(null);
          }}
          maxWidth="lg"
          title="District Executive Action Cell"
          subtitle={<span className="font-mono text-xs font-bold text-error">{selectedCase.referenceId}</span>}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedCase(null);
                  setActionError(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              {actionMode !== 'inspect' && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleExecuteDistrictAction}
                  isLoading={submitting}
                  disabled={submitting || (actionMode === 'assign' && (eligiblePersonnel.length === 0 || !selectedOfficerUid))}
                  className="bg-primary text-on-primary"
                >
                  {actionMode === 'assign' && 'Confirm Field Dispatch'}
                  {actionMode === 'status' && 'Apply District Order'}
                </Button>
              )}
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-2">
              <button
                type="button"
                onClick={() => setActionMode('assign')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  actionMode === 'assign'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                1. Assign Department / Officer
              </button>
              <button
                type="button"
                onClick={() => setActionMode('status')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  actionMode === 'status'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                2. District Action & Resolution
              </button>
              <button
                type="button"
                onClick={() => setActionMode('inspect')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  actionMode === 'inspect'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                3. Audit History
              </button>
            </div>

            {/* Error Message */}
            {actionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <Icon name="error" size={18} />
                <span>{actionError}</span>
              </div>
            )}

            {/* ASSIGN DEPARTMENT / ENGINEER */}
            {actionMode === 'assign' && (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-xs">Administrative Handler:</span>
                    <span className="font-bold text-on-surface">
                      {user?.fullName || 'District Collector'} (District Collectorate • {user?.territory?.district || selectedCase.districtName})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-xs">Responsible Department:</span>
                    <span className="font-bold text-primary">
                      {getDepartmentForCategory(selectedCase.category).name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex justify-between items-center">
                    <span>SELECT RESPONSIBLE DEPARTMENT OFFICER / FIELD PERSONNEL *</span>
                    <span className="text-xs text-on-surface-variant normal-case font-normal">
                      Dept: <strong className="capitalize">{selectedCase.category}</strong>
                    </span>
                  </label>

                  {loadingPersonnel ? (
                    <div className="h-11 px-3 rounded-xl border border-outline-variant bg-surface-container-low flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading authorized field personnel for {selectedCase.districtName}...</span>
                    </div>
                  ) : eligiblePersonnel.length === 0 ? (
                    <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm">
                      <p className="font-bold">No Authorized Field Personnel Found</p>
                      <p className="text-xs mt-0.5">
                        No official personnel roster found for {getDepartmentForCategory(selectedCase.category).name} in {selectedCase.districtName}.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedOfficerUid}
                      onChange={e => setSelectedOfficerUid(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                    >
                      {eligiblePersonnel.some(p => p.level === 'district') && (
                        <optgroup label={`District Executive Engineers (${selectedCase.districtName} District)`}>
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
                        <optgroup label={`Mandal Field Officers (${selectedCase.mandalName} Mandal)`}>
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
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Collectorate Directive / Speed-up Order
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    placeholder="Enter collectorate directive, deployment instructions, and mandated deadline..."
                    className="w-full p-3 rounded-xl border border-outline-variant text-sm text-on-surface bg-surface focus:outline-none focus:border-primary resize-none font-medium placeholder:text-on-surface-variant/60"
                  />
                </div>
              </div>
            )}

            {/* STATUS / RESOLUTION ACTION */}
            {actionMode === 'status' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Target Lifecycle State *
                  </label>
                  <select
                    value={targetStatus}
                    onChange={e => setTargetStatus(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                  >
                    {getValidNextStatuses(selectedCase.status, user?.role).map((st) => (
                      <option key={st} value={st}>
                        {getStatusDisplayName(st)} — {getStatusSemanticDescription(st)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Collectorate Action Note / Finding Report *
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={e => setActionNote(e.target.value)}
                    placeholder="Document intervention findings, site verification, or closure report..."
                    className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:border-primary resize-none font-medium placeholder:text-on-surface-variant/60"
                  />
                </div>

                {/* Resolution Evidence */}
                {(targetStatus === 'resolved' || targetStatus === 'closed') && (
                  <div className="pt-2 border-t border-outline-variant/60">
                    <ResolutionEvidenceUploader
                      complaintRef={selectedCase.referenceId}
                      uploadedUrls={uploadedResolutionUrls}
                      onUploaded={url => setUploadedResolutionUrls(prev => [...prev, url])}
                      onRemoveUrl={url => setUploadedResolutionUrls(prev => prev.filter(u => u !== url))}
                    />
                  </div>
                )}
              </div>
            )}

            {/* AUDIT / INSPECTION */}
            {actionMode === 'inspect' && (
              <div className="flex flex-col gap-4">
                {/* SLA Timer */}
                <SLACard
                  createdAt={selectedCase.createdAt}
                  priority={selectedCase.priority}
                  escalationLevel={selectedCase.escalationLevel}
                />

                {/* Complaint Journey */}
                <ComplaintJourney complaint={selectedCase} />

                {/* Before / After Evidence */}
                {(selectedCase.photoUrls?.length > 0 || (selectedCase.resolutionPhotoUrls && selectedCase.resolutionPhotoUrls.length > 0)) && (
                  <BeforeAfterEvidence
                    beforePhotos={selectedCase.photoUrls || []}
                    afterPhotos={selectedCase.resolutionPhotoUrls || []}
                  />
                )}

                {/* Government Action Chain */}
                <GovernmentActionChain complaint={selectedCase} />
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
