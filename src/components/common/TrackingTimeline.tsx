import type { ComplaintUpdate } from '@/types';
import { STATUS_META } from '@/lib/constants';

interface TrackingTimelineProps {
  updates: ComplaintUpdate[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TrackingTimeline({ updates }: TrackingTimelineProps) {
  if (updates.length === 0) {
    return <p className="text-on-surface-variant text-xs italic py-2">No updates recorded yet.</p>;
  }

  return (
    <div className="relative pl-6 flex flex-col gap-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/60">
      {updates.map((update, idx) => {
        const meta = STATUS_META[update.status] || {
          label: update.status.replace('_', ' '),
          colorClass: 'text-on-surface-variant',
          bgClass: 'bg-surface-container',
          dotClass: 'bg-outline',
        };
        const isLatest = idx === updates.length - 1;
        const staggerClass = idx < 6 ? `stagger-${idx + 1}` : '';

        return (
          <div key={update.id} className={`relative animate-slide-up ${staggerClass}`}>
            <div
              className={`absolute -left-[27px] top-1 w-[14px] h-[14px] rounded-full border-2 border-surface-container-lowest transition-transform ${
                isLatest ? 'bg-primary scale-110 shadow-sm ring-4 ring-primary/10' : 'bg-surface-container-highest'
              }`}
            />
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-sm text-on-surface capitalize">
                {meta.label}
              </p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md shadow-xs ${meta.bgClass} ${meta.colorClass}`}>
                {update.updatedByName}
              </span>
            </div>
            {update.note && (
              <p className="text-xs sm:text-sm text-on-surface-variant mb-0.5 leading-relaxed">{update.note}</p>
            )}
            <p className="text-xs text-on-surface-variant/80 font-mono">{formatDate(update.timestamp)}</p>
          </div>
        );
      })}
    </div>
  );
}
