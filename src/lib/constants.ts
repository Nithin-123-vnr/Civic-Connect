import type { ComplaintCategory, ComplaintStatus, ComplaintPriority } from '@/types';

export const CATEGORY_META: Record<ComplaintCategory, { label: string; icon: string }> = {
  roads: { label: 'Roads', icon: 'add_road' },
  water: { label: 'Water', icon: 'water_drop' },
  drainage: { label: 'Drainage', icon: 'waves' },
  sanitation: { label: 'Sanitation', icon: 'delete' },
  electricity: { label: 'Electricity', icon: 'bolt' },
  parks: { label: 'Parks', icon: 'park' },
  public_safety: { label: 'Safety', icon: 'local_police' },
  disaster_mgmt: { label: 'Disaster Mgmt', icon: 'emergency' },
  other: { label: 'Other', icon: 'more_horiz' },
};

export const STATUS_META: Record<ComplaintStatus, {
  label: string;
  colorClass: string;
  bgClass: string;
  dotClass: string;
}> = {
  pending: {
    label: 'Pending',
    colorClass: 'text-on-surface-variant',
    bgClass: 'bg-surface-container-high',
    dotClass: 'bg-outline',
  },
  assigned: {
    label: 'Assigned',
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary-fixed',
    dotClass: 'bg-secondary',
  },
  in_progress: {
    label: 'In Progress',
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    dotClass: 'bg-primary',
  },
  resolved: {
    label: 'Resolved',
    colorClass: 'text-[#137333]',
    bgClass: 'bg-[#E6F4EA]',
    dotClass: 'bg-[#137333]',
  },
  escalated: {
    label: 'Escalated',
    colorClass: 'text-error',
    bgClass: 'bg-error-container',
    dotClass: 'bg-error',
  },
  rejected: {
    label: 'Rejected',
    colorClass: 'text-error',
    bgClass: 'bg-error-container',
    dotClass: 'bg-error',
  },
  closed: {
    label: 'Closed',
    colorClass: 'text-on-surface-variant',
    bgClass: 'bg-surface-container-highest',
    dotClass: 'bg-outline',
  },
  reopened: {
    label: 'Reopened',
    colorClass: 'text-tertiary',
    bgClass: 'bg-tertiary-fixed',
    dotClass: 'bg-tertiary',
  },
};

export const PRIORITY_META: Record<ComplaintPriority, {
  label: string;
  colorClass: string;
  bgClass: string;
  icon: string;
}> = {
  low: {
    label: 'Low',
    colorClass: 'text-on-surface-variant',
    bgClass: 'bg-surface-container-high',
    icon: 'radio_button_unchecked',
  },
  medium: {
    label: 'Medium',
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary-fixed',
    icon: 'adjust',
  },
  high: {
    label: 'High',
    colorClass: 'text-on-tertiary-container',
    bgClass: 'bg-tertiary-container',
    icon: 'priority_high',
  },
  critical: {
    label: 'Critical',
    colorClass: 'text-error',
    bgClass: 'bg-error/10',
    icon: 'warning',
  },
};
