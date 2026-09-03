import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/common/Icon";
import { PageTransition } from "@/components/common/PageTransition";

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
  href: string;
}

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  children,
  navItems,
  userName,
  userRole,
  headerActions,
}: DashboardLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-surface flex">
      {/* Sidebar */}
      <aside
        aria-label="Sidebar navigation"
        className="w-64 bg-surface-container-lowest shadow-sidebar flex flex-col sticky top-0 h-screen max-h-screen h-[100dvh] max-h-[100dvh] border-r border-outline-variant/60 flex-shrink-0 z-20 select-none"
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-outline-variant/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm transition-transform hover:scale-105 duration-200">
              <Icon name="account_balance" className="text-on-primary" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-base text-on-surface leading-tight">CivicConnect</p>
              <p className="text-xs font-semibold text-primary truncate leading-tight mt-0.5">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <nav
          aria-label="Main navigation"
          className="flex-1 min-h-0 px-3 py-4 sidebar-scroll"
        >
          <ul className="space-y-1 pb-2">
            {navItems.map((item) => {
              const isActive = item.active || location.pathname === item.href || (item.href !== '/mandal' && item.href !== '/district' && item.href !== '/state' && location.pathname.startsWith(item.href));
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold ${
                      isActive
                        ? "bg-primary text-on-primary shadow-sm font-bold translate-x-1"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:translate-x-0.5"
                    }`}
                  >
                    <Icon name={item.icon} size={20} className={`transition-colors duration-200 ${isActive ? "text-on-primary" : "text-on-surface-variant"}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className="px-4 py-4 border-t border-outline-variant/60 bg-surface-container-low/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <Icon name="verified_user" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-on-surface truncate leading-tight">{userName}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <header className="bg-surface-container-lowest/95 backdrop-blur-md shadow-header px-4 sm:px-6 md:px-8 h-18 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 border-b border-outline-variant/40">
          <div className="animate-fade-in min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-sm text-on-surface-variant leading-tight truncate mt-0.5">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-3 animate-fade-in flex-shrink-0">{headerActions}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-surface">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
