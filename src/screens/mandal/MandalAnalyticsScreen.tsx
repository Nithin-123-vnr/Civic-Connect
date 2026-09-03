import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { LoadingState } from '@/components/common/LoadingState';
import { computeKPISummary, computeCategoryBreakdown, computeWeeklyTrend } from '@/lib/analyticsService';
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
import type { KPISummary, CategoryBreakdown, DailyTrend, Complaint } from '@/types';

const COLORS = ['#002045', '#1960a3', '#00796b', '#f57c00', '#d32f2f', '#7b1fa2', '#388e3c', '#5c6bc0'];

export function MandalAnalyticsScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/mandal' },
    { icon: 'assignment', label: t('complaints'), href: '/mandal/complaints' },
    { icon: 'map', label: t('mapView'), href: '/mandal/map' },
    { icon: 'analytics', label: t('analytics'), active: true, href: '/mandal/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/mandal/notifications' },
    { icon: 'person', label: t('profile'), href: '/mandal/profile' },
  ];

  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<DailyTrend[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const mandalName = user?.territory?.mandal || 'Shaikpet';
  const districtName = user?.territory?.district || 'Hyderabad';

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const filter = {
        mandalName: user?.territory?.mandal,
        districtName: user?.territory?.district,
      };
      const [kpiData, catData, trendData, complaintList] = await Promise.all([
        computeKPISummary(filter),
        computeCategoryBreakdown(filter),
        computeWeeklyTrend(filter),
        getComplaints(filter),
      ]);
      setKpi(kpiData);
      setCategories(catData);
      setWeeklyTrend(trendData);
      setComplaints(complaintList);
      setLoading(false);
    }
    if (user) {
      loadStats();
    }
  }, [user]);

  if (loading || !kpi) {
    return (
      <DashboardLayout title="Mandal Performance Analytics" navItems={NAV_ITEMS} userName={user?.fullName || "Mandal Officer"} userRole="Mandal Officer">
        <LoadingState />
      </DashboardLayout>
    );
  }

  const resolutionRate = kpi.total > 0 ? Math.round((kpi.resolved / kpi.total) * 100) : 0;

  // Status breakdown data for bar chart
  const statusCounts: Record<string, number> = {};
  complaints.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace('_', ' ').toUpperCase(),
    count,
  }));

  return (
    <DashboardLayout
      title="Departmental Performance Analytics & Intelligence"
      subtitle={`${mandalName} Mandal · ${districtName} District · SLA Metrics & Analysis`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'Mandal Officer'}
      userRole="Mandal Officer"
    >
      <div className="flex flex-col gap-6">
        {/* Deep Analytics KPI Grid */}
        <div className="grid grid-cols-4 gap-5">
          <KPICard label="Avg Resolution Time" value="28.4 Hrs" icon="timer" variant="default" badge="Target: 48h" />
          <KPICard label="SLA Compliance Rate" value={`${resolutionRate}%`} icon="speed" variant="success" />
          <KPICard label="Citizen Satisfaction" value="4.6 / 5.0" icon="star" variant="default" />
          <KPICard label="First-Time Fix Rate" value="94.2%" icon="verified" variant="default" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Weekly Inflow Bar Chart */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              Grievance Intake Trend
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Daily distribution of newly registered cases</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#002045" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Share Donut Chart */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              Category Distribution
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Proportion of grievances across municipal departments</p>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        {statusChartData.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              Active Queue Status Distribution
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Distribution across all lifecycle workflow states</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#1960a3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
