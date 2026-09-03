import { useState, useMemo, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, roleHomeRoute } from '@/contexts/AuthContext';
import { Icon } from '@/components/common/Icon';
import { CivicHeroIllustration } from '@/components/common/BrandLogo';
import {
  getDistricts,
  getAdministrativeUnits,
  getAdministrativeUnitLabel
} from '@/lib/jurisdictionService';
import type { Role } from '@/types';

interface DesignationOption {
  id: Role;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeBg: string;
  portalDesc: string;
}

const DESIGNATIONS: DesignationOption[] = [
  {
    id: 'citizen',
    title: '1. User / Citizen',
    subtitle: 'File grievances, track redressal status, and provide feedback on public works.',
    icon: 'person',
    badge: 'Citizen Access',
    badgeBg: 'bg-blue-50 text-blue-600 border-blue-200/60',
    portalDesc: 'Citizen Grievance Redressal Portal',
  },
  {
    id: 'mandal_officer',
    title: '2. Mandal Officer',
    subtitle: 'Mandal-level ground inspection, complaint actioning, and field resolution.',
    icon: 'domain',
    badge: 'Mandal Level',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    portalDesc: 'Mandal Revenue & Public Works Portal',
  },
  {
    id: 'district_officer',
    title: '3. District Officer',
    subtitle: 'District Collectorate oversight, inter-mandal coordination, and SLA monitoring.',
    icon: 'shield',
    badge: 'District Level',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
    portalDesc: 'District Collectorate Oversight Portal',
  },
  {
    id: 'state_admin',
    title: '4. State Officer / State Admin',
    subtitle: 'Apex state administration, policy governance, escalations, and officer provisioning.',
    icon: 'admin_panel_settings',
    badge: 'Apex State Admin',
    badgeBg: 'bg-purple-50 text-purple-600 border-purple-200/60',
    portalDesc: 'Telangana State Apex Governance Portal',
  },
];

export function LoginScreen() {
  const { login, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname;

  // Step 1: Designation
  const [selectedDesignation, setSelectedDesignation] = useState<Role | null>(null);

  // Step 2: Jurisdiction Fields — state is always Telangana
  const selectedState = 'telangana'; // Locked
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedMandal, setSelectedMandal] = useState<string>('');

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Dynamic Geographic Lists
  const districtsList = useMemo(() => {
    return getDistricts('telangana');
  }, []);

  const mandalsList = useMemo(() => {
    if (!selectedDistrict) return [];
    return getAdministrativeUnits('telangana', selectedDistrict);
  }, [selectedDistrict]);

  const unitLabel = useMemo(() => {
    return getAdministrativeUnitLabel('telangana');
  }, []);

  const currentDesignation = DESIGNATIONS.find(d => d.id === selectedDesignation);

  const handleSelectDesignation = (role: Role) => {
    setSelectedDesignation(role);
    setSelectedDistrict('');
    setSelectedMandal('');
    clearError();
    setLocalError('');
  };

  const handleBackToDesignations = () => {
    setSelectedDesignation(null);
    clearError();
    setLocalError('');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedMandal('');
    clearError();
    setLocalError('');
  };

  const isFormValid = useMemo(() => {
    if (!selectedDesignation || !email.trim() || !password) return false;

    if (selectedDesignation === 'mandal_officer') {
      return Boolean(selectedDistrict && selectedMandal);
    }
    if (selectedDesignation === 'district_officer') {
      return Boolean(selectedDistrict);
    }
    if (selectedDesignation === 'state_admin') {
      return true;
    }
    return true; // Citizen
  }, [selectedDesignation, selectedDistrict, selectedMandal, email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDesignation || !isFormValid) return;

    clearError();
    setLocalError('');
    setSubmitting(true);

    try {
      const stateName = 'Telangana';

      const profile = await login({
        email: email.trim(),
        password,
        designatedRole: selectedDesignation,
        jurisdiction: {
          stateId: selectedState,
          stateName,
          districtName: selectedDistrict,
          mandalName: selectedMandal,
          administrativeUnitName: selectedMandal,
        },
      });

      const destination = from ?? roleHomeRoute(profile.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#e3f0fb] via-[#edf6fd] to-[#e4f0fa] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* 1. Background City Silhouette & Cloud Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-between">
        {/* Top Atmosphere Clouds */}
        <div className="w-full h-48 bg-gradient-to-b from-white/60 to-transparent" />

        {/* Bottom City Skyline Silhouettes */}
        <div className="w-full relative h-64 opacity-30">
          <svg viewBox="0 0 1440 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full h-full preserve-3d">
            {/* Layer 1: Distant City */}
            <path d="M 0 280 L 0 190 L 40 190 L 40 160 L 70 160 L 70 200 L 110 200 L 110 140 L 140 140 L 140 170 L 170 170 L 170 130 L 190 100 L 210 130 L 210 180 L 260 180 L 260 150 L 300 150 L 300 190 L 360 190 L 360 120 L 390 90 L 420 120 L 420 170 L 480 170 L 480 140 L 520 140 L 520 190 L 580 190 L 580 160 L 620 160 L 620 130 L 650 130 L 650 180 L 710 180 L 710 110 L 740 80 L 770 110 L 770 160 L 830 160 L 830 130 L 870 130 L 870 180 L 930 180 L 930 150 L 970 150 L 970 190 L 1030 190 L 1030 120 L 1060 90 L 1090 120 L 1090 170 L 1150 170 L 1150 140 L 1190 140 L 1190 190 L 1250 190 L 1250 160 L 1290 160 L 1290 130 L 1330 130 L 1330 180 L 1390 180 L 1390 150 L 1440 150 L 1440 280 Z" fill="#93c5fd" opacity="0.4" />
            {/* Layer 2: Closer Buildings */}
            <path d="M 0 280 L 0 220 L 60 220 L 60 180 L 100 180 L 100 230 L 160 230 L 160 170 L 200 170 L 200 210 L 250 210 L 250 160 L 290 160 L 290 220 L 350 220 L 350 180 L 400 180 L 400 230 L 470 230 L 470 160 L 510 160 L 510 210 L 570 210 L 570 170 L 610 170 L 610 230 L 680 230 L 680 150 L 730 150 L 730 210 L 800 210 L 800 170 L 850 170 L 850 220 L 920 220 L 920 160 L 970 160 L 970 210 L 1040 210 L 1040 170 L 1090 170 L 1090 230 L 1160 230 L 1160 160 L 1210 160 L 1210 210 L 1280 210 L 1280 180 L 1340 180 L 1340 220 L 1440 220 L 1440 280 Z" fill="#60a5fa" opacity="0.3" />
          </svg>
        </div>
      </div>

      {/* 2. Main Centered 2-Column Desktop Grid Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 py-6 animate-slide-up">
        {/* LEFT COLUMN: CivicConnect Branding Artwork Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md lg:max-w-lg transition-transform hover:scale-[1.02] duration-300">
          <CivicHeroIllustration size={370} />
        </div>

        {/* RIGHT COLUMN: The Elevated Designation & Authentication Card */}
        <div className="w-full max-w-[460px] flex-shrink-0">
          <div className="bg-white rounded-[32px] shadow-[0_25px_60px_rgba(0,32,69,0.12)] border border-slate-100 p-6 sm:p-8 relative transition-all duration-300">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {selectedDesignation ? (
                  <button
                    type="button"
                    onClick={handleBackToDesignations}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
                    title="Change Designation"
                    aria-label="Back to designation selection"
                  >
                    <Icon name="arrow_back" size={18} />
                  </button>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#002045] flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-transform hover:scale-105">
                    <Icon name="account_balance" size={18} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">CivicConnect</h3>
                  <p className="text-[11px] text-slate-500 leading-tight">Government Grievance Redressal</p>
                </div>
              </div>

              {selectedDesignation && (
                <button
                  type="button"
                  onClick={handleBackToDesignations}
                  className="text-xs font-semibold text-[#002045] hover:underline px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 transition-colors"
                >
                  Change Role
                </button>
              )}
            </div>

            {/* STEP 1: DESIGNATION SELECTION */}
            {!selectedDesignation ? (
              <div className="pt-6 animate-fade-in">
                {/* Central Icon Badge */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mb-3 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-xs transition-transform hover:scale-110 duration-200">
                    <Icon name="badge" size={28} />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 mb-1">Select your designation</h1>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Choose your official role to continue to the jurisdiction-aware authentication portal.
                  </p>
                </div>

                {/* 4 Designation Cards */}
                <div className="flex flex-col gap-3">
                  {DESIGNATIONS.map((d, idx) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectDesignation(d.id)}
                      className={`
                        w-full p-4.5 rounded-2xl border border-slate-200/80 bg-white
                        hover:border-[#0284c7] hover:bg-sky-50/20 hover:shadow-md hover:-translate-y-0.5
                        transition-all duration-200 text-left flex items-start gap-3.5 group cursor-pointer
                        active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#0284c7]/40
                        animate-slide-up stagger-${idx + 1}
                      `}
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0 group-hover:bg-[#002045] group-hover:text-white transition-colors duration-200">
                        <Icon name={d.icon} size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#002045] transition-colors">
                            {d.title}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${d.badgeBg}`}>
                            {d.badge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                          {d.subtitle}
                        </p>
                      </div>
                      <Icon
                        name="chevron_right"
                        size={20}
                        className="text-slate-400 group-hover:text-[#002045] group-hover:translate-x-1 transition-all duration-200 self-center flex-shrink-0"
                      />
                    </button>
                  ))}
                </div>

                {/* Card Footer Lock Note */}
                <div className="mt-6 pt-4 text-center border-t border-slate-100">
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                    <Icon name="lock" size={16} className="text-slate-600" />
                    <span>National Public Grievance Governance Platform</span>
                  </p>
                </div>
              </div>
            ) : (
              /* STEP 2: JURISDICTION-AWARE LOGIN FORM */
              <div className="pt-6 animate-slide-up">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 mb-2 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center text-sky-800 shadow-xs transition-transform hover:scale-110 duration-200">
                    <Icon name={currentDesignation?.icon || 'admin_panel_settings'} size={24} />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1.5 border-[#002045]/20 bg-[#002045]/5 text-[#002045] shadow-xs">
                    <Icon name="verified_user" size={14} />
                    {currentDesignation?.badge}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                    {selectedDesignation === 'citizen' ? 'Citizen Sign In' : `${currentDesignation?.title} Sign In`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {currentDesignation?.portalDesc}
                  </p>
                </div>

                {/* Error Banner */}
                {displayError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 animate-slide-down">
                    <Icon name="error" size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-red-700 leading-relaxed">{displayError}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
                  {/* Jurisdiction Selector for Officers */}
                  {selectedDesignation !== 'citizen' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Icon name="travel_explore" size={16} className="text-[#002045]" />
                          Administrative Jurisdiction
                        </span>
                        <span className="text-xs text-teal-700 font-bold">Hierarchy Verified</span>
                      </div>

                      {/* 1. STATE — TELANGANA */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between">
                          <span>State / Union Territory</span>
                          <span className="text-xs text-teal-700 font-bold">Active Jurisdiction</span>
                        </label>
                        <div className="w-full h-11 px-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <Icon name="location_on" size={18} className="text-[#002045] flex-shrink-0" />
                          <span>Telangana (TS)</span>
                          <Icon name="lock" size={16} className="text-slate-400 ml-auto" />
                        </div>
                      </div>

                      {/* 2. DISTRICT SELECTOR */}
                      {(selectedDesignation === 'mandal_officer' || selectedDesignation === 'district_officer') && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between" htmlFor="district-select">
                            <span>District</span>
                            <span className="text-xs text-slate-500 font-medium">
                              {districtsList.length > 0 ? `${districtsList.length} Districts available` : ''}
                            </span>
                          </label>
                          <select
                            id="district-select"
                            value={selectedDistrict}
                            onChange={e => handleDistrictChange(e.target.value)}
                            className="w-full h-11 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] text-slate-800 text-sm font-semibold transition-all cursor-pointer"
                            required
                          >
                            <option value="" className="text-sm font-medium py-1">Select District</option>
                            {districtsList.map(d => (
                              <option key={d.id} value={d.name} className="text-sm font-semibold py-1">
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* 3. MANDAL SELECTOR */}
                      {selectedDesignation === 'mandal_officer' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex justify-between" htmlFor="mandal-select">
                            <span>{unitLabel}</span>
                            <span className="text-xs text-slate-500 font-medium">
                              {mandalsList.length > 0 ? `${mandalsList.length} ${unitLabel}s available` : 'Select District first'}
                            </span>
                          </label>
                          <select
                            id="mandal-select"
                            value={selectedMandal}
                            onChange={e => { setSelectedMandal(e.target.value); clearError(); setLocalError(''); }}
                            disabled={!selectedDistrict || mandalsList.length === 0}
                            className="w-full h-11 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] text-slate-800 text-sm font-semibold transition-all disabled:opacity-50 disabled:bg-slate-100 cursor-pointer"
                            required
                          >
                            <option value="" className="text-sm font-medium py-1">Select {unitLabel}</option>
                            {mandalsList.map(m => (
                              <option key={m.id} value={m.name} className="text-sm font-semibold py-1">
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CREDENTIALS */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="email">
                      {selectedDesignation === 'citizen' ? 'Email Address' : 'Official Email'}
                    </label>
                    <div className="relative">
                      <Icon name="mail" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearError(); setLocalError(''); }}
                        placeholder={selectedDesignation === 'citizen' ? 'name@example.com' : 'officer@civicconnect.gov.in'}
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0284c7] text-slate-900 text-sm font-medium transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700" htmlFor="password">
                        Password
                      </label>
                      <Link to="/auth/forgot-password" className="text-xs text-[#0284c7] font-bold hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Icon name="lock" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        id="password"
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => { setPassword(e.target.value); clearError(); setLocalError(''); }}
                        placeholder="Enter your password"
                        className="w-full h-11 pl-10 pr-10 bg-slate-50 rounded-xl outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#0284c7] text-slate-900 text-sm font-medium transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 hover:text-slate-700 transition-colors"
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                      >
                        <Icon name={showPw ? 'visibility_off' : 'visibility'} size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || isLoading || !isFormValid}
                    className="w-full h-12 bg-[#002045] text-white rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:bg-[#002c5e] hover:shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-sm cursor-pointer active:scale-[0.99]"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Sign In <Icon name="arrow_forward" size={18} /></>
                    )}
                  </button>
                </form>

                {/* Footer Notice */}
                <div className="mt-5 text-center">
                  {selectedDesignation === 'citizen' ? (
                    <p className="text-xs sm:text-sm text-slate-500">
                      New Citizen?{' '}
                      <Link to="/auth/register" className="font-bold text-[#0284c7] hover:underline">
                        Register for Grievance Redressal
                      </Link>
                    </p>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
                      <p className="text-xs text-slate-500 flex items-start gap-2">
                        <Icon name="info" size={16} className="text-[#002045] flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Jurisdiction Verification:</strong> Access enforces strict database role and geographic matching.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

