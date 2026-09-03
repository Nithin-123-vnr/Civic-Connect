import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { InteractiveMapView } from '@/components/map/InteractiveMapView';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { getComplaints, subscribeToComplaints } from '@/lib/complaintService';
import { isValidTelanganaCoordinate } from '@/lib/geoUtils';
import type { Complaint, ComplaintCategory, ComplaintStatus, ComplaintPriority } from '@/types';

export function DistrictMapViewScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMandal, setSelectedMandal] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/district' },
    { icon: 'assignment', label: t('complaints'), href: '/district/complaints' },
    { icon: 'warning', label: t('escalations'), href: '/district/escalations' },
    { icon: 'map', label: t('mapView'), active: true, href: '/district/map' },
    { icon: 'analytics', label: t('analytics'), href: '/district/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/district/notifications' },
    { icon: 'person', label: t('profile'), href: '/district/profile' },
  ];

  const districtName = user?.territory?.district || 'Hyderabad';

  async function loadComplaints() {
    setLoading(true);
    const filter = { districtName: user?.territory?.district };
    const list = await getComplaints(filter);
    setComplaints(list);
    setLoading(false);
  }

  useEffect(() => {
    if (user) {
      loadComplaints();
    }
    const unsubscribe = subscribeToComplaints(() => {
      if (user) {
        loadComplaints();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [user]);

  const mandals: string[] = useMemo(() => {
    const set = new Set(complaints.map(c => c.mandalName).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (selectedMandal !== 'all' && c.mandalName !== selectedMandal) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase().trim();
        const matches =
          c.title.toLowerCase().includes(s) ||
          c.referenceId.toLowerCase().includes(s) ||
          c.mandalName.toLowerCase().includes(s) ||
          (c.areaName && c.areaName.toLowerCase().includes(s));
        if (!matches) return false;
      }
      return true;
    });
  }, [complaints, selectedMandal, statusFilter, priorityFilter, categoryFilter, search]);

  const validGeoCount = useMemo(() => {
    return filteredComplaints.filter(c => isValidTelanganaCoordinate(c.location?.lat, c.location?.lng)).length;
  }, [filteredComplaints]);

  const unmappedCount = filteredComplaints.length - validGeoCount;

  return (
    <DashboardLayout
      title="District Geospatial Incident Map"
      subtitle={`${districtName} District · Incident Density & Infrastructure Map`}
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'District Officer'}
      userRole="District Officer"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Button variant="primary" size="sm" icon="refresh" onClick={loadComplaints} isLoading={loading}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 h-full">
        {/* District Map Filters Toolbar */}
        <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search District cases..."
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-outline-variant bg-surface text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Mandal Selector */}
            <select
              value={selectedMandal}
              onChange={e => setSelectedMandal(e.target.value)}
              className="h-9 px-2.5 rounded-xl border border-outline-variant bg-surface text-xs font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Mandals ({mandals.length})</option>
              {mandals.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-2.5 rounded-xl border border-outline-variant bg-surface text-xs font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="h-9 px-2.5 rounded-xl border border-outline-variant bg-surface text-xs font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* District Metric Stats */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-surface font-bold text-on-surface border border-outline-variant/60">
              Total: {filteredComplaints.length}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
              Mapped: {validGeoCount}
            </span>
            {unmappedCount > 0 && (
              <span
                title={`${unmappedCount} complaint(s) in this district have no GPS coordinates and remain accessible in the District Complaints Repository.`}
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-300 flex items-center gap-1 cursor-help"
              >
                <Icon name="info" size={13} />
                Unmapped: {unmappedCount}
              </span>
            )}
          </div>
        </div>

        {/* Real Interactive Map Canvas */}
        <div className="h-[calc(100vh-16rem)] h-[calc(100dvh-16rem)] min-h-[480px] rounded-2xl overflow-hidden border border-outline-variant">
          <InteractiveMapView
            complaints={filteredComplaints}
            portalType="district"
            height="100%"
            activeCategoryFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
            jurisdictionDistrict={districtName}
            onSelectComplaint={(c) => navigate(`/district/complaints?ref=${c.referenceId}`)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
