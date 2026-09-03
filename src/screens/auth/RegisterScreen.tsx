import { useState, useMemo, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/common/Icon';
import {
  getStates,
  getDistricts,
  getAdministrativeUnits,
  getAdministrativeUnitLabel,
  createTerritoryObject,
} from '@/lib/jurisdictionService';

export function RegisterScreen() {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedState, setSelectedState] = useState('telangana');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Authoritative dynamic jurisdiction hierarchy
  const statesList = useMemo(() => getStates(), []);
  const districtsList = useMemo(() => getDistricts(selectedState), [selectedState]);
  const administrativeUnitsList = useMemo(
    () => getAdministrativeUnits(selectedState, selectedDistrict),
    [selectedState, selectedDistrict]
  );
  const unitLabel = useMemo(
    () => getAdministrativeUnitLabel(selectedState || 'telangana'),
    [selectedState]
  );
  const isFutureState = useMemo(() => {
    if (!selectedState) return false;
    return selectedState !== 'telangana' && districtsList.length === 0;
  }, [selectedState, districtsList.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    if (!agreed) {
      setLocalError('Please agree to the Terms of Service.');
      return;
    }
    if (isFutureState) {
      setLocalError('Administrative jurisdiction data for this state is not yet available.');
      return;
    }
    if (!selectedState || !selectedDistrict || !selectedUnit) {
      setLocalError(`Please select your State, District, and ${unitLabel}.`);
      return;
    }

    setSubmitting(true);
    try {
      const territory = createTerritoryObject(selectedState, selectedDistrict, selectedUnit);
      await register({
        fullName,
        email,
        password,
        phoneNumber: phone ? `+91${phone}` : '',
        role: 'citizen',
        territory,
      });
      navigate('/citizen', { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl shadow-header px-4 pt-safe">
        <div className="h-16 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface">
            <Icon name="arrow_back" size={22} />
          </button>
          <span className="text-lg sm:text-xl font-bold text-on-surface">Citizen Registration</span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-12 pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-1">Create Your Account</h1>
        <p className="text-sm sm:text-base text-on-surface-variant mb-6">
          Register with your official Indian administrative jurisdiction to access civic services and track complaints.
        </p>
        
        {displayError && (
          <div className="mb-4 p-3.5 rounded-xl bg-error-container text-error text-sm font-semibold flex items-start gap-2 shadow-sm">
            <Icon name="error" size={18} className="text-error flex-shrink-0 mt-0.5" />
            <p>{displayError}</p>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-bold text-on-surface">Personal Details</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Full Name <span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <Icon name="person" size={18} className="absolute left-3.5 text-on-surface-variant" />
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full min-h-[48px] pl-10 pr-4 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Mobile Number <span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-semibold text-on-surface-variant">+91</span>
                <input type="tel" required pattern="[0-9]{10}" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="9876543210" className="w-full min-h-[48px] pl-12 pr-4 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Email Address <span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <Icon name="mail" size={18} className="absolute left-3.5 text-on-surface-variant" />
                <input type="email" required value={email} onChange={e => { setEmail(e.target.value); clearError(); }} placeholder="name@example.com" className="w-full min-h-[48px] pl-10 pr-4 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Password <span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <Icon name="lock" size={18} className="absolute left-3.5 text-on-surface-variant" />
                <input type={showPw ? 'text' : 'password'} required minLength={8} value={password} onChange={e => { setPassword(e.target.value); clearError(); }} placeholder="Min. 8 characters" className="w-full min-h-[48px] pl-10 pr-12 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-2 w-10 h-10 flex items-center justify-center text-on-surface-variant rounded-lg">
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-on-surface">Official Jurisdiction</h2>
              <span className="text-xs sm:text-sm text-primary font-bold">Pan-India ({statesList.length} States & UTs)</span>
            </div>

            {/* 1. State / UT Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">State / Union Territory <span className="text-error">*</span></label>
              <div className="relative flex items-center">
                <Icon name="map" size={18} className="absolute left-3.5 text-on-surface-variant z-10 pointer-events-none" />
                <select
                  required
                  value={selectedState}
                  onChange={e => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                    setSelectedUnit('');
                  }}
                  className="w-full min-h-[48px] pl-10 pr-10 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="" className="text-sm font-medium py-1">Select State / UT</option>
                  {statesList.map(s => (
                    <option key={s.id} value={s.id} className="text-sm font-medium py-1">{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* FUTURE STATE NOTICE */}
            {isFutureState && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2">
                <Icon name="info" size={18} className="text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  Administrative jurisdiction data for this state is not yet available.
                </p>
              </div>
            )}

            {/* 2. District Selection */}
            {!isFutureState && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">District <span className="text-error">*</span></label>
                <div className="relative flex items-center">
                  <Icon name="location_city" size={18} className="absolute left-3.5 text-on-surface-variant z-10 pointer-events-none" />
                  <select
                    required
                    disabled={!selectedState || districtsList.length === 0}
                    value={selectedDistrict}
                    onChange={e => {
                      setSelectedDistrict(e.target.value);
                      setSelectedUnit('');
                    }}
                    className="w-full min-h-[48px] pl-10 pr-10 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value="" className="text-sm font-medium py-1">{selectedState ? 'Select District' : 'First Select State'}</option>
                    {districtsList.map(d => (
                      <option key={d.id} value={d.id} className="text-sm font-medium py-1">{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 3. Sub-District (Mandal / Taluk / Tehsil / Taluka / Block) Selection */}
            {!isFutureState && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  {unitLabel} <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <Icon name="maps_home_work" size={18} className="absolute left-3.5 text-on-surface-variant z-10 pointer-events-none" />
                  <select
                    required
                    disabled={!selectedDistrict || administrativeUnitsList.length === 0}
                    value={selectedUnit}
                    onChange={e => setSelectedUnit(e.target.value)}
                    className="w-full min-h-[48px] pl-10 pr-10 bg-surface border border-outline-variant rounded-xl text-sm sm:text-base font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none disabled:opacity-50 cursor-pointer"
                  >
                    <option value="" className="text-sm font-medium py-1">{selectedDistrict ? `Select ${unitLabel}` : `First Select District`}</option>
                    {administrativeUnitsList.map(u => (
                      <option key={u.id} value={u.id} className="text-sm font-medium py-1">{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant">
            <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-2 border-outline accent-primary cursor-pointer" />
              <span className="text-xs sm:text-sm text-on-surface-variant">
                I agree to the <Link to="#" className="text-primary underline font-bold">Terms of Service</Link> and <Link to="#" className="text-primary underline font-bold">Privacy Policy</Link>.
              </span>
            </label>
            <button type="submit" disabled={submitting || isFutureState} className="w-full min-h-[48px] bg-primary text-on-primary font-bold text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
              {submitting ? <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : <>Create Account <Icon name="arrow_forward" size={20} /></>}
            </button>
            <p className="text-center text-xs sm:text-sm text-on-surface-variant pb-4">
              Already have an account? <Link to="/auth/login" className="text-primary font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
