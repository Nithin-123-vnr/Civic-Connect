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
import { AssignOfficerModal } from '@/components/common/AssignOfficerModal';
import { getComplaints, updateComplaintStatus, subscribeToComplaints } from '@/lib/complaintService';
import { getStatusSemanticDescription, getValidNextStatuses, getStatusDisplayName } from '@/lib/statusService';
import { TELANGANA_DISTRICTS } from '@/data/jurisdictions/telanganaData';
import type { Complaint, ComplaintStatus } from '@/types';

export function StateEscalationsScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/state' },
    { icon: 'assignment', label: t('complaints'), href: '/state/complaints' },
    { icon: 'warning', label: t('escalations'), active: true, href: '/state/escalations' },
    { icon: 'group', label: t('userDirectory'), href: '/state/users' },
    { icon: 'map', label: t('mapView'), href: '/state/map' },
    { icon: 'analytics', label: t('analytics'), href: '/state/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/state/notifications' },
    { icon: 'person', label: t('profile'), href: '/state/profile' },
  ];

  const [escalations, setEscalations] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>('resolved');
  const [statusNote, setStatusNote] = useState('');
  const [uploadedResolutionUrls, setUploadedResolutionUrls] = useState<string[]>([]);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToComplaints(() => {
      load();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam && escalations.length > 0) {
      const match = escalations.find(c => c.referenceId === refParam || c.id === refParam);
      if (match) setSelectedCase(match);
    }
  }, [searchParams, escalations]);

  async function load() {
    setLoading(true);
    const data = await getComplaints({ isEscalated: true });
    setEscalations(data);
    setLoading(false);
  }

  const sortedDistricts = [...TELANGANA_DISTRICTS].sort((a, b) => a.name.localeCompare(b.name));

  const filtered = escalations.filter(c => {
    if (selectedDistrict !== 'all' && c.districtName.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      return (
        c.title.toLowerCase().includes(s) ||
        c.referenceId.toLowerCase().includes(s) ||
        c.districtName.toLowerCase().includes(s) ||
        c.mandalName.toLowerCase().includes(s) ||
        c.areaName.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleStateStatusUpdate = async () => {
    if (!selectedCase || !user) return;
    setSubmittingStatus(true);
    try {
      const updated = await updateComplaintStatus(
        selectedCase.id,
        targetStatus,
        statusNote.trim() ? `State Secretariat Directive: ${statusNote.trim()}` : 'Secretariat escalation order executed',
        {
          uid: user.uid,
          fullName: user.fullName || 'State Admin',
          role: 'state_admin',
        },
        targetStatus === 'resolved' ? uploadedResolutionUrls : undefined
      );
      setToastMsg({ type: 'success', text: `Escalated case ${selectedCase.referenceId} updated to ${targetStatus.toUpperCase()} successfully.` });
      setSelectedCase(updated);
      setEscalations(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setStatusNote('');
      setUploadedResolutionUrls([]);
    } catch (err: any) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to update escalation status.' });
    } finally {
      setSubmittingStatus(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  return (
    <DashboardLayout
      title="State High-Level Escalations Board"
      subtitle="Tier 2 statewide critical grievances escalated to Secretariat"
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'State Admin'}
      userRole="State Admin"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Button variant="primary" size="sm" icon="refresh" onClick={load}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Toast Notification */}
        {toastMsg && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold shadow-sm animate-slide-down ${
              toastMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name={toastMsg.type === 'success' ? 'check_circle' : 'error'} size={18} className={toastMsg.type === 'success' ? 'animate-success-pop text-emerald-600' : 'text-rose-600'} />
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-current opacity-70 hover:opacity-100">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* Filter Toolbar with District-Wise Control */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Icon name="search" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search escalations by ID, District, Mandal, or Title..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface text-xs font-medium text-on-surface focus:outline-none focus:border-primary shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-on-surface whitespace-nowrap">District Control:</label>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary shadow-sm cursor-pointer"
              >
                <option value="all">All Telangana Districts (33)</option>
                {sortedDistricts.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs sm:text-sm text-on-surface-variant font-semibold px-3.5 py-2 rounded-xl bg-surface-container/60 border border-outline-variant/40 whitespace-nowrap">
              Active Escalations: <strong>{filtered.length}</strong>
            </span>
          </div>
        </div>

        {/* Escalations Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          {loading ? (
            <div className="p-8">
              <LoadingState />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="check_circle"
                title={selectedDistrict !== 'all' ? `Zero Escalations for ${selectedDistrict}` : "Zero Tier 2 Escalations"}
                description={selectedDistrict !== 'all' ? `All grievances in ${selectedDistrict} District are performing within statutory SLA limits.` : "All districts are performing within statutory response limits."}
              />
            </div>
          ) : (
            <div className="table-touch-scroll">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="px-5 py-3.5">Ref ID</th>
                    <th className="px-4 py-3.5">Title</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5">Mandal</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Tier</th>
                    <th className="px-4 py-3.5">Assigned Officer</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-error whitespace-nowrap">
                        <button onClick={() => setSelectedCase(c)} className="hover:underline cursor-pointer">
                          {c.referenceId}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-sm sm:text-base text-on-surface max-w-xs truncate">
                        {c.title}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-sm text-on-surface">
                        {c.districtName}
                      </td>
                      <td className="px-4 py-3.5 text-on-surface-variant text-sm">
                        {c.mandalName}
                      </td>
                      <td className="px-4 py-3.5">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error font-bold text-xs">
                          Tier {c.escalationLevel || 2}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {c.assignedToName ? (
                          <span className="font-semibold text-on-surface text-xs sm:text-sm flex items-center gap-1.5">
                            <Icon name="person" size={15} className="text-primary" />
                            {c.assignedToName}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/60 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Audit / Inspect Escalation"
                            onClick={() => setSelectedCase(c)}
                          >
                            <Icon name="visibility" size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Assign to District/Mandal Officer"
                            className="text-primary font-bold hover:bg-primary-container/20"
                            onClick={() => setAssignTarget(c)}
                          >
                            <Icon name="person_add" size={18} />
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

      {/* STATE ESCALATION AUDIT MODAL (Portaled & Centered) */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          maxWidth="xl"
          title="Secretariat Escalation Audit"
          subtitle={
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-error">{selectedCase.referenceId}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-error-container text-error font-bold text-xs uppercase">
                Tier {selectedCase.escalationLevel || 2} Secretariat Escalation
              </span>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="primary"
                size="md"
                icon="supervisor_account"
                onClick={() => {
                  const target = selectedCase;
                  setSelectedCase(null);
                  setAssignTarget(target);
                }}
              >
                {selectedCase.assignedTo ? 'Reassign Officer' : 'Assign Officer'}
              </Button>
              <Button variant="outline" size="md" onClick={() => setSelectedCase(null)}>
                Close Audit
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Core Info */}
            <div className="p-4.5 rounded-2xl bg-error-container/15 border border-error/30 text-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-on-surface text-base font-bold">{selectedCase.title}</strong>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={selectedCase.priority} />
                  <StatusBadge status={selectedCase.status} />
                </div>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm">{selectedCase.description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-on-surface-variant pt-2.5 border-t border-outline-variant/40">
                <div>
                  <span className="text-on-surface-variant/70 text-xs">District:</span>
                  <p className="font-bold text-on-surface text-xs sm:text-sm">{selectedCase.districtName}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 text-xs">Mandal:</span>
                  <p className="font-bold text-on-surface text-xs sm:text-sm">{selectedCase.mandalName}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 text-xs">Area / Landmark:</span>
                  <p className="font-bold text-on-surface text-xs sm:text-sm">{selectedCase.areaName || '—'}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 text-xs">Category:</span>
                  <p className="font-bold capitalize text-on-surface text-xs sm:text-sm">{selectedCase.category}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 text-xs">Citizen Submitter:</span>
                  <p className="font-bold text-on-surface text-xs sm:text-sm">{selectedCase.citizenName}</p>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 text-xs">Assigned Officer:</span>
                  <p className="font-bold text-primary text-xs sm:text-sm">{selectedCase.assignedToName || 'Unassigned'}</p>
                </div>
              </div>

              {selectedCase.location && (
                <div className="mt-1 pt-2 border-t border-outline-variant/40 text-xs text-on-surface-variant flex items-center justify-between">
                  <span>Address: <strong className="text-on-surface">{selectedCase.location.address || `${selectedCase.areaName}, ${selectedCase.mandalName}`}</strong></span>
                  <span className="font-mono text-xs">({selectedCase.location.lat.toFixed(4)}, {selectedCase.location.lng.toFixed(4)})</span>
                </div>
              )}
            </div>

            {/* SLA Status Card */}
            {selectedCase.status !== 'closed' && (
              <SLACard
                createdAt={selectedCase.createdAt}
                priority={selectedCase.priority}
                escalationLevel={selectedCase.escalationLevel}
              />
            )}

            {/* Complaint Journey */}
            <ComplaintJourney complaint={selectedCase} />

            {/* Before / After Resolution Evidence */}
            <BeforeAfterEvidence
              beforePhotos={selectedCase.photoUrls}
              afterPhotos={selectedCase.resolutionPhotoUrls}
            />

            {/* Government Action Chain */}
            <GovernmentActionChain complaint={selectedCase} />

            {/* State Administrative Lifecycle Action */}
            {selectedCase.status !== 'closed' && selectedCase.status !== 'rejected' && (
              <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/60 flex flex-col gap-3">
                <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="swap_horiz" size={16} className="text-primary" />
                  State Escalation Directive & Lifecycle Action
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex-1 w-full">
                      <select
                        value={targetStatus}
                        onChange={e => setTargetStatus(e.target.value as any)}
                        className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                      >
                        {getValidNextStatuses(selectedCase.status, 'state_admin').map(st => (
                          <option key={st} value={st}>
                            {getStatusDisplayName(st)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {getStatusSemanticDescription(targetStatus)}
                      </p>
                    </div>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="State escalation order / directive..."
                      className="flex-1 w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:border-primary font-medium"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleStateStatusUpdate}
                      isLoading={submittingStatus}
                      className="h-10 px-4 whitespace-nowrap"
                    >
                      Update Status
                    </Button>
                  </div>

                  {targetStatus === 'resolved' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-300">
                      <ResolutionEvidenceUploader
                        complaintRef={selectedCase.referenceId}
                        uploadedUrls={uploadedResolutionUrls}
                        onUploaded={url => setUploadedResolutionUrls(prev => [...prev, url])}
                        onRemoveUrl={url => setUploadedResolutionUrls(prev => prev.filter(u => u !== url))}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* OFFICER ASSIGNMENT MODAL */}
      <AssignOfficerModal
        isOpen={!!assignTarget}
        complaint={assignTarget}
        assigner={{
          uid: user?.uid || '',
          fullName: user?.fullName || 'State Administrator',
          role: 'state_admin',
        }}
        onClose={() => setAssignTarget(null)}
        onSuccess={(updated, msg) => {
          setToastMsg({ type: 'success', text: msg });
          setEscalations(prev => prev.map(c => (c.id === updated.id ? updated : c)));
          setTimeout(() => setToastMsg(null), 5000);
        }}
      />
    </DashboardLayout>
  );
}

