const fs = require('fs');
const path = require('path');

const root = __dirname;
const write = (p, content) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

write('src/components/common/StatusBadge.tsx', `import { STATUS_META } from '@/lib/constants';
import type { ComplaintStatus } from '@/types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 font-caption text-caption';

  return (
    <div className={\`inline-flex items-center gap-1 rounded-full \${sizeClass} \${meta.bgClass} \${meta.colorClass}\`}>
      <span className={\`w-1.5 h-1.5 rounded-full \${meta.dotClass}\`} />
      {meta.label}
    </div>
  );
}`);

write('src/components/common/PriorityBadge.tsx', `import { PRIORITY_META } from '@/lib/constants';
import type { ComplaintPriority } from '@/types';
import { Icon } from './Icon';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const meta = PRIORITY_META[priority];
  return (
    <div className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-label-md text-label-md \${meta.bgClass} \${meta.colorClass}\`}>
      <Icon name={meta.icon} size={16} />
      {meta.label}
    </div>
  );
}`);

write('src/components/common/Button.tsx', `import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  isLoading?: boolean;
  children?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-sm',
  secondary: 'bg-transparent border border-primary text-primary hover:bg-primary/5',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  danger: 'bg-error text-on-error hover:bg-error/90',
  outline: 'bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-12 px-6 font-label-md text-label-md',
  lg: 'h-14 px-8 font-label-md text-label-md text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  isLoading,
  children,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={\`
        inline-flex items-center justify-center gap-2 rounded-lg font-label-md
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        \${variantClasses[variant]}
        \${sizeClasses[size]}
        \${fullWidth ? 'w-full' : ''}
        \${className}
      \`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Icon name="progress_activity" className="animate-spin" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  );
}`);

write('src/components/common/KPICard.tsx', `import { Icon } from './Icon';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  badge?: string;
  animate?: boolean;
}

const variantClasses = {
  default: {
    card: 'bg-surface-container-lowest',
    icon: 'bg-primary/10 text-primary',
    value: 'text-on-surface',
    label: 'text-on-surface-variant',
  },
  critical: {
    card: 'bg-error-container',
    icon: 'bg-error/20 text-error',
    value: 'text-error',
    label: 'text-error',
  },
  warning: {
    card: 'bg-tertiary-container text-on-tertiary-container',
    icon: 'bg-on-tertiary-container/20 text-on-tertiary-container',
    value: 'text-on-tertiary-container',
    label: 'text-on-tertiary-container/80',
  },
  success: {
    card: 'bg-surface-container-lowest',
    icon: 'bg-[#E6F4EA] text-[#137333]',
    value: 'text-on-surface',
    label: 'text-on-surface-variant',
  },
};

export function KPICard({ label, value, icon, variant = 'default', badge, animate }: KPICardProps) {
  const v = variantClasses[variant];
  return (
    <div className={\`\${v.card} rounded-2xl p-6 shadow-card flex flex-col justify-between group hover:shadow-card-hover transition-shadow\`}>
      <div className="flex justify-between items-start mb-4">
        <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${v.icon}\`}>
          <Icon name={icon} />
        </div>
        {badge && (
          <span className={\`\${
            variant === 'critical'
              ? 'bg-error text-on-error'
              : 'bg-on-tertiary-container text-tertiary-container'
          } font-caption text-caption px-2 py-1 rounded-md font-bold flex items-center gap-1\`}>
            {animate && <span className="w-1.5 h-1.5 rounded-full bg-on-error animate-pulse" />}
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className={\`font-headline-xl text-headline-xl \${v.value}\`}>{value}</div>
        <div className={\`font-label-md text-label-md uppercase tracking-wider mt-1 \${v.label}\`}>{label}</div>
      </div>
    </div>
  );
}`);

write('src/components/common/ComplaintCard.tsx', `import type { Complaint } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Icon } from './Icon';
import { CATEGORY_META } from '@/lib/constants';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick?: () => void;
}

function getProgressPercent(status: Complaint['status']): number {
  const map: Record<string, number> = {
    pending: 10,
    assigned: 33,
    in_progress: 66,
    resolved: 100,
    escalated: 50,
    closed: 100,
    rejected: 100,
    reopened: 20,
  };
  return map[status] ?? 0;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return hours <= 1 ? 'Today' : \`\${hours}h ago\`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : \`\${days} days ago\`;
}

export function ComplaintCard({ complaint, onClick }: ComplaintCardProps) {
  const catMeta = CATEGORY_META[complaint.category];
  const progress = getProgressPercent(complaint.status);

  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col gap-3 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Icon name={catMeta.icon} className="text-outline" />
          <span className="font-label-md text-label-md text-on-surface-variant">ID: #{complaint.referenceId}</span>
        </div>
        <StatusBadge status={complaint.status} />
      </div>
      <h3 className="font-body-lg text-body-lg text-on-surface font-semibold leading-snug">{complaint.title}</h3>
      <p className="font-caption text-caption text-on-surface-variant">Reported {timeAgo(complaint.createdAt)}</p>
      <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-secondary rounded-full transition-all duration-500"
          style={{ width: \`\${progress}%\` }}
        />
      </div>
    </div>
  );
}`);

write('src/components/common/ComplaintTableRow.tsx', `import type { Complaint } from '@/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Icon } from './Icon';
import { CATEGORY_META } from '@/lib/constants';
import { Button } from './Button';

interface ComplaintTableRowProps {
  complaint: Complaint;
  onReview?: (complaint: Complaint) => void;
  onAssign?: (complaint: Complaint) => void;
  isFirst?: boolean;
}

export function ComplaintTableRow({ complaint, onReview, onAssign, isFirst }: ComplaintTableRowProps) {
  const catMeta = CATEGORY_META[complaint.category];
  const isPending = complaint.status === 'pending';

  return (
    <tr className={\`group hover:bg-surface-container-low/30 transition-colors \${
      isFirst ? '' : 'border-t border-surface-variant/50'
    }\`}>
      <td className="py-5 px-8 font-label-md text-primary font-mono whitespace-nowrap">#{complaint.referenceId}</td>
      <td className="py-5 px-4">
        <div className="font-body-md text-on-surface font-medium truncate max-w-[300px]">{complaint.title}</div>
        <div className="font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-1">
          <Icon name="location_on" size={14} />
          {complaint.areaName}
        </div>
      </td>
      <td className="py-5 px-4 font-body-md text-on-surface-variant">{catMeta.label}</td>
      <td className="py-5 px-4">
        <PriorityBadge priority={complaint.priority} />
      </td>
      <td className="py-5 px-4">
        <StatusBadge status={complaint.status} />
      </td>
      <td className="py-5 px-8 text-right">
        {isPending ? (
          <Button size="sm" onClick={() => onAssign?.(complaint)}>Assign</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onReview?.(complaint)}>Review</Button>
        )}
      </td>
    </tr>
  );
}`);

console.log('Rest 1 written');
