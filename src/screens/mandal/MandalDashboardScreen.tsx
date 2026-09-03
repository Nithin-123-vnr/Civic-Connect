import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { KPICard } from "@/components/common/KPICard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { Button } from "@/components/common/Button";
import { Icon } from "@/components/common/Icon";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getComplaints, subscribeToComplaints } from "@/lib/complaintService";
import type { Complaint } from "@/types";

export function MandalDashboardScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const NAV_ITEMS = [
    { icon: "dashboard", label: t('dashboard'), active: true, href: "/mandal" },
    { icon: "assignment", label: t('complaints'), href: "/mandal/complaints" },
    { icon: "map", label: t('mapView'), href: "/mandal/map" },
    { icon: "analytics", label: t('analytics'), href: "/mandal/analytics" },
    { icon: "notifications", label: t('alerts'), href: "/mandal/notifications" },
    { icon: "person", label: t('profile'), href: "/mandal/profile" },
  ];

  const mandalName = user?.territory?.mandal || 'Shaikpet';
  const districtName = user?.territory?.district || 'Hyderabad';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const filter = {
        mandalName: user?.territory?.mandal,
        districtName: user?.territory?.district,
      };
      const complaintList = await getComplaints(filter);
      setComplaints(complaintList);
      setLoading(false);
    }
    if (user) {
      loadData();
    }
    const unsubscribe = subscribeToComplaints(() => {
      if (user) {
        loadData();
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
  const escalated = complaints.filter(c => c.status === 'escalated' || c.escalationLevel > 0).length;

  const recentList = complaints.slice(0, 6);
  const urgentCases = complaints.filter(c => c.priority === 'critical' || c.status === 'escalated' || c.escalationLevel > 0);

  return (
    <DashboardLayout
      title="Mandal Grievance Dashboard"
      subtitle={`${mandalName} Mandal · ${districtName} District`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || "Mandal Officer"}
      userRole="Mandal Officer"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Link to="/mandal/complaints">
            <Button variant="primary" size="sm" icon="assignment">
              View Queue ({complaints.length})
            </Button>
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Urgent Action Banner if escalations exist */}
        {urgentCases.length > 0 && (
          <div className="p-4.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center animate-pulse">
                <Icon name="warning" size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {urgentCases.length} Urgent / Critical Grievances Require Immediate Field Inspection
                </h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Critical infrastructure issues must be assigned or resolved within statutory 24-48h SLA.
                </p>
              </div>
            </div>
            <Link to="/mandal/complaints">
              <Button variant="outline" size="sm" className="bg-white border-rose-300 text-rose-800 hover:bg-rose-100 font-bold">
                Inspect Urgent Cases
              </Button>
            </Link>
          </div>
        )}

        {/* Operational KPI Grid */}
        <div className="grid grid-cols-4 gap-5">
          <KPICard label="Total Received" value={total} icon="assignment" />
          <KPICard label="Pending Action" value={pending} icon="pending" variant="warning" badge="Action Needed" />
          <KPICard label="In Progress" value={inProgress} icon="autorenew" />
          <KPICard label="Resolved & Closed" value={resolved} icon="check_circle" variant="success" />
        </div>

        {/* Operational Status Breakdown Progress */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              Mandal Grievance Disposal Pipeline
            </h3>
            <span className="text-xs sm:text-sm font-semibold text-on-surface-variant">
              {resolved} of {total} grievances resolved ({total > 0 ? Math.round((resolved / total) * 100) : 0}%)
            </span>
          </div>

          <div className="w-full h-3.5 bg-surface-container rounded-full overflow-hidden flex gap-0.5 p-0.5">
            <div style={{ width: `${(resolved / (total || 1)) * 100}%` }} className="bg-emerald-600 rounded-l-full progress-bar-fill" title={`Resolved: ${resolved}`} />
            <div style={{ width: `${(inProgress / (total || 1)) * 100}%` }} className="bg-blue-600 progress-bar-fill" title={`In Progress: ${inProgress}`} />
            <div style={{ width: `${(pending / (total || 1)) * 100}%` }} className="bg-amber-500 progress-bar-fill" title={`Pending: ${pending}`} />
            <div style={{ width: `${(escalated / (total || 1)) * 100}%` }} className="bg-rose-600 rounded-r-full progress-bar-fill" title={`Escalated: ${escalated}`} />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-on-surface-variant">Resolved / Closed: <strong className="text-on-surface">{resolved}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-on-surface-variant">In Progress: <strong className="text-on-surface">{inProgress}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-on-surface-variant">Pending / Assigned: <strong className="text-on-surface">{pending}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600" />
              <span className="text-on-surface-variant">Escalated: <strong className="text-on-surface">{escalated}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Recent Grievances Queue */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          <div className="px-6 py-4.5 border-b border-outline-variant flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-on-surface">Recent Mandal Grievances</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Live feed of grievances registered in {user?.territory?.mandal || 'Shaikpet'} Mandal</p>
            </div>
            <Link to="/mandal/complaints">
              <Button variant="ghost" size="sm" iconRight="arrow_forward">View All Complaints</Button>
            </Link>
          </div>
          <div className="overflow-x-auto table-touch-scroll">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-3.5">Ref ID</th>
                  <th className="px-4 py-3.5">Title & Area</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                      Loading complaints...
                    </td>
                  </tr>
                ) : recentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                      No complaints registered in this mandal yet.
                    </td>
                  </tr>
                ) : (
                  recentList.map(c => (
                    <tr key={c.id} className="hover:bg-surface-container/40">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{c.referenceId}</td>
                      <td className="px-4 py-3.5 max-w-xs truncate">
                        <p className="font-semibold text-sm sm:text-base text-on-surface truncate">{c.title}</p>
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">{c.areaName || c.location?.address || 'Shaikpet'}</p>
                      </td>
                      <td className="px-4 py-3.5 capitalize font-medium text-sm">{c.category}</td>
                      <td className="px-4 py-3.5"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate('/mandal/complaints')}>
                          Inspect
                        </Button>
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
