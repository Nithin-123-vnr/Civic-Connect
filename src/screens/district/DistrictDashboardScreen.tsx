import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { KPICard } from "@/components/common/KPICard";
import { Button } from "@/components/common/Button";
import { Icon } from "@/components/common/Icon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getComplaints, subscribeToComplaints } from "@/lib/complaintService";
import type { Complaint } from "@/types";

export function DistrictDashboardScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [escalations, setEscalations] = useState<Complaint[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const NAV_ITEMS = [
    { icon: "dashboard", label: t('dashboard'), active: true, href: "/district" },
    { icon: "assignment", label: t('complaints'), href: "/district/complaints" },
    { icon: "warning", label: t('escalations'), href: "/district/escalations" },
    { icon: "map", label: t('mapView'), href: "/district/map" },
    { icon: "analytics", label: t('analytics'), href: "/district/analytics" },
    { icon: "notifications", label: t('alerts'), href: "/district/notifications" },
    { icon: "person", label: t('profile'), href: "/district/profile" },
  ];

  const districtName = user?.territory?.district || 'Hyderabad';
  const stateName = user?.territory?.state || 'Telangana';

  useEffect(() => {
    async function load() {
      const filter = { districtName: user?.territory?.district };
      const [escList, compList] = await Promise.all([
        getComplaints({ ...filter, isEscalated: true }),
        getComplaints(filter),
      ]);
      setEscalations(escList);
      setComplaints(compList);
    }
    if (user) {
      load();
    }
    const unsubscribe = subscribeToComplaints(() => {
      if (user) {
        load();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user]);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending' || c.status === 'assigned').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const escalationsCount = escalations.length;

  const mandalStats = useMemo(() => {
    const map = new Map<string, { total: number; resolved: number; pending: number; inProgress: number }>();
    for (const c of complaints) {
      const mName = c.mandalName || 'General';
      const curr = map.get(mName) || { total: 0, resolved: 0, pending: 0, inProgress: 0 };
      curr.total++;
      if (c.status === 'resolved' || c.status === 'closed') curr.resolved++;
      else if (c.status === 'in_progress') curr.inProgress++;
      else curr.pending++;
      map.set(mName, curr);
    }
    return Array.from(map.entries()).map(([name, s]) => ({
      id: name,
      name,
      total: s.total,
      resolved: s.resolved,
      pending: s.pending,
      sla: s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 100,
    })).sort((a, b) => b.total - a.total);
  }, [complaints]);

  return (
    <DashboardLayout
      title="District Executive Overview"
      subtitle={`${districtName} District · ${stateName}`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || "District Officer"}
      userRole="District Officer"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Link to="/district/escalations">
            <Button variant="primary" size="sm" icon="warning" className="bg-error hover:bg-error/90 text-on-error">
              {escalationsCount} Escalations
            </Button>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Urgent Escalation Alert */}
        {escalationsCount > 0 && (
          <div className="p-4.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center animate-pulse">
                <Icon name="warning" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {escalationsCount} District Grievance Escalations Require Collectorate Action
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Critical grievances in {districtName} have exceeded statutory SLA limits and require immediate intervention.
                </p>
              </div>
            </div>
            <Link to="/district/escalations">
              <Button variant="outline" size="sm" className="bg-white border-rose-300 text-rose-800 hover:bg-rose-100 font-bold">
                Review Escalations
              </Button>
            </Link>
          </div>
        )}

        {/* District KPI Grid */}
        <div className="grid grid-cols-4 gap-5">
          <KPICard label="Total Grievances" value={total} icon="assignment" />
          <KPICard label="Pending Action" value={pending} icon="pending" variant="warning" />
          <KPICard label="Active In Progress" value={inProgress} icon="autorenew" />
          <KPICard label="Tier-1 Escalations" value={escalationsCount} icon="warning" variant="critical" badge={escalationsCount > 0 ? "Urgent Action" : undefined} />
        </div>

        {/* Quick Mandal League Table & Overview */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-on-surface">
                  Mandal Administration SLA Rankings ({districtName})
                </h3>
                <Link to="/district/analytics" className="text-xs sm:text-sm font-bold text-primary hover:underline">
                  Full Analytics Report
                </Link>
              </div>

              <div className="overflow-x-auto table-touch-scroll">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      <th className="px-4 py-3">Mandal Name</th>
                      <th className="px-3 py-3">Total Cases</th>
                      <th className="px-3 py-3">Resolved</th>
                      <th className="px-3 py-3">Pending</th>
                      <th className="px-3 py-3">SLA Score</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {mandalStats.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                          No grievances registered in {districtName} district yet.
                        </td>
                      </tr>
                    ) : (
                      mandalStats.map(r => (
                        <tr key={r.id} className="hover:bg-surface-container/40">
                          <td className="px-4 py-3 font-semibold text-on-surface text-sm sm:text-base">{r.name}</td>
                          <td className="px-3 py-3 font-bold text-on-surface text-sm">{r.total}</td>
                          <td className="px-3 py-3 text-emerald-700 font-semibold text-sm">{r.resolved}</td>
                          <td className="px-3 py-3 text-amber-700 font-semibold text-sm">{r.pending}</td>
                          <td className="px-3 py-3 font-bold text-on-surface text-sm">{r.sla}%</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                              r.sla >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.sla >= 75 ? 'Good' : 'Needs Attention'}
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

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">District Grievance Status</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mb-4">Current operational workload for {districtName}</p>

              <div className="flex flex-col gap-3 text-sm">
                <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between">
                  <span>Resolved / Closed</span>
                  <strong className="text-emerald-700 font-bold">{resolved} Cases</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between">
                  <span>Active Investigation</span>
                  <strong className="text-blue-700 font-bold">{inProgress} Cases</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between">
                  <span>Pending Assignment</span>
                  <strong className="text-amber-700 font-bold">{pending} Cases</strong>
                </div>
              </div>
            </div>

            <Link to="/district/complaints" className="mt-4">
              <Button variant="primary" size="sm" fullWidth iconRight="arrow_forward">
                Open District Complaints Queue ({total})
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
