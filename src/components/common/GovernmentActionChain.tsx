import { useMemo } from 'react';
import { Icon } from './Icon';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Complaint } from '@/types';

interface GovernmentActionChainProps {
  complaint: Complaint;
}

interface ActionChainNode {
  id: string;
  level: 'citizen' | 'mandal' | 'district' | 'state' | 'resolution';
  title: string;
  designation: string;
  actorName: string;
  jurisdiction: string;
  actionText: string;
  timestamp?: string;
  status: 'completed' | 'in_progress' | 'pending';
  icon: string;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function GovernmentActionChain({ complaint }: GovernmentActionChainProps) {
  const { t } = useLanguage();

  const chainNodes = useMemo<ActionChainNode[]>(() => {
    const nodes: ActionChainNode[] = [];
    const updates = complaint.updates || [];

    // 1. Citizen Submission Node (Always participated)
    nodes.push({
      id: 'citizen-node',
      level: 'citizen',
      title: 'Grievance Registered',
      designation: 'Citizen Submitter',
      actorName: complaint.citizenName || 'Citizen',
      jurisdiction: `${complaint.areaName ? complaint.areaName + ', ' : ''}${complaint.mandalName}`,
      actionText: 'Filed civic defect with location coordinates and details',
      timestamp: complaint.createdAt,
      status: 'completed',
      icon: 'person',
    });

    // 2. Mandal Level Participation
    const mandalUpdate = updates.find(u =>
      u.note.toLowerCase().includes('mandal') ||
      u.updatedByName.toLowerCase().includes('mandal') ||
      u.status === 'assigned' ||
      u.status === 'in_progress'
    );
    const hasMandalParticipation = !!mandalUpdate || complaint.assignedToName || complaint.status !== 'pending';

    if (hasMandalParticipation) {
      const isMandalActive = (complaint.status === 'assigned' || complaint.status === 'in_progress') && complaint.escalationLevel === 0;
      const isMandalDone = complaint.status === 'resolved' || complaint.status === 'closed' || complaint.escalationLevel > 0;

      nodes.push({
        id: 'mandal-node',
        level: 'mandal',
        title: 'Mandal Field Administration',
        designation: 'Mandal Officer / Field Supervisor',
        actorName: complaint.assignedToName || mandalUpdate?.updatedByName || `${complaint.mandalName} Mandal Officer`,
        jurisdiction: `${complaint.mandalName} Mandal (${complaint.districtName})`,
        actionText: mandalUpdate?.note || (
          complaint.status === 'in_progress' ? 'Field inspection & civil works execution underway' :
          complaint.status === 'assigned' ? 'Assigned for inspection and site verification' :
          'Received at Mandal Grievance Cell'
        ),
        timestamp: mandalUpdate?.timestamp || complaint.updatedAt,
        status: isMandalDone ? 'completed' : isMandalActive ? 'in_progress' : 'pending',
        icon: 'location_city',
      });
    }

    // 3. District Level Participation (Only if escalated to Tier 1+, or assigned to District Officer)
    const districtUpdate = updates.find(u =>
      u.note.toLowerCase().includes('district') ||
      u.note.toLowerCase().includes('tier 1') ||
      u.updatedByName.toLowerCase().includes('district')
    );
    const hasDistrictParticipation = complaint.escalationLevel >= 1 || !!districtUpdate;

    if (hasDistrictParticipation) {
      const isDistrictActive = (complaint.status === 'escalated' || complaint.status === 'in_progress') && complaint.escalationLevel === 1;
      const isDistrictDone = complaint.status === 'resolved' || complaint.status === 'closed' || complaint.escalationLevel > 1;

      nodes.push({
        id: 'district-node',
        level: 'district',
        title: 'District Collectorate Intervention',
        designation: 'District Officer / Grievance Cell',
        actorName: districtUpdate?.updatedByName || `${complaint.districtName} District Officer`,
        jurisdiction: `${complaint.districtName} District`,
        actionText: districtUpdate?.note || `Tier-1 SLA escalation reviewed by District Collectorate`,
        timestamp: districtUpdate?.timestamp || complaint.escalatedAt || complaint.updatedAt,
        status: isDistrictDone ? 'completed' : isDistrictActive ? 'in_progress' : 'pending',
        icon: 'domain',
      });
    }

    // 4. State Level Participation (Only if escalated to Tier 2+, or reviewed by State Admin)
    const stateUpdate = updates.find(u =>
      u.note.toLowerCase().includes('state') ||
      u.note.toLowerCase().includes('secretariat') ||
      u.note.toLowerCase().includes('tier 2') ||
      u.updatedByName.toLowerCase().includes('state') ||
      u.updatedByName.toLowerCase().includes('admin')
    );
    const hasStateParticipation = complaint.escalationLevel >= 2 || !!stateUpdate;

    if (hasStateParticipation) {
      const isStateActive = complaint.escalationLevel >= 2 && complaint.status !== 'resolved' && complaint.status !== 'closed';
      const isStateDone = complaint.status === 'resolved' || complaint.status === 'closed';

      nodes.push({
        id: 'state-node',
        level: 'state',
        title: 'State Secretariat Governance',
        designation: 'State Administrator / Apex Cell',
        actorName: stateUpdate?.updatedByName || 'Telangana State Grievance Directorate',
        jurisdiction: 'Government of Telangana (Statewide)',
        actionText: stateUpdate?.note || 'Tier-2 Apex Secretariat directive issued for immediate resolution',
        timestamp: stateUpdate?.timestamp || complaint.escalatedAt || complaint.updatedAt,
        status: isStateDone ? 'completed' : isStateActive ? 'in_progress' : 'pending',
        icon: 'account_balance',
      });
    }

    // 5. Final Resolution / Verification Node (If resolved or closed)
    if (complaint.status === 'resolved' || complaint.status === 'closed') {
      const resolutionUpdate = updates.find(u => u.status === 'resolved' || u.status === 'closed');
      nodes.push({
        id: 'resolution-node',
        level: 'resolution',
        title: complaint.status === 'closed' ? 'Verified & Formally Closed' : 'Resolved — Pending Confirmation',
        designation: complaint.status === 'closed' ? 'Citizen & Municipal Verification' : 'Official Civil Completion',
        actorName: resolutionUpdate?.updatedByName || complaint.assignedToName || 'Jurisdiction Officer',
        jurisdiction: `${complaint.mandalName} (${complaint.districtName})`,
        actionText: complaint.citizenConfirmedAt
          ? `Citizen confirmed rectification on ${formatDate(complaint.citizenConfirmedAt)}. Record archived.`
          : 'Works completed on site. Evidence uploaded for citizen confirmation.',
        timestamp: complaint.closedAt || complaint.resolvedAt || resolutionUpdate?.timestamp,
        status: complaint.status === 'closed' ? 'completed' : 'in_progress',
        icon: complaint.status === 'closed' ? 'verified' : 'task_alt',
      });
    }

    return nodes;
  }, [complaint]);

  return (
    <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 sm:p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-xs">
            <Icon name="account_tree" size={20} />
          </div>
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface">
              {t('governmentActionChain') || 'Government Action Chain'}
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              {t('participatingAuthorities') || 'Official administrative hierarchy actively engaged on this case'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono">
          {chainNodes.length} Tier{chainNodes.length === 1 ? '' : 's'} Engaged
        </span>
      </div>

      {/* Action Chain Flow */}
      <div className="flex flex-col gap-3">
        {chainNodes.map((node, index) => {
          const isLast = index === chainNodes.length - 1;
          const staggerClass = `stagger-${index + 1}`;

          const levelColorMap = {
            citizen: 'bg-amber-100 text-amber-900 border-amber-300',
            mandal: 'bg-blue-100 text-blue-900 border-blue-300',
            district: 'bg-purple-100 text-purple-900 border-purple-300',
            state: 'bg-rose-100 text-rose-900 border-rose-300',
            resolution: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          };

          const iconBgMap = {
            citizen: 'bg-amber-600 text-white',
            mandal: 'bg-blue-600 text-white',
            district: 'bg-purple-600 text-white',
            state: 'bg-rose-600 text-white',
            resolution: 'bg-emerald-600 text-white',
          };

          return (
            <div key={node.id} className="relative flex flex-col animate-slide-up">
              <div
                className={`
                  p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                  ${node.status === 'in_progress' ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30' : 'bg-surface border-outline-variant hover:border-outline'}
                  ${staggerClass}
                `}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${iconBgMap[node.level]}`}>
                    <Icon name={node.icon} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${levelColorMap[node.level]}`}>
                        {node.level.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface">
                        {node.title}
                      </h4>
                      {node.status === 'in_progress' && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface font-semibold truncate">
                      {node.actorName} <span className="text-on-surface-variant font-normal">({node.designation})</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                      {node.actionText}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end shrink-0 text-left sm:text-right border-t sm:border-t-0 border-outline-variant/40 pt-2 sm:pt-0 w-full sm:w-auto">
                  <span className="text-xs font-mono text-on-surface-variant font-medium">
                    {node.jurisdiction}
                  </span>
                  {node.timestamp && (
                    <span className="text-xs font-mono font-semibold text-on-surface mt-0.5">
                      {formatDate(node.timestamp)}
                    </span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="flex items-center justify-center py-1">
                  <Icon name="arrow_downward" size={16} className="text-outline-variant" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
