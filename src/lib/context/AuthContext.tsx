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

  // Read saved session from localStorage on client mount
  useEffect(() => {
    const saved = localStorage.getItem('gym_crm_active_profile_id');
    if (saved) {
      const found = profilesList.find((p) => p.id === saved);
      if (found) setProfile(found);
    }
  }, []);

  // Synchronize localStorage when profile changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem('gym_crm_active_profile_id', profile.id);
    } else {
      localStorage.removeItem('gym_crm_active_profile_id');
    }
  }, [profile]);

  // Current gym determined strictly from user profile (searches dynamic gyms list first, with fallback object if newly added)
  const currentGym = React.useMemo(() => {
    if (!profile?.gym_id) return null;
    const found = gymsList.find((g) => g.id === profile.gym_id);
    if (found) return found;
    // Fallback gym object if newly added gym ID
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
      setImpersonatedGym(null);
    }
    setTimeout(() => setIsLoading(false), 200);
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
    const existingIndex = profilesList.findIndex((p) => p.id === data.id || p.email.toLowerCase() === data.email.toLowerCase());
    
    if (existingIndex >= 0) {
      const updated = {
        ...profilesList[existingIndex],
        ...data,
        updated_at: new Date().toISOString(),
      };
      setProfilesList((prev) => prev.map((p, idx) => (idx === existingIndex ? updated : p)));
      return updated;
    }

    const newProf: Profile = {
      ...data,
      id: data.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      auth_user_id: `u-${Date.now()}`,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProfilesList((prev) => [...prev, newProf]);
    return newProf;
  };

  const addDynamicGym: AuthContextType['addDynamicGym'] = (gym) => {
    setGymsList((prev) => [...prev.filter((g) => g.id !== gym.id), gym]);
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
