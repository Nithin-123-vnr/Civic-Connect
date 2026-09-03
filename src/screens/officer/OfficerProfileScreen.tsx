import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, type SupportedLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';

export function OfficerProfileScreen() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slaSms, setSlaSms] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const role = user?.role || 'mandal_officer';

  const roleMeta = {
    mandal_officer: {
      title: 'Mandal Officer Profile',
      badge: 'Mandal Officer',
      roleLabel: 'Mandal Officer',
      subtitle: `${user?.territory?.mandal || 'Shaikpet'} Mandal · ${user?.territory?.district || 'Hyderabad'} District`,
      jurisdictionHeader: 'Designated Mandal Jurisdiction',
      navItems: [
        { icon: 'dashboard', label: t('dashboard'), href: '/mandal' },
        { icon: 'assignment', label: t('complaints'), href: '/mandal/complaints' },
        { icon: 'map', label: t('mapView'), href: '/mandal/map' },
        { icon: 'analytics', label: t('analytics'), href: '/mandal/analytics' },
        { icon: 'notifications', label: t('alerts'), href: '/mandal/notifications' },
        { icon: 'person', label: t('profile'), active: true, href: '/mandal/profile' },
      ],
      scope: [
        { label: 'State', value: user?.territory?.state || 'Telangana' },
        { label: 'District', value: user?.territory?.district || 'Hyderabad' },
        { label: 'Mandal / Sub-District', value: user?.territory?.mandal || 'Shaikpet' },
        { label: 'Administrative Level', value: 'Mandal Revenue & Public Works' },
      ],
      privileges: [
        'Direct grievance investigation and site verification',
        'Field contractor / maintenance crew assignment',
        'Status progression (In Progress / Resolved / Rejected)',
        'Citizen feedback review and resolution sign-off',
      ],
    },
    district_officer: {
      title: 'District Officer Profile',
      badge: 'District Officer',
      roleLabel: 'District Officer',
      subtitle: `${user?.territory?.district || 'Hyderabad'} District · ${user?.territory?.state || 'Telangana'}`,
      jurisdictionHeader: 'District Collectorate Jurisdiction',
      navItems: [
        { icon: 'dashboard', label: t('dashboard'), href: '/district' },
        { icon: 'assignment', label: t('complaints'), href: '/district/complaints' },
        { icon: 'warning', label: t('escalations'), href: '/district/escalations' },
        { icon: 'map', label: t('mapView'), href: '/district/map' },
        { icon: 'analytics', label: t('analytics'), href: '/district/analytics' },
        { icon: 'notifications', label: t('alerts'), href: '/district/notifications' },
        { icon: 'person', label: t('profile'), active: true, href: '/district/profile' },
      ],
      scope: [
        { label: 'State', value: user?.territory?.state || 'Telangana' },
        { label: 'District', value: user?.territory?.district || 'Hyderabad' },
        { label: 'Mandals under Jurisdiction', value: 'All District Mandals (33 Mandals)' },
        { label: 'Administrative Level', value: 'District Collectorate Grievance Cell' },
      ],
      privileges: [
        'District-wide grievance oversight and inter-department routing',
        'Tier-1 SLA escalation handling and executive override',
        'Mandal officer workload distribution and performance auditing',
        'District analytics reporting and compliance sign-off',
      ],
    },
    state_admin: {
      title: 'State Admin Profile',
      badge: 'State Administrator',
      roleLabel: 'State Admin',
      subtitle: `${user?.territory?.state || 'Telangana'} · Apex Secretariat Administration`,
      jurisdictionHeader: 'State Secretariat Governance Authority',
      navItems: [
        { icon: 'dashboard', label: t('dashboard'), href: '/state' },
        { icon: 'assignment', label: t('complaints'), href: '/state/complaints' },
        { icon: 'warning', label: t('escalations'), href: '/state/escalations' },
        { icon: 'group', label: t('userDirectory'), href: '/state/users' },
        { icon: 'map', label: t('mapView'), href: '/state/map' },
        { icon: 'analytics', label: t('analytics'), href: '/state/analytics' },
        { icon: 'notifications', label: t('alerts'), href: '/state/notifications' },
        { icon: 'person', label: t('profile'), active: true, href: '/state/profile' },
      ],
      scope: [
        { label: 'State', value: 'Telangana (Apex Authority)' },
        { label: 'Districts Governed', value: 'All 33 Telangana Districts' },
        { label: 'Mandals Covered', value: 'All 594 Mandals & Municipalities' },
        { label: 'Administrative Level', value: 'State Secretariat Public Redressal Authority' },
      ],
      privileges: [
        'Full administrative provisioning of District and Mandal officers',
        'Tier-2 critical escalation monitoring and ministerial dispatch',
        'Statewide grievance database governance and policy enforcement',
        'Database access auditing and RBAC privilege configuration',
      ],
    },
  };

  const currentMeta = roleMeta[role as keyof typeof roleMeta] || roleMeta.mandal_officer;

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <DashboardLayout
      title={currentMeta.title}
      subtitle={currentMeta.subtitle}
      navItems={currentMeta.navItems}
      userName={user?.fullName || currentMeta.roleLabel}
      userRole={currentMeta.roleLabel}
      headerActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={logout} icon="logout">
            {t('logout')}
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl flex flex-col gap-6">
        {/* Success Toast */}
        {savedToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2.5 text-xs font-bold shadow-sm animate-in fade-in">
            <Icon name="check_circle" size={18} className="text-emerald-600" />
            <span>Portal preferences updated successfully.</span>
          </div>
        )}

        {/* Identity & Credentials Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
              <Icon name="admin_panel_settings" size={36} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-on-surface">{user?.fullName || 'Government Officer'}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {t('activeStatus')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant font-mono">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-primary-container/20 text-primary text-xs font-bold">
                  {currentMeta.badge}
                </span>
                <span className="text-xs text-on-surface-variant">
                  UID: <span className="font-mono text-xs">{user?.uid.substring(0, 12)}...</span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-outline-variant/60 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm">
              <span className="text-on-surface-variant font-medium text-xs">Authentication Provider:</span>
              <span className="font-bold text-on-surface flex items-center gap-1.5 text-sm">
                <Icon name="verified" size={16} className="text-primary" /> Supabase GoTrue Auth (Production)
              </span>
              <span className="text-xs text-on-surface-variant mt-1">
                Database Role: <strong className="text-primary uppercase font-mono">{user?.role}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Official Jurisdiction Scope */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="map" size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              {currentMeta.jurisdictionHeader}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {currentMeta.scope.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-surface-container/60 border border-outline-variant/40">
                <span className="text-on-surface-variant block text-xs font-semibold uppercase tracking-wider mb-1">
                  {s.label}
                </span>
                <strong className="text-on-surface text-sm font-bold block">{s.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* System Access & Privileges */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="security" size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              {t('systemPrivileges')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentMeta.privileges.map((p, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm p-3 rounded-xl bg-surface-container/40">
                <Icon name="check_circle" size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-on-surface font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences & Language Setting (Fixed Visibility & Readable Contrast) */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="tune" size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              {t('portalPreferences')}
            </h3>
          </div>

          <div className="flex flex-col divide-y divide-outline-variant/60">
            {/* Language Selection with Clear High-Contrast Options */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="font-bold text-sm text-on-surface block mb-0.5">
                  {t('selectLanguage')}
                </label>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  Select your preferred interface language for government dashboards and forms.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value as SupportedLanguage)}
                  className="h-11 px-3.5 rounded-xl border-2 border-primary/40 bg-surface font-bold text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
                >
                  <option value="en" className="font-bold py-1">English (US)</option>
                  <option value="te" className="font-bold py-1">తెలుగు (Telugu)</option>
                  <option value="hi" className="font-bold py-1">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-on-surface block mb-0.5">Critical SLA Breach Email Notifications</span>
                <p className="text-xs sm:text-sm text-on-surface-variant">Receive high-priority email alerts when grievances in your jurisdiction breach statutory SLA.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={e => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-on-surface block mb-0.5">Automated SMS / Dispatch Alerts</span>
                <p className="text-xs sm:text-sm text-on-surface-variant">Receive automated notifications on new citizen grievance assignments.</p>
              </div>
              <input
                type="checkbox"
                checked={slaSms}
                onChange={e => setSlaSms(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
