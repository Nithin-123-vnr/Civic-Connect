import type { ComplaintPriority } from '@/types';

// SLA in hours
export const PRIORITY_SLA_HOURS: Record<ComplaintPriority, number> = {
  critical: 24,
  high: 48,
  medium: 72,
  low: 120,
};

export type SLAStatusTier = 'within_sla' | 'approaching_deadline' | 'breached';

export interface SLACalculationResult {
  deadline: Date;
  isOverdue: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  totalHours: number;
  progressPercent: number;
  statusTier: SLAStatusTier;
  formattedCountdown: string;
  statusLabel: string;
}

export function calculateSLADeadline(createdAtIso: string, priority: ComplaintPriority = 'medium'): SLACalculationResult {
  const created = new Date(createdAtIso).getTime();
  const totalHours = PRIORITY_SLA_HOURS[priority] || 72;
  const slaDurationMs = totalHours * 60 * 60 * 1000;
  const deadlineMs = created + slaDurationMs;
  const now = Date.now();
  const diffMs = deadlineMs - now;
  const elapsedMs = Math.max(0, now - created);

  const isOverdue = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);
  const totalMinutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / slaDurationMs) * 100)));

  let statusTier: SLAStatusTier;
  let statusLabel: string;
  let formattedCountdown: string;

  if (isOverdue) {
    statusTier = 'breached';
    statusLabel = 'SLA Breached';
    formattedCountdown = `Overdue by ${hours}h ${minutes}m`;
  } else if (progressPercent >= 75 || hours < 6) {
    statusTier = 'approaching_deadline';
    statusLabel = 'SLA Approaching Deadline';
    formattedCountdown = `${hours}h ${minutes}m remaining`;
  } else {
    statusTier = 'within_sla';
    statusLabel = 'SLA Within Limit';
    formattedCountdown = `${hours}h ${minutes}m remaining`;
  }

  return {
    deadline: new Date(deadlineMs),
    isOverdue,
    hoursRemaining,
    minutesRemaining: totalMinutes,
    totalHours,
    progressPercent,
    statusTier,
    formattedCountdown,
    statusLabel,
  };
}

export function getNextEscalationLevel(currentLevel: 0 | 1 | 2): 1 | 2 | null {
  if (currentLevel === 0) return 1; // Mandal -> District
  if (currentLevel === 1) return 2; // District -> State
  return null; // Already at State level
}
