'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Gym, StaffMember, FeatureKey, UserRole } from '../types';
import { 
  INITIAL_GYMS, INITIAL_PROFILES, INITIAL_STAFF, INITIAL_FEATURES 
} from '../mock-data';

interface AuthContextType {
  profile: Profile | null;
  currentGym: Gym | null;
  staffRecord: StaffMember | null;
  impersonatedGym: Gym | null;
  effectiveGymId: string | null;
  enabledFeatures: Record<FeatureKey, boolean>;
  isLoading: boolean;
  loginAsDemoUser: (email: string) => void;
  impersonateGym: (gym: Gym | null) => void;
  logout: () => void;
  addOrUpdateProfile: (profileData: Omit<Profile, 'id' | 'auth_user_id' | 'created_at' | 'updated_at'> & { id?: string }) => Profile;
  addDynamicGym: (gym: Gym) => void;
  allDemoProfiles: Profile[];
  allGyms: Gym[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profilesList, setProfilesList] = useState<Profile[]>(INITIAL_PROFILES);
  const [gymsList, setGymsList] = useState<Gym[]>(INITIAL_GYMS);
  
  // Initialize consistently on server and client to avoid SSR hydration mismatch
  const [profile, setProfile] = useState<Profile | null>(null);
  const [impersonatedGym, setImpersonatedGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Read saved profiles, gyms, and session from localStorage on client mount
  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem('nestbeans_profiles');
      if (savedProfiles) {
        setProfilesList(JSON.parse(savedProfiles));
      }

      const savedGyms = localStorage.getItem('nestbeans_gyms');
      if (savedGyms) {
        setGymsList(JSON.parse(savedGyms));
      }

      const savedSession = localStorage.getItem('gym_crm_active_profile_id');
      if (savedSession) {
        const activeProfiles = savedProfiles ? JSON.parse(savedProfiles) : INITIAL_PROFILES;
        const found = activeProfiles.find((p: Profile) => p.id === savedSession);
        if (found) setProfile(found);
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    }
  }, []);

  // Synchronize localStorage when profilesList changes
  useEffect(() => {
    try {
      localStorage.setItem('nestbeans_profiles', JSON.stringify(profilesList));
    } catch {}
  }, [profilesList]);

  // Synchronize localStorage when gymsList changes
  useEffect(() => {
    try {
      localStorage.setItem('nestbeans_gyms', JSON.stringify(gymsList));
    } catch {}
  }, [gymsList]);

  // Synchronize localStorage when profile changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem('gym_crm_active_profile_id', profile.id);
    } else {
      localStorage.removeItem('gym_crm_active_profile_id');
    }
  }, [profile]);

  // Current gym determined strictly from user profile
  const currentGym = React.useMemo(() => {
    if (!profile?.gym_id) return null;
    const found = gymsList.find((g) => g.id === profile.gym_id);
    if (found) return found;
    return {
      id: profile.gym_id,
      name: profile.full_name ? profile.full_name.replace(/Admin|Staff/g, '').trim() || 'Active Gym' : 'Gym Workspace',
      slug: 'active-gym',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [profile, gymsList]);

  // Staff record if user role is staff
  const staffRecord = INITIAL_STAFF.find((s) => s.user_id === profile?.id) || null;

  // Effective gym ID: if superadmin is impersonating a gym for support, use impersonatedGym.id; else user's profile.gym_id
  const effectiveGymId = profile?.role === 'superadmin' && impersonatedGym 
    ? impersonatedGym.id 
    : profile?.gym_id || currentGym?.id || null;

  // Enabled features matrix for effective gym
  const enabledFeatures = React.useMemo(() => {
    const defaultMatrix: Record<FeatureKey, boolean> = {
      attendance: true,
      payments: true,
      memberships: true,
      expenses: true,
      enquiries: true,
      staff_management: true,
      reports: true,
      advanced_reports: true,
      notifications: true,
    };

    if (!effectiveGymId) return defaultMatrix;

    const gymFeats = INITIAL_FEATURES.filter((f) => f.gym_id === effectiveGymId);

    gymFeats.forEach((f) => {
      defaultMatrix[f.feature_key] = f.enabled;
    });

    return defaultMatrix;
  }, [effectiveGymId]);

  const loginAsDemoUser = (email: string) => {
    setIsLoading(true);
    const target = profilesList.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (target) {
      setProfile(target);
      setImpersonatedGym(null); // Reset impersonation on login
    }
    setIsLoading(false);
  };

  const impersonateGym = (gym: Gym | null) => {
    if (profile?.role !== 'superadmin') return;
    setImpersonatedGym(gym);
  };

  const logout = () => {
    setProfile(null);
    setImpersonatedGym(null);
    localStorage.removeItem('gym_crm_active_profile_id');
  };

  const addOrUpdateProfile: AuthContextType['addOrUpdateProfile'] = (data) => {
    if (data.id) {
      // Update existing profile credentials
      setProfilesList((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
      );
      const updated = profilesList.find((p) => p.id === data.id)!;
      return updated;
    } else {
      // Create new profile
      const newProf: Profile = {
        id: `prof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        auth_user_id: `auth-${Date.now()}`,
        gym_id: data.gym_id,
        full_name: data.full_name,
        email: data.email,
        password: data.password || 'Pass@123',
        phone: data.phone,
        role: data.role,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfilesList((prev) => [...prev, newProf]);
      return newProf;
    }
  };

  const addDynamicGym = (newGym: Gym) => {
    setGymsList((prev) => {
      if (prev.some((g) => g.id === newGym.id)) return prev;
      return [...prev, newGym];
    });
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        currentGym,
        staffRecord,
        impersonatedGym,
        effectiveGymId,
        enabledFeatures,
        isLoading,
        loginAsDemoUser,
        impersonateGym,
        logout,
        addOrUpdateProfile,
        addDynamicGym,
        allDemoProfiles: profilesList,
        allGyms: gymsList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
