import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { KPICard } from '@/components/common/KPICard';
import { LoadingState } from '@/components/common/LoadingState';
import { computeKPISummary, computeCategoryBreakdown } from '@/lib/analyticsService';
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
import type { KPISummary, CategoryBreakdown } from '@/types';

const COLORS = ['#002045', '#1960a3', '#00796b', '#f57c00', '#d32f2f', '#7b1fa2', '#388e3c', '#5c6bc0'];

export function StateAnalyticsScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/state' },
    { icon: 'assignment', label: t('complaints'), href: '/state/complaints' },
    { icon: 'warning', label: t('escalations'), href: '/state/escalations' },
    { icon: 'group', label: t('userDirectory'), href: '/state/users' },
    { icon: 'map', label: t('mapView'), href: '/state/map' },
    { icon: 'analytics', label: t('analytics'), active: true, href: '/state/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/state/notifications' },
    { icon: 'person', label: t('profile'), href: '/state/profile' },
  ];

  const [kpi, setKpi] = useState<KPISummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [kpiData, catData, complaintList] = await Promise.all([
        computeKPISummary({}),
        computeCategoryBreakdown({}),
        getComplaints({}),
      ]);
      setKpi(kpiData);
      setCategories(catData);
      setComplaints(complaintList);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !kpi) {
    return (
      <DashboardLayout title="Statewide Governance Analytics" navItems={NAV_ITEMS} userName={user?.fullName || "State Admin"} userRole="State Admin">
        <LoadingState />
      </DashboardLayout>
    );
  }

  const districtComparison = (() => {
    const map = new Map<string, { Resolved: number; Pending: number }>();
    for (const c of complaints) {
      const dName = c.districtName || 'Other';
      const curr = map.get(dName) || { Resolved: 0, Pending: 0 };
      if (c.status === 'resolved' || c.status === 'closed') curr.Resolved++;
      else curr.Pending++;
      map.set(dName, curr);
    }
    return Array.from(map.entries()).map(([district, counts]) => ({
      district,
      Resolved: counts.Resolved,
      Pending: counts.Pending,
    }));
  })();

  const resolutionRate = kpi.total > 0 ? Math.round((kpi.resolved / kpi.total) * 100) : 0;

  const districtTableData = (() => {
    const map = new Map<string, { total: number; resolved: number; pending: number }>();
    for (const c of complaints) {
      const dName = c.districtName || 'Other';
      const curr = map.get(dName) || { total: 0, resolved: 0, pending: 0 };
      curr.total++;
      if (c.status === 'resolved' || c.status === 'closed') curr.resolved++;
      else curr.pending++;
      map.set(dName, curr);
    }
    return Array.from(map.entries()).map(([name, s]) => ({
      name,
      total: s.total,
      resolved: s.resolved,
      pending: s.pending,
      sla: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 100,
    })).sort((a, b) => b.total - a.total);
  })();

  return (
    <DashboardLayout
      title="Statewide Grievance Analytics & SLA Intelligence"
      subtitle={`${user?.territory?.state || 'Telangana'} · Statewide Performance Benchmarks`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'State Admin'}
      userRole="State Admin"
    >
      <div className="flex flex-col gap-6">
        {/* Statewide Apex KPIs */}
        <div className="grid grid-cols-4 gap-5">
          <KPICard label="Total Registered Cases" value={kpi.total} icon="assignment" />
          <KPICard label="Active In-Progress Cases" value={kpi.inProgress} icon="autorenew" variant="warning" />
          <KPICard label="Tier-2 Apex Escalations" value={kpi.escalated} icon="warning" variant="critical" />
          <KPICard label="Statewide Resolution Rate" value={`${resolutionRate}%`} icon="speed" variant="success" />
        </div>

        {/* Charts Matrix */}
        <div className="grid grid-cols-2 gap-6">
          {/* District Performance Comparison */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              District Resolution Comparison
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Disposal volumes across Telangana districts</p>

            <div className="h-64 w-full">
              {districtComparison.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
                  No district comparison data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtComparison}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="district" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Resolved" fill="#002045" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Statewide Category Share */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">
              Statewide Sector Distribution
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-6">Proportion of grievances by service category</p>

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
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed District Rankings Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-on-surface">Telangana District Governance Scorecard</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">Live grievance redressal performance across all active districts</p>
            </div>
          </div>

          <div className="overflow-x-auto table-touch-scroll">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-3.5">District Name</th>
                  <th className="px-4 py-3.5">Total Cases</th>
                  <th className="px-4 py-3.5">Resolved</th>
                  <th className="px-4 py-3.5">Pending</th>
                  <th className="px-4 py-3.5">SLA Compliance</th>
                  <th className="px-5 py-3.5 text-right">Performance Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {districtTableData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-on-surface-variant">
                      No district data recorded yet.
                    </td>
                  </tr>
                ) : (
                  districtTableData.map(d => (
                    <tr key={d.name} className="hover:bg-surface-container/40">
                      <td className="px-5 py-3.5 font-bold text-on-surface text-sm sm:text-base">{d.name}</td>
                      <td className="px-4 py-3.5 font-bold text-on-surface text-sm">{d.total.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-emerald-700 font-semibold text-sm">{d.resolved.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-amber-700 font-semibold text-sm">{d.pending.toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${d.sla >= 75 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                              style={{ width: `${d.sla}%` }}
                            />
                          </div>
                          <span className="font-bold text-on-surface text-sm">{d.sla}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          d.sla >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.sla >= 75 ? 'Grade A (Good)' : 'Grade B (Needs Attention)'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
