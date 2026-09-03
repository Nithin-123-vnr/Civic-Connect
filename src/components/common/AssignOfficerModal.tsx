import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { assignComplaint } from '@/lib/complaintService';
import { getEligibleAssignmentPersonnel, getDepartmentForCategory, type DepartmentalPersonnel } from '@/lib/departmentService';
import type { Complaint, Role } from '@/types';

interface AssignOfficerModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  assigner: { uid: string; fullName: string; role: Role };
  onClose: () => void;
  onSuccess: (updated: Complaint, message: string) => void;
}

export function AssignOfficerModal({
  isOpen,
  complaint,
  assigner,
  onClose,
  onSuccess,
}: AssignOfficerModalProps) {
  const [personnelList, setPersonnelList] = useState<DepartmentalPersonnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && complaint) {
      setError(null);
      setInstructions('');
      setSelectedPersonnelId('');
      loadEligiblePersonnel();
    }
  }, [isOpen, complaint]);

  async function loadEligiblePersonnel() {
    if (!complaint) return;
    setLoading(true);
    try {
      const eligible = await getEligibleAssignmentPersonnel({
        category: complaint.category,
        districtName: complaint.districtName,
        mandalName: complaint.mandalName,
        officerRole: assigner.role,
      });
      setPersonnelList(eligible);
      if (eligible.length > 0) {
        const currentAssigned = eligible.find(p => p.id === complaint.assignedTo);
        setSelectedPersonnelId(currentAssigned ? currentAssigned.id : eligible[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load eligible departmental personnel:', err);
      setError('Failed to load eligible field personnel for this department and jurisdiction.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !complaint) return null;

  const deptMeta = getDepartmentForCategory(complaint.category);
  const mandalPersonnel = personnelList.filter(p => p.level === 'mandal');
  const districtPersonnel = personnelList.filter(p => p.level === 'district');
  const selectedPersonnel = personnelList.find(p => p.id === selectedPersonnelId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonnel) {
      setError('Please select an authorized departmental officer.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await assignComplaint(
        complaint.id,
        selectedPersonnel.id,
        selectedPersonnel.fullName,
        assigner,
        instructions.trim() || undefined,
        selectedPersonnel.department,
        selectedPersonnel.designation
      );

      onSuccess(
        updated,
        `Grievance ${complaint.referenceId} assigned to ${selectedPersonnel.fullName} (${selectedPersonnel.designation} • ${selectedPersonnel.department}).`
      );
      onClose();
    } catch (err: any) {
      console.error('Assignment error:', err);
      setError(err.message || 'Failed to assign officer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Assign Field Officer / Engineer"
      subtitle={
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-primary">{complaint.referenceId}</span>
          <span className="px-2.5 py-0.5 rounded-md bg-primary-container/20 text-primary font-bold text-xs uppercase tracking-wider">
            Department Assignment
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Complaint Context Summary */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/40 text-xs flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-on-surface text-base line-clamp-1">{complaint.title}</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant pt-1.5 border-t border-outline-variant/40">
            <div>
              <span className="text-on-surface-variant/70 text-xs">Responsible Department:</span>
              <p className="font-bold text-primary line-clamp-1 text-xs sm:text-sm">{deptMeta.name}</p>
            </div>
            <div>
              <span className="text-on-surface-variant/70 text-xs">Administrative Handler:</span>
              <p className="font-bold text-on-surface text-xs sm:text-sm">
                {assigner.fullName} ({assigner.role.replace('_', ' ')})
              </p>
            </div>
            <div>
              <span className="text-on-surface-variant/70 text-xs">Jurisdiction:</span>
              <p className="font-semibold text-on-surface text-xs sm:text-sm">{complaint.mandalName}, {complaint.districtName}</p>
            </div>
            <div>
              <span className="text-on-surface-variant/70 text-xs">Currently Assigned Field:</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                {complaint.assignedToName ? `${complaint.assignedToName} (${complaint.assignedDesignation || 'Field Personnel'})` : 'Unassigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-2">
              <Icon name="error" size={18} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 flex items-center justify-between">
              <span>SELECT RESPONSIBLE DEPARTMENT OFFICER / FIELD PERSONNEL *</span>
              <span className="text-xs text-on-surface-variant font-normal">
                Category: <strong className="capitalize">{complaint.category}</strong>
              </span>
            </label>

            {loading ? (
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low flex items-center justify-center gap-2 text-sm text-on-surface-variant">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Finding authorized {deptMeta.name} personnel for {complaint.mandalName}...</span>
              </div>
            ) : personnelList.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Icon name="warning" size={18} />
                  <span>No Authorized Field Personnel Found</span>
                </div>
                <p className="text-xs text-amber-800">
                  No authorized field personnel found for this department in this jurisdiction.
                </p>
              </div>
            ) : (
              <select
                value={selectedPersonnelId}
                onChange={e => setSelectedPersonnelId(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary shadow-sm cursor-pointer"
              >
                {mandalPersonnel.length > 0 && (
                  <optgroup label={`Mandal Field Personnel (${complaint.mandalName})`}>
                    {mandalPersonnel.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — {p.designation} • {p.department} ({p.mandalName})
                      </option>
                    ))}
                  </optgroup>
                )}
                {districtPersonnel.length > 0 && (
                  <optgroup label={`District Department Engineers (${complaint.districtName})`}>
                    {districtPersonnel.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} — {p.designation} • {p.department} ({p.districtName} District)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5">
              Executive Directive / Site Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Conduct immediate site inspection, verify physical defect, and initiate civil works compliance within 48 hours."
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface font-medium focus:outline-none focus:border-primary placeholder:text-on-surface-variant/60 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting || personnelList.length === 0 || !selectedPersonnelId}
              icon={submitting ? undefined : "assignment_ind"}
            >
              {submitting ? 'Assigning Officer...' : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
