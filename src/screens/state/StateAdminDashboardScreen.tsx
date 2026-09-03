import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { KPICard } from "@/components/common/KPICard";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getComplaints, subscribeToComplaints } from "@/lib/complaintService";
import type { Complaint } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", active: true, href: "/state" },
  { icon: "assignment", label: "Complaints", href: "/state/complaints" },
  { icon: "warning", label: "Escalations", href: "/state/escalations" },
  { icon: "group", label: "User Directory", href: "/state/users" },
  { icon: "map", label: "State Map", href: "/state/map" },
  { icon: "analytics", label: "Analytics", href: "/state/analytics" },
  { icon: "notifications", label: "Alerts", href: "/state/notifications" },
  { icon: "person", label: "Profile", href: "/state/profile" },
];

export function StateAdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [escalations, setEscalations] = useState<Complaint[]>([]);

  async function loadData() {
    const [allList, escList] = await Promise.all([
      getComplaints({}),
      getComplaints({ isEscalated: true }),
    ]);
    setComplaints(allList);
    setEscalations(escList);
  }

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToComplaints(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending' || c.status === 'assigned').length;
  const resolved = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const escalationsCount = escalations.length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const districtChartData = useMemo(() => {
    const map = new Map<string, { Resolved: number; Pending: number }>();
    for (const c of complaints) {
      const dName = c.districtName || 'Other';
      const curr = map.get(dName) || { Resolved: 0, Pending: 0 };
      if (c.status === 'resolved' || c.status === 'closed') curr.Resolved++;
      else curr.Pending++;
      map.set(dName, curr);
    }
    return Array.from(map.entries()).map(([name, counts]) => ({
      name,
      Resolved: counts.Resolved,
      Pending: counts.Pending,
    }));
  }, [complaints]);

  return (
    <DashboardLayout
      title="State Secretariat Administration"
      subtitle={`${user?.territory?.state || 'Telangana'} · Statewide Redressal Overview`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || "State Admin"}
      userRole="State Admin"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          <Link to="/state/complaints">
            <Button variant="primary" size="sm" icon="assignment">View All Complaints ({total})</Button>
          </Link>
        </div>
      }
    >
      {/* State-wide Live KPIs */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <KPICard label="Statewide Cases" value={total} icon="assignment" />
        <KPICard label="Pending Action" value={pending} icon="pending" variant="warning" />
        <KPICard label="Tier 2 Escalations" value={escalationsCount} icon="warning" variant="critical" badge={escalationsCount > 0 ? "Secretariat Alert" : undefined} animate={escalationsCount > 0} />
        <KPICard label="Overall Resolution" value={`${resolutionRate}%`} icon="check_circle" variant="success" />
      </div>

      {/* District Comparison Bar Chart */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-on-surface">District-wise Redressal Volume</h3>
            <span className="text-xs sm:text-sm text-on-surface-variant">Live volume by district</span>
          </div>
          <div className="h-56 w-full">
            {districtChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">
                No complaints registered yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '10px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Resolved" fill="#002045" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pending" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Executive Action Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1">Administrative Governance</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mb-4">Access control & system policies</p>
            <div className="flex flex-col gap-3 text-sm">
              <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between">
                <span>Active Registered Grievances</span>
                <strong className="font-bold text-on-surface">{total}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between">
                <span>Statutory Resolution Rate</span>
                <strong className="text-emerald-700 font-bold">{resolutionRate}%</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between">
                <span>Escalated Grievances</span>
                <strong className="text-rose-700 font-bold">{escalationsCount}</strong>
              </div>
            </div>
          </div>
          <Link to="/state/users" className="mt-4">
            <Button variant="outline" size="sm" fullWidth icon="group">Manage User Roles</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
