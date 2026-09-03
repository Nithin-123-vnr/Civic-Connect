import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notificationService';
import type { Notification } from '@/types';

export function OfficerAlertsScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'escalations' | 'assignments'>('all');
  const [loading, setLoading] = useState(true);

  const role = user?.role || 'mandal_officer';

  const roleMeta = {
    mandal_officer: {
      title: 'Mandal Officer Alerts & Notifications',
      subtitle: `${user?.territory?.mandal || 'Shaikpet'} Mandal · Real-time Operational Alerts`,
      roleLabel: 'Mandal Officer',
      complaintsPath: '/mandal/complaints',
      navItems: [
        { icon: 'dashboard', label: t('dashboard'), href: '/mandal' },
        { icon: 'assignment', label: t('complaints'), href: '/mandal/complaints' },
        { icon: 'map', label: t('mapView'), href: '/mandal/map' },
        { icon: 'analytics', label: t('analytics'), href: '/mandal/analytics' },
        { icon: 'notifications', label: t('alerts'), active: true, href: '/mandal/notifications' },
        { icon: 'person', label: t('profile'), href: '/mandal/profile' },
      ],
    },
    district_officer: {
      title: 'District Collectorate Alerts & Escalations',
      subtitle: `${user?.territory?.district || 'Hyderabad'} District · Inter-Mandal Alerts`,
      roleLabel: 'District Officer',
      complaintsPath: '/district/complaints',
      escalationPath: '/district/escalations',
      navItems: [
        { icon: 'dashboard', label: t('dashboard'), href: '/district' },
        { icon: 'assignment', label: t('complaints'), href: '/district/complaints' },
        { icon: 'warning', label: t('escalations'), href: '/district/escalations' },
        { icon: 'map', label: t('mapView'), href: '/district/map' },
        { icon: 'analytics', label: t('analytics'), href: '/district/analytics' },
        { icon: 'notifications', label: t('alerts'), active: true, href: '/district/notifications' },
        { icon: 'person', label: t('profile'), href: '/district/profile' },
      ],
    },
    state_admin: {
      title: 'State Secretariat Governance Alerts',
      subtitle: `${user?.territory?.state || 'Telangana'} · Apex Escalation & Security Alerts`,
      roleLabel: 'State Admin',
      complaintsPath: '/state/complaints',
      escalationPath: '/state/escalations',
      navItems: [
        { icon: 'dashboard', label: t('dashboard'), href: '/state' },
        { icon: 'assignment', label: t('complaints'), href: '/state/complaints' },
        { icon: 'warning', label: t('escalations'), href: '/state/escalations' },
        { icon: 'group', label: t('userDirectory'), href: '/state/users' },
        { icon: 'map', label: t('mapView'), href: '/state/map' },
        { icon: 'analytics', label: t('analytics'), href: '/state/analytics' },
        { icon: 'notifications', label: t('alerts'), active: true, href: '/state/notifications' },
        { icon: 'person', label: t('profile'), href: '/state/profile' },
      ],
    },
  };

  const currentMeta = roleMeta[role as keyof typeof roleMeta] || roleMeta.mandal_officer;

  useEffect(() => {
    async function loadAlerts() {
      if (!user?.uid) return;
      setLoading(true);
      const data = await getNotifications(user.uid);
      setNotifications(data);
      setLoading(false);
    }
    loadAlerts();
  }, [user?.uid]);

  const handleMarkAllRead = async () => {
    if (!user?.uid) return;
    await markAllNotificationsAsRead(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleAlertClick = async (item: Notification) => {
    if (!item.isRead) {
      await markNotificationAsRead(item.id);
      setNotifications(prev => prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n)));
    }

    const ref = item.complaintRef;
    if (item.type === 'complaint_escalated' && ('escalationPath' in currentMeta)) {
      navigate(ref ? `${currentMeta.escalationPath}?ref=${ref}` : currentMeta.escalationPath);
    } else if (ref) {
      navigate(`${currentMeta.complaintsPath}?ref=${ref}`);
    } else {
      navigate(currentMeta.complaintsPath);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'escalations') return n.type === 'complaint_escalated';
    if (filter === 'assignments') return n.type === 'complaint_assigned';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout
      title={currentMeta.title}
      subtitle={currentMeta.subtitle}
      navItems={currentMeta.navItems}
      userName={user?.fullName || currentMeta.roleLabel}
      userRole={currentMeta.roleLabel}
      headerActions={
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" icon="done_all" onClick={handleMarkAllRead}>
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={logout} icon="logout">
            {t('logout')}
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl flex flex-col gap-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-card flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('escalations')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                filter === 'escalations'
                  ? 'bg-error text-on-error shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Escalations
            </button>
            <button
              onClick={() => setFilter('assignments')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                filter === 'assignments'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Assignments
            </button>
          </div>

          <span className="text-xs sm:text-sm text-on-surface-variant">
            Live stream: <strong className="text-emerald-700 font-bold">Connected to Supabase Realtime</strong>
          </span>
        </div>

        {/* Notifications List */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-on-surface-variant">
              <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p>Loading real-time notifications from database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-on-surface-variant">
              <Icon name="notifications_off" size={40} className="text-on-surface-variant/40 mx-auto mb-3" />
              <p className="font-bold text-base text-on-surface mb-1">No alerts found</p>
              <p className="text-xs sm:text-sm">You have no pending notifications matching the selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/40">
              {filtered.map(item => {
                const isEscalation = item.type === 'complaint_escalated';
                const isAssignment = item.type === 'complaint_assigned';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAlertClick(item)}
                    className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                      !item.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-container/40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isEscalation
                          ? 'bg-error-container text-error'
                          : isAssignment
                          ? 'bg-primary-container/30 text-primary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <Icon
                        name={
                          isEscalation
                            ? 'warning'
                            : isAssignment
                            ? 'assignment_ind'
                            : 'notifications'
                        }
                        size={20}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-bold text-sm sm:text-base text-on-surface truncate flex items-center gap-2">
                          {item.title}
                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </h4>
                        <span className="text-xs text-on-surface-variant flex-shrink-0 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-2">
                        {item.body}
                      </p>

                      <div className="flex items-center gap-3 text-xs">
                        {item.complaintRef && (
                          <span className="font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                            {item.complaintRef}
                          </span>
                        )}
                        <span className="text-primary font-bold hover:underline flex items-center gap-1">
                          Inspect in Queue <Icon name="arrow_forward" size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
