import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserProfile, createUserProfile } from '@/lib/userService';
import type { AppUser, RegisterData, LoginData } from '@/types/auth';
import type { Role } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (data: LoginData) => Promise<AppUser>;
  register: (data: RegisterData) => Promise<AppUser>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  roleHomeRoute: (role: Role) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function roleHomeRoute(role: Role): string {
  switch (role) {
    case 'mandal_officer': return '/mandal';
    case 'district_officer': return '/district';
    case 'state_admin': return '/state';
    default: return '/citizen';
  }
}

function normalizeGeoString(val?: string): string {
  if (!val) return '';
  return val.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchJurisdiction(selected?: string, authoritative?: string): boolean {
  if (!selected && !authoritative) return true;
  if (!selected || !authoritative) return false;
  const s = normalizeGeoString(selected);
  const a = normalizeGeoString(authoritative);
  return s === a;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const handleAuthError = (err: unknown): string => {
    if (err instanceof Error) {
      const msg = err.message;
      if (
        msg.includes('Invalid login credentials') ||
        msg.includes('invalid_credentials') ||
        msg.includes('user-not-found') || 
        msg.includes('wrong-password') ||
        msg.includes('Invalid email or password')
      ) {
        return 'Invalid email or password.';
      }
      if (msg.includes('User already registered') || msg.includes('already registered')) {
        return 'An account with this email address already exists.';
      }
      if (msg.includes('Password should be at least') || msg.includes('weak-password')) {
        return 'Password must be at least 6 characters.';
      }
      if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('429')) {
        return 'Too many attempts. Please wait and try again.';
      }
      return msg;
    }
    return 'Invalid email or password.';
  };

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      let profile = await getUserProfile(userId);
      if (!profile) {
        // Auto-heal missing profile for authenticated user
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user && authUser.user.id === userId) {
          try {
            profile = await createUserProfile(userId, {
              fullName: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'Citizen',
              email: authUser.user.email || '',
              phoneNumber: authUser.user.user_metadata?.phone_number || authUser.user.phone || undefined,
              role: 'citizen',
              territory: {
                id: authUser.user.user_metadata?.administrative_unit_id || 'mandal-shaikpet',
                name: authUser.user.user_metadata?.administrative_unit_name || 'Shaikpet',
                type: 'mandal',
                stateId: 'telangana',
                state: 'Telangana',
                district: authUser.user.user_metadata?.district_name || 'Hyderabad',
                mandal: authUser.user.user_metadata?.mandal_name || 'Shaikpet',
              },
              status: 'active',
            });
          } catch (healErr) {
            console.warn('Could not auto-heal missing profile:', healErr);
          }
        }
      }

      if (profile && profile.status !== 'suspended') {
        setUser(profile);
      } else if (profile?.status === 'suspended') {
        await supabase.auth.signOut();
        setUser(null);
        setError('Your account is currently suspended.');
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    }).catch(() => {
      setUser(null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback(async ({ email, password, designatedRole, jurisdiction }: LoginData): Promise<AppUser> => {
    setError(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      const msg = 'Email and password are required.';
      setError(msg);
      throw new Error(msg);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError || !data.user) {
        throw new Error('Invalid email or password.');
      }

      // 2. Fetch authoritative profile from Supabase PostgreSQL (public.profiles)
      let profile = await getUserProfile(data.user.id);
      if (!profile) {
        await new Promise(r => setTimeout(r, 600));
        profile = await getUserProfile(data.user.id);
      }

      if (!profile || !profile.role) {
        await supabase.auth.signOut();
        setUser(null);
        const msg = 'User profile could not be found. Please contact the administrator.';
        setError(msg);
        throw new Error(msg);
      }

      if (profile.status === 'suspended') {
        await supabase.auth.signOut();
        setUser(null);
        const msg = 'Your account is currently suspended.';
        setError(msg);
        throw new Error(msg);
      }

      // 3. STRICT ROLE VERIFICATION
      if (designatedRole && profile.role !== designatedRole) {
        await supabase.auth.signOut();
        setUser(null);
        const msg = `Access Denied: This account is not authorized for the selected designation (${designatedRole.replace('_', ' ')}).`;
        setError(msg);
        throw new Error(msg);
      }

      // 4. STRICT JURISDICTION VERIFICATION AGAINST DATABASE PROFILE
      if (designatedRole === 'mandal_officer') {
        const profileState = profile.territory.state;
        const profileDistrict = profile.territory.district;
        const profileMandal = profile.territory.mandal || profile.territory.administrativeUnitName;

        const stateMatch = matchJurisdiction(jurisdiction?.stateName, profileState);
        const distMatch = matchJurisdiction(jurisdiction?.districtName, profileDistrict);
        const mandalMatch = matchJurisdiction(jurisdiction?.mandalName || jurisdiction?.administrativeUnitName, profileMandal);

        if (!stateMatch || !distMatch || !mandalMatch) {
          await supabase.auth.signOut();
          setUser(null);
          const msg = `These credentials belong to a Mandal Officer assigned to ${profileMandal || 'Shaikpet'}, ${profileDistrict || 'Hyderabad'}, ${profileState || 'Telangana'}. Please select the assigned jurisdiction.`;
          setError(msg);
          throw new Error(msg);
        }
      } else if (designatedRole === 'district_officer') {
        const profileState = profile.territory.state;
        const profileDistrict = profile.territory.district;

        const stateMatch = matchJurisdiction(jurisdiction?.stateName, profileState);
        const distMatch = matchJurisdiction(jurisdiction?.districtName, profileDistrict);

        if (!stateMatch || !distMatch) {
          await supabase.auth.signOut();
          setUser(null);
          const msg = `These credentials belong to a District Officer assigned to ${profileDistrict || 'Hyderabad'}, ${profileState || 'Telangana'}. Please select the assigned jurisdiction.`;
          setError(msg);
          throw new Error(msg);
        }
      } else if (designatedRole === 'state_admin') {
        const profileState = profile.territory.state;
        const stateMatch = matchJurisdiction(jurisdiction?.stateName, profileState);

        if (!stateMatch) {
          await supabase.auth.signOut();
          setUser(null);
          const msg = `These credentials belong to a State Admin assigned to ${profileState || 'Telangana'}. Please select the assigned jurisdiction.`;
          setError(msg);
          throw new Error(msg);
        }
      }

      setUser(profile);
      return profile;
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      setUser(null);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<AppUser> => {
    setError(null);
    const cleanEmail = data.email.trim();

    if (!cleanEmail || !data.password || !data.fullName.trim()) {
      const msg = 'All required registration fields must be completed.';
      setError(msg);
      throw new Error(msg);
    }

    if (data.password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const { data: authResult, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            phone_number: data.phoneNumber,
            role: 'citizen', // STRICT: Public registration creates citizen accounts ONLY
            state_id: data.territory?.stateId || 'telangana',
            state_name: data.territory?.state || 'Telangana',
            district_id: data.territory?.districtId || null,
            district_name: data.territory?.district || null,
            administrative_unit_id: data.territory?.administrativeUnitId || null,
            administrative_unit_name: data.territory?.administrativeUnitName || data.territory?.mandal || null,
            administrative_unit_type: data.territory?.administrativeUnitType || 'Mandal',
            mandal_name: data.territory?.mandal || data.territory?.administrativeUnitName || null,
          },
        },
      });

      if (signUpError || !authResult.user) {
        throw signUpError || new Error('Registration failed.');
      }

      let profile = await getUserProfile(authResult.user.id);
      if (!profile) {
        try {
          profile = await createUserProfile(authResult.user.id, {
            fullName: data.fullName.trim(),
            email: cleanEmail,
            phoneNumber: data.phoneNumber,
            role: 'citizen',
            territory: data.territory,
            status: 'active',
          });
        } catch (createErr) {
          console.warn('Fallback profile creation failed (non-fatal):', createErr);
        }
      }

      if (profile) {
        setUser(profile);
        return profile;
      }

      const initialProfile: AppUser = {
        uid: authResult.user.id,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phoneNumber: data.phoneNumber,
        role: 'citizen',
        territory: data.territory,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(initialProfile);
      return initialProfile;
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      const msg = 'Please enter your registered email address.';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/auth/login',
      });
      if (resetError) throw resetError;
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      clearError,
      login,
      register,
      logout,
      forgotPassword,
      roleHomeRoute,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
