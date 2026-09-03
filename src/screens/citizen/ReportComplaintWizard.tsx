import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createComplaint, patchComplaintPhotoUrls } from '@/lib/complaintService';
import { uploadComplaintEvidence } from '@/lib/storageService';
import {
  getDistricts,
  getAdministrativeUnits,
  getAdministrativeUnitLabel,
} from '@/lib/jurisdictionService';
import { LocationPickerMap } from '@/components/map/LocationPickerMap';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import type { ComplaintCategory, ComplaintPriority } from '@/types';

export function ReportComplaintWizard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const CATEGORIES: { id: ComplaintCategory; label: string; icon: string; desc: string }[] = [
    { id: 'roads', label: t('roads'), icon: 'add_road', desc: 'Potholes, damaged roads, broken dividers' },
    { id: 'water', label: t('water'), icon: 'water_drop', desc: 'Pipe leakage, no water, contaminated water' },
    { id: 'drainage', label: t('drainage'), icon: 'plumbing', desc: 'Clogged drains, sewage overflow, manhole' },
    { id: 'sanitation', label: t('sanitation'), icon: 'delete', desc: 'Uncollected garbage, open dumping' },
    { id: 'electricity', label: t('electricity'), icon: 'bolt', desc: 'Streetlight off, open wires, power outage' },
    { id: 'parks', label: t('parks'), icon: 'park', desc: 'Broken benches, overgrown weeds, play equipment' },
    { id: 'public_safety', label: t('public_safety'), icon: 'security', desc: 'Stray animal menace, encroached walkways' },
    { id: 'disaster_mgmt', label: t('disaster_mgmt'), icon: 'emergency', desc: 'Fallen trees, storm damage, flooding' },
    { id: 'other', label: t('other'), icon: 'more_horiz', desc: 'Any other municipal or administrative issue' },
  ];

  const preselectedCategory = location.state?.preselectedCategory as ComplaintCategory | undefined;
  const initialStep = preselectedCategory ? 2 : (location.state?.step || 1);

  const [step, setStep] = useState<number>(initialStep);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [geoNotice, setGeoNotice] = useState('');

  // Form states
  const [category, setCategory] = useState<ComplaintCategory>(preselectedCategory || 'roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [landmark, setLandmark] = useState('');

  // Location states — citizen must explicitly select their complaint location
  // State is always Telangana — no dynamic state variable needed
  const [districtName, setDistrictName] = useState<string>('');
  const [mandalName, setMandalName] = useState<string>('');
  const [areaName, setAreaName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({ lat: 17.4325, lng: 78.4072 });
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Evidence states — store File objects until complaint is created; then upload with real referenceId
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  // Dynamic jurisdiction options for complaint location (always Telangana)
  const districtsList = useMemo(() => getDistricts('telangana'), []);
  const administrativeUnitsList = useMemo(
    () => districtName ? getAdministrativeUnits('telangana', districtName) : [],
    [districtName]
  );
  const unitLabel = useMemo(() => getAdministrativeUnitLabel('telangana'), []);

  // Robust GPS Geolocation Detection
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    setErrorMsg('');
    setGeoNotice('');

    if (!('geolocation' in navigator)) {
      setGeoNotice('Geolocation is not supported by your browser. Please select location manually.');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoordinates({ lat, lng });
        setAddress(`GPS Lat: ${lat}, Lng: ${lng}`);
        setGeoNotice(`Live GPS position acquired (Accuracy: ±${Math.round(pos.coords.accuracy || 10)}m)`);

        // Reverse-geocoding via OpenStreetMap
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const locality =
                addr.suburb ||
                addr.neighbourhood ||
                addr.residential ||
                addr.road ||
                addr.village ||
                addr.town ||
                '';
              if (locality) setAreaName(locality);
              if (data.display_name) setAddress(data.display_name);
            }
          }
        } catch (geoErr) {
          console.warn('Reverse geocode lookup failed (non-blocking):', geoErr);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            setGeoNotice('Location permission was denied. Please enable location access or select your location manually.');
            break;
          case 2: // POSITION_UNAVAILABLE
            setGeoNotice('Location information is currently unavailable. Please select your location manually.');
            break;
          case 3: // TIMEOUT
            setGeoNotice('Location detection request timed out. Please try again or select location manually.');
            break;
          default:
            setGeoNotice('Unable to acquire GPS position. Please select location manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);
    setPendingPhotoFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPhotoPreviewUrls(prev => [...prev, ...newPreviews]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemovePhoto = (idx: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(photoPreviewUrls[idx]);
    setPendingPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  // Two-phase submission: create complaint → upload evidence → patch photo_urls
  const handleSubmit = async () => {
    if (submitting) return;

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter a title and description for your complaint.');
      setStep(2);
      return;
    }

    if (!districtName.trim()) {
      setErrorMsg('Please select a district for your complaint location.');
      setStep(3);
      return;
    }

    if (!mandalName.trim()) {
      setErrorMsg(`Please select a ${unitLabel} for your complaint location.`);
      setStep(3);
      return;
    }

    if (!user?.uid) {
      setErrorMsg('You must be signed in to submit a complaint. Please sign in and try again.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Phase 1: Create the complaint record (no photos yet)
      const created = await createComplaint({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        citizenId: user.uid,
        citizenName: user.fullName || 'Citizen',
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          address: address.trim() || `${areaName}, ${mandalName}`,
        },
        areaName: areaName.trim() || mandalName,
        mandalName: mandalName.trim(),
        districtName: districtName.trim(),
        stateName: 'Telangana',
        photoUrls: [],
      });

      // Phase 2: Upload photos using the real referenceId, then patch
      if (pendingPhotoFiles.length > 0) {
        try {
          const uploadedUrls: string[] = [];
          for (const file of pendingPhotoFiles) {
            const url = await uploadComplaintEvidence(file, created.referenceId);
            uploadedUrls.push(url);
          }
          // Patch the complaint with the uploaded photo URLs
          await patchComplaintPhotoUrls(created.id, uploadedUrls);
          // Update created object locally for navigation
          created.photoUrls = uploadedUrls;
        } catch (uploadErr) {
          console.error('Evidence upload failed (non-fatal):', uploadErr);
          // Complaint is already created — navigate anyway
        }
      }

      navigate('/citizen/submission-success', { state: { complaint: created }, replace: true });
    } catch (err) {
      console.error('Complaint submission error:', err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Unable to submit your grievance right now. Please check your network connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-lg mx-auto pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-header px-4 pt-safe">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => (step > 1 ? setStep(s => s - 1) : navigate(-1))}
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
            >
              <Icon name="arrow_back" size={22} />
            </button>
            <span className="text-lg sm:text-xl font-bold text-on-surface">
              {t('fileAGrievance')}
            </span>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {t('step')} {step} {t('of')} 5
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 px-4 py-6 flex flex-col max-w-full overflow-x-hidden">
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-error-container text-error text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <Icon name="error" size={18} />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-error/10 rounded">
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        {/* STEP 1: Department & Category Selection */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-1">
                {t('selectCategory')}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {t('selectCategoryDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                      }`}
                    >
                      <Icon name={cat.icon} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-on-surface truncate">
                        {cat.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant truncate mt-0.5">
                        {cat.desc}
                      </p>
                    </div>
                    <Icon
                      name={isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                      size={20}
                      className={isSelected ? 'text-primary' : 'text-on-surface-variant/40'}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Issue Details & Priority */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-1">
                {t('grievanceDetails')}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {t('grievanceDetailsDesc')}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                {t('complaintTitle')} *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('titlePlaceholder')}
                className="h-12 px-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm sm:text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                {t('detailedDescription')} *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('descPlaceholder')}
                className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm sm:text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">{t('urgencyPriority')}</label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as ComplaintPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold capitalize border transition-all ${
                      priority === p
                        ? p === 'critical'
                          ? 'bg-error text-on-error border-error shadow-sm'
                          : p === 'high'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {t(p)}
                  </button>
                ))}
              </div>
              <span className="text-xs text-on-surface-variant">
                {priority === 'critical' && '⚡ 24h Statutory SLA target'}
                {priority === 'high' && '⏳ 48h Statutory SLA target'}
                {priority === 'medium' && '📅 72h Standard municipal SLA'}
                {priority === 'low' && '📅 120h Standard SLA target'}
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Location & Interactive Map */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-1">
                  {t('grievanceLocation')}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {t('locationDesc')}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={isDetectingLocation ? 'progress_activity' : 'my_location'}
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
              >
                {isDetectingLocation ? t('detecting') : t('detectGPS')}
              </Button>
            </div>

            {geoNotice && (
              <div className="p-3.5 rounded-xl bg-primary/10 text-primary text-xs sm:text-sm flex items-start gap-2 border border-primary/20">
                <Icon name="info" size={18} className="flex-shrink-0 mt-0.5" />
                <span>{geoNotice}</span>
              </div>
            )}

            {/* Interactive Location Picker Map */}
            <LocationPickerMap
              coordinates={coordinates}
              onChangeCoordinates={coords => {
                setCoordinates(coords);
                setAddress(`Pinned Coordinates: Lat ${coords.lat}, Lng ${coords.lng}`);
              }}
              height="210px"
              isDetecting={isDetectingLocation}
              addressLabel={address}
            />

            {/* Jurisdiction Selectors — Telangana Only */}
            <div className="flex flex-col gap-3">
              {/* State — Locked */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center justify-between">
                  <span>{t('state')}</span>
                  <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
                </label>
                <div className="h-12 px-3.5 rounded-xl border border-outline-variant bg-surface-container flex items-center gap-2.5 text-sm sm:text-base font-semibold text-on-surface">
                  <Icon name="location_on" size={18} className="text-primary flex-shrink-0" />
                  <span>Telangana (TS)</span>
                  <Icon name="lock" size={16} className="text-on-surface-variant ml-auto" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* District Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">{t('district')}</label>
                  <div className="relative">
                    <select
                      value={districtName}
                      onChange={e => {
                        setDistrictName(e.target.value);
                        setMandalName(''); // Reset mandal when district changes
                      }}
                      className="w-full h-12 px-3.5 pr-10 rounded-xl border-2 border-outline-variant focus:border-primary bg-surface-container-lowest text-sm sm:text-base font-semibold text-on-surface cursor-pointer shadow-sm focus:outline-none transition-all appearance-none"
                      required
                    >
                      <option value="" className="text-sm sm:text-base font-medium py-2">{t('selectDistrict')}</option>
                      {districtsList.map(d => (
                        <option key={d.id} value={d.name} className="text-sm sm:text-base font-semibold py-2">
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <Icon name="arrow_drop_down" size={24} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>

                {/* Mandal Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">{t('mandalWard')}</label>
                  <div className="relative">
                    <select
                      value={mandalName}
                      onChange={e => setMandalName(e.target.value)}
                      disabled={!districtName || administrativeUnitsList.length === 0}
                      className="w-full h-12 px-3.5 pr-10 rounded-xl border-2 border-outline-variant focus:border-primary bg-surface-container-lowest text-sm sm:text-base font-semibold text-on-surface cursor-pointer shadow-sm focus:outline-none transition-all disabled:opacity-50 appearance-none"
                      required
                    >
                      <option value="" className="text-sm sm:text-base font-medium py-2">{t('selectMandal')}</option>
                      {administrativeUnitsList.map(u => (
                        <option key={u.id} value={u.name} className="text-sm sm:text-base font-semibold py-2">
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <Icon name="arrow_drop_down" size={24} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">{t('areaStreet')}</label>
              <input
                type="text"
                value={areaName}
                onChange={e => setAreaName(e.target.value)}
                placeholder={t('areaPlaceholder')}
                className="h-12 px-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm sm:text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">{t('landmark')}</label>
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder={t('landmarkPlaceholder')}
                className="h-12 px-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm sm:text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Evidence Photos */}
        {step === 4 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-1">
                {t('uploadPhotos')}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {t('uploadPhotosDesc')}
              </p>
            </div>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/40 rounded-2xl bg-surface-container-lowest hover:bg-surface-container cursor-pointer transition-colors text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoAdd}
                className="sr-only"
              />
              <div className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center mb-3 shadow">
                <Icon name="add_a_photo" size={26} />
              </div>
              <span className="text-sm sm:text-base font-bold text-primary mb-1">
                {t('addPhoto')}
              </span>
              <span className="text-xs sm:text-sm text-on-surface-variant">
                Supports JPG, PNG up to 10MB
              </span>
            </label>

            {/* Attached Photos Gallery — shows local previews before upload */}
            {photoPreviewUrls.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs sm:text-sm font-semibold text-on-surface">
                  {t('photosAdded')} ({photoPreviewUrls.length})
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {photoPreviewUrls.map((src, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-outline-variant h-28 group shadow-sm">
                      <img src={src} alt="Evidence preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center shadow opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="flex flex-col gap-4 animate-in fade-in max-w-full overflow-hidden">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-1">
                {t('reviewSubmit')}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {t('reviewDesc')}
              </p>
            </div>

            {/* Review Card with robust Word-Wrapping */}
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4.5 flex flex-col gap-3 shadow-sm max-w-full overflow-hidden break-words">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('categorySummary')}</span>
                <span className="text-xs sm:text-sm font-bold text-primary capitalize flex items-center gap-1">
                  <Icon name="category" size={16} /> {t(category)}
                </span>
              </div>

              <div className="max-w-full overflow-hidden">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('complaintTitle')}</span>
                <p className="text-sm sm:text-base font-bold text-on-surface mt-0.5 break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full">
                  {title}
                </p>
              </div>

              <div className="max-w-full overflow-hidden">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t('detailedDescription')}</span>
                <p className="text-sm text-on-surface-variant mt-0.5 break-words break-all [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="border-t border-outline-variant/60 pt-2.5 flex flex-col gap-1.5 text-xs sm:text-sm max-w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant font-medium">{t('locationSummary')}:</span>
                  <span className="font-semibold text-on-surface text-right truncate max-w-[60%]">
                    {areaName ? `${areaName}, ` : ''}{mandalName}, {districtName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant font-medium">GPS Location:</span>
                  <span className="font-mono text-primary font-bold text-xs sm:text-sm">
                    {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm border-t border-outline-variant/60 pt-2.5">
                <span className="text-on-surface-variant font-medium">{t('prioritySummary')}</span>
                <span className={`font-bold uppercase ${
                  priority === 'critical' ? 'text-error' : priority === 'high' ? 'text-amber-600' : 'text-primary'
                }`}>
                  {t(priority)}
                </span>
              </div>

              {photoPreviewUrls.length > 0 && (
                <div className="border-t border-outline-variant/60 pt-2.5 flex items-center gap-2">
                  <Icon name="photo_library" size={16} className="text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-on-surface-variant">{photoPreviewUrls.length} {t('photosAdded')}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-surface-container text-xs sm:text-sm text-on-surface-variant flex items-start gap-2 border border-outline-variant/60">
              <Icon name="verified_user" size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <span>
                Once submitted, a unique Government Tracking ID (CC-XXXX) will be generated. You will receive real-time notifications as status changes.
              </span>
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="pt-6 flex items-center gap-3 mt-4">
          {step > 1 && (
            <Button
              variant="outline"
              size="lg"
              className="flex-1 font-bold"
              onClick={() => setStep(s => s - 1)}
              disabled={submitting}
            >
              {t('back')}
            </Button>
          )}

          {step < 5 ? (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 shadow-sm font-bold"
              onClick={() => {
                if (step === 2 && (!title.trim() || !description.trim())) {
                  setErrorMsg('Please provide a title and description.');
                  return;
                }
                setErrorMsg('');
                setStep(s => s + 1);
              }}
              iconRight="arrow_forward"
            >
              {t('continue')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 shadow-md font-bold"
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={submitting}
              iconRight="check_circle"
            >
              {submitting ? t('submitting') : t('submitGrievance')}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
