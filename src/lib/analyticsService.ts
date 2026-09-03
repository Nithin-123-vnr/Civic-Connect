import { getComplaints } from './complaintService';
import type { KPISummary, CategoryBreakdown, DailyTrend, ComplaintCategory } from '@/types';

export interface AnalyticsFilter {
  mandalId?: string;
  mandalName?: string;
  districtId?: string;
  districtName?: string;
}

export async function computeKPISummary(filter: AnalyticsFilter = {}): Promise<KPISummary> {
  const list = await getComplaints(filter);
  const total = list.length;
  const pending = list.filter(c => c.status === 'pending').length;
  const assigned = list.filter(c => c.status === 'assigned').length;
  const inProgress = list.filter(c => c.status === 'in_progress').length;
  const resolved = list.filter(c => c.status === 'resolved').length;
  const escalated = list.filter(c => c.status === 'escalated' || c.escalationLevel > 0).length;
  const rejected = list.filter(c => c.status === 'rejected').length;
  const closed = list.filter(c => c.status === 'closed').length;

  return {
    total,
    pending,
    assigned,
    inProgress,
    resolved,
    escalated,
    rejected,
    closed,
  };
}

export async function computeCategoryBreakdown(filter: AnalyticsFilter = {}): Promise<CategoryBreakdown[]> {
  const list = await getComplaints(filter);
  const total = list.length;

  const counts: Partial<Record<ComplaintCategory, number>> = {};
  for (const item of list) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }

  const allCategories: ComplaintCategory[] = [
    'roads',
    'water',
    'drainage',
    'sanitation',
    'electricity',
    'parks',
    'public_safety',
    'disaster_mgmt',
    'other',
  ];

  return allCategories.map(cat => {
    const count = counts[cat] || 0;
    return {
      category: cat,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export async function computeWeeklyTrend(filter: AnalyticsFilter = {}): Promise<DailyTrend[]> {
  const list = await getComplaints(filter);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const countsByDay: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  for (const c of list) {
    if (c.createdAt) {
      const d = new Date(c.createdAt);
      if (!isNaN(d.getTime())) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (countsByDay[dayName] !== undefined) {
          countsByDay[dayName]++;
        }
      }
    }
  }

  return days.map(day => ({
    date: day,
    count: countsByDay[day] || 0,
  }));
}

