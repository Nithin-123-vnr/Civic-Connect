import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { LoadingState } from '@/components/common/LoadingState';
import { computeCategoryBreakdown, computeKPISummary } from '@/lib/analyticsService';
import { getComplaints } from '@/lib/complaintService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { CategoryBreakdown, Complaint, KPISummary } from '@/types';

const COLORS = ['#002045', '#1960a3', '#00796b', '#f57c00', '#d32f2f', '#7b1fa2', '#388e3c', '#5c6bc0'];

export function DistrictAnalyticsScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/district' },
    { icon: 'assignment', label: t('complaints'), href: '/district/complaints' },
    { icon: 'warning', label: t('escalations'), href: '/district/escalations' },
    { icon: 'map', label: t('mapView'), href: '/district/map' },
    { icon: 'analytics', label: t('analytics'), active: true, href: '/district/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/district/notifications' },
    { icon: 'person', label: t('profile'), href: '/district/profile' },
  ];

  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(true);

  const districtName = user?.territory?.district || 'Hyderabad';

  useEffect(() => {
    async function load() {
      setLoading(true);
      const filter = { districtName: user?.territory?.district };
      const [catData, compData, kpiData] = await Promise.all([
        computeCategoryBreakdown(filter),
        getComplaints(filter),
        computeKPISummary(filter),
      ]);
      setCategories(catData);
      setComplaints(compData);
      setKpi(kpiData);
      setLoading(false);
    }
    if (user) {
      load();
    }
  }, [user]);

  const mandalChartData = useMemo(() => {
    const map = new Map<string, { Resolved: number; Pending: number }>();
    for (const c of complaints) {
      const mName = c.mandalName || 'General';
      const curr = map.get(mName) || { Resolved: 0, Pending: 0 };
      if (c.status === 'resolved' || c.status === 'closed') curr.Resolved++;
      else curr.Pending++;
      map.set(mName, curr);
    }
    return Array.from(map.entries()).map(([name, counts]) => ({
      name,
      Resolved: counts.Resolved,
      Pending: counts.Pending,
    }));
  }, [complaints]);

  if (loading || !kpi) {
    return (
      <DashboardLayout title="District Performance Analytics" navItems={NAV_ITEMS} userName={user?.fullName || "District Officer"} userRole="District Officer">
        <LoadingState />
      </DashboardLayout>
    );
  }

  const resolutionRate = kpi.total > 0 ? Math.round((kpi.resolved / kpi.total) * 100) : 0;
  const activePending = kpi.pending + kpi.assigned;

  return (
    <DashboardLayout
      title="District Comparative Performance & SLA Intelligence"
      subtitle={`${districtName} District · Inter-Mandal Redressal Benchmarks`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'District Officer'}
      userRole="District Officer"
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-5">
          <KPICard label="Total District Cases" value={kpi.total} icon="assignment" />
          <KPICard label="Overall Resolution Rate" value={`${resolutionRate}%`} icon="check_circle" variant="success" />
          <KPICard label="Pending Inflow" value={activePending} icon="pending" variant="warning" />
          <KPICard label="Escalated Cases" value={kpi.escalated} icon="warning" variant="critical" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Mandal Comparison Bar Chart */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              Mandal-wise Grievance Inflow vs Disposal ({districtName})
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Comparative volumes across district mandals</p>

            <div className="h-64 w-full">
              {mandalChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
                  No mandal data recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mandalChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Resolved" fill="#002045" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* District Category Share */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              District Grievance Category Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Distribution across municipal service departments</p>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories.filter(c => c.count > 0)}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categories.filter(c => c.count > 0).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
