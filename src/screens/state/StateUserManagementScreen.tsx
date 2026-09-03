import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { getOfficerProfiles, updateUserProfile } from '@/lib/userService';
import { TELANGANA_DISTRICTS } from '@/data/jurisdictions/telanganaData';
import { supabase } from '@/lib/supabase';
import type { AppUser } from '@/types/auth';
import type { Role } from '@/types';

export function StateUserManagementScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { icon: 'dashboard', label: t('dashboard'), href: '/state' },
    { icon: 'assignment', label: t('complaints'), href: '/state/complaints' },
    { icon: 'warning', label: t('escalations'), href: '/state/escalations' },
    { icon: 'group', label: t('userDirectory'), active: true, href: '/state/users' },
    { icon: 'map', label: t('mapView'), href: '/state/map' },
    { icon: 'analytics', label: t('analytics'), href: '/state/analytics' },
    { icon: 'notifications', label: t('alerts'), href: '/state/notifications' },
    { icon: 'person', label: t('profile'), href: '/state/profile' },
  ];

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Officer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'mandal_officer' as Role,
    district: 'Hyderabad',
    mandal: 'Shaikpet',
  });

  const loadDirectory = async () => {
    setLoading(true);
    const profiles = await getOfficerProfiles();
    setUsers(profiles);
    setLoading(false);
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const handleToggleStatus = async (targetUser: AppUser) => {
    if (targetUser.uid === user?.uid) {
      setNotificationMsg({ type: 'error', text: 'You cannot suspend your own State Admin administrator account.' });
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    try {
      setActionLoadingId(targetUser.uid);
      const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
      await updateUserProfile(targetUser.uid, { status: newStatus });

      setUsers(prev => prev.map(u => (u.uid === targetUser.uid ? { ...u, status: newStatus } : u)));
      setNotificationMsg({
        type: 'success',
        text: `Officer ${targetUser.fullName} status updated to ${newStatus.toUpperCase()} successfully.`,
      });
    } catch (err: any) {
      setNotificationMsg({ type: 'error', text: err.message || 'Failed to update user status.' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const handleAddOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Please fill in all required officer details.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    try {
      setFormSubmitting(true);

      // Call provision-officer Edge Function
      const { data, error } = await supabase.functions.invoke('provision-officer', {
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: formData.role,
          stateName: 'Telangana',
          districtName: formData.district,
          mandalName: formData.role === 'mandal_officer' ? formData.mandal : undefined,
        },
      });

      if (error || (data && !data.success)) {
        throw new Error(error?.message || data?.error || 'Failed to provision officer account.');
      }

      setNotificationMsg({
        type: 'success',
        text: `Officer ${formData.fullName} (${formData.role.replace('_', ' ')}) provisioned successfully!`,
      });

      setShowAddModal(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'mandal_officer',
        district: 'Hyderabad',
        mandal: 'Shaikpet',
      });

      await loadDirectory();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while provisioning the officer.');
    } finally {
      setFormSubmitting(false);
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const sortedDistricts = useMemo(() => {
    return [...TELANGANA_DISTRICTS].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (u.role === 'citizen') return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (districtFilter !== 'all') {
        const d = (u.territory?.district || '').trim().toLowerCase();
        if (d !== districtFilter.trim().toLowerCase() && u.role !== 'state_admin') {
          return false;
        }
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        const match =
          u.fullName.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.territory?.name || '').toLowerCase().includes(s) ||
          (u.territory?.district || '').toLowerCase().includes(s) ||
          (u.territory?.mandal || '').toLowerCase().includes(s);
        if (!match) return false;
      }
      return true;
    });
  }, [users, roleFilter, districtFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <DashboardLayout
      title="User & Officer Directory"
      subtitle="Role assignment, administrative jurisdiction mapping, and access governance"
      navItems={NAV_ITEMS}
      userName={user?.fullName || 'State Admin'}
      userRole="State Admin"
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout}>
            {t('logout')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon="person_add"
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
          >
            Add Officer
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Notification Toast */}
        {notificationMsg && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold shadow-sm animate-slide-down ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name={notificationMsg.type === 'success' ? 'check_circle' : 'error'} size={18} className={notificationMsg.type === 'success' ? 'animate-success-pop text-emerald-600' : 'text-rose-600'} />
              <span>{notificationMsg.text}</span>
            </div>
            <button onClick={() => setNotificationMsg(null)} className="text-current opacity-70 hover:opacity-100">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        {/* Security Alert Banner */}
        <div className="p-5 rounded-2xl bg-primary-container/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
              <Icon name="admin_panel_settings" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">Authoritative Telangana Officer Registry</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Full officer directory covering all 33 Telangana districts and 612 mandals. Profiles and jurisdiction boundaries are strictly enforced via PostgreSQL RLS.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm flex-shrink-0 shadow-sm">
            645 Officers Provisioned
          </span>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Icon name="search" size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search officer by name, email, district, or mandal..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface text-sm font-medium text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={e => {
                setDistrictFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer shadow-sm"
            >
              <option value="all">All Districts (33)</option>
              {sortedDistricts.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer shadow-sm"
            >
              <option value="all">All Roles ({users.filter(u => u.role !== 'citizen').length})</option>
              <option value="state_admin">State Admin (1)</option>
              <option value="district_officer">District Officers ({users.filter(u => u.role === 'district_officer').length})</option>
              <option value="mandal_officer">Mandal Officers ({users.filter(u => u.role === 'mandal_officer').length})</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          <div className="table-touch-scroll">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/60 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-3.5">Officer Name & Email</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Designated Jurisdiction</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Available Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                      <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                      <p>Loading authoritative profiles from Supabase database...</p>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                      No officer accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map(u => {
                    const isSelf = u.uid === user?.uid;
                    const isActive = u.status === 'active';
                    const isProcessing = actionLoadingId === u.uid;

                    return (
                      <tr key={u.uid} className="hover:bg-surface-container/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-1.5">
                            {u.fullName}
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-on-surface-variant text-xs font-mono mt-0.5">{u.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-bold text-xs capitalize">
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-sm text-on-surface">
                          {u.role === 'state_admin'
                            ? 'State of Telangana (Apex)'
                            : u.role === 'district_officer'
                            ? `${u.territory?.district || 'Hyderabad'} District`
                            : `${u.territory?.mandal || 'Shaikpet'} Mandal · ${u.territory?.district || 'Hyderabad'}`}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-bold text-xs inline-flex items-center gap-1.5 ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            {isActive ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {isSelf ? (
                            <span className="text-xs text-on-surface-variant font-medium italic">
                              Current Administrator
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleToggleStatus(u)}
                              className={
                                isActive
                                  ? 'text-error hover:bg-error-container/20 font-bold text-xs'
                                  : 'text-emerald-700 hover:bg-emerald-100 font-bold text-xs'
                              }
                            >
                              {isProcessing ? (
                                'Updating...'
                              ) : isActive ? (
                                <>
                                  <Icon name="block" size={16} className="mr-1" /> Suspend
                                </>
                              ) : (
                                <>
                                  <Icon name="check_circle" size={16} className="mr-1" /> Reactivate
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filtered.length > pageSize && (
            <div className="px-5 py-3.5 bg-surface-container-low/60 border-t border-outline-variant/60 flex items-center justify-between text-xs sm:text-sm text-on-surface-variant font-medium">
              <span>
                Showing <strong>{(page - 1) * pageSize + 1}</strong> to <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> officers
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  icon="chevron_left"
                >
                  Previous
                </Button>
                <span className="font-bold px-2 text-on-surface text-xs sm:text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  icon="chevron_right"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add Officer Modal (Portaled & Centered) */}
        {showAddModal && (
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            maxWidth="lg"
            title="Provision Government Officer"
            subtitle="Create official credentials with designated jurisdiction"
            icon={<Icon name="person_add" size={20} />}
          >
            <form onSubmit={handleAddOfficerSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                  <Icon name="error" size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Radhika, IAS"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. radhika.collector@gov.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Designation Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="mandal_officer">Mandal Officer</option>
                    <option value="district_officer">District Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    District Jurisdiction *
                  </label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Ranga Reddy">Ranga Reddy</option>
                    <option value="Medchal-Malkajgiri">Medchal-Malkajgiri</option>
                    <option value="Warangal">Warangal</option>
                    <option value="Karimnagar">Karimnagar</option>
                  </select>
                </div>
              </div>

              {formData.role === 'mandal_officer' && (
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Mandal / Sub-District *
                  </label>
                  <select
                    value={formData.mandal}
                    onChange={e => setFormData({ ...formData, mandal: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Shaikpet">Shaikpet</option>
                    <option value="Khairatabad">Khairatabad</option>
                    <option value="Ameerpet">Ameerpet</option>
                    <option value="Jubilee Hills">Jubilee Hills</option>
                    <option value="Secunderabad">Secunderabad</option>
                    <option value="Kukatpally">Kukatpally</option>
                    <option value="Rajendranagar">Rajendranagar</option>
                  </select>
                </div>
              )}

              <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={formSubmitting}
                  icon={formSubmitting ? undefined : "person_add"}
                >
                  {formSubmitting ? 'Provisioning Account...' : 'Provision Officer'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
