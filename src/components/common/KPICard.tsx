import { Icon } from './Icon';
import { AnimatedNumber } from './AnimatedNumber';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  variant?: 'default' | 'critical' | 'warning' | 'success';
  badge?: string;
  animate?: boolean;
  className?: string;
}

const variantClasses = {
  default: {
    card: 'bg-surface-container-lowest border border-outline-variant/60',
    icon: 'bg-primary/10 text-primary',
    value: 'text-on-surface',
    label: 'text-on-surface-variant',
  },
  critical: {
    card: 'bg-error-container/30 border border-error/30 text-error',
    icon: 'bg-error/20 text-error',
    value: 'text-error',
    label: 'text-error',
  },
  warning: {
    card: 'bg-tertiary-container/30 border border-tertiary/20 text-on-tertiary-container',
    icon: 'bg-on-tertiary-container/20 text-on-tertiary-container',
    value: 'text-on-tertiary-container',
    label: 'text-on-tertiary-container/80',
  },
  success: {
    card: 'bg-surface-container-lowest border border-emerald-200/60',
    icon: 'bg-[#E6F4EA] text-[#137333]',
    value: 'text-on-surface',
    label: 'text-on-surface-variant',
  },
};

export function KPICard({ label, value, icon, variant = 'default', badge, animate, className = '' }: KPICardProps) {
  const v = variantClasses[variant];
  return (
    <div
      className={`
        ${v.card} rounded-2xl p-6 shadow-card flex flex-col justify-between
        transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover
        ${className}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${v.icon}`}>
          <Icon name={icon} size={20} />
        </div>
        {badge && (
          <span
            className={`${
              variant === 'critical'
                ? 'bg-error text-on-error'
                : 'bg-on-tertiary-container text-tertiary-container'
            } text-xs px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-sm`}
          >
            {animate && <span className="w-1.5 h-1.5 rounded-full bg-on-error animate-pulse-subtle" />}
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className={`text-3xl sm:text-4xl font-bold ${v.value} tracking-tight`}>
          <AnimatedNumber value={value} />
        </div>
        <div className={`text-sm font-semibold tracking-wide mt-1.5 ${v.label}`}>
          {label}
        </div>
      </div>
    </div>
  );
}
