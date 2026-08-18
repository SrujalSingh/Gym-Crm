import { Profile, StaffMember, StaffPermissions, UserRole, FeatureKey } from './types';

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  members: true,
  attendance: true,
  payments: false,
  expenses: false,
  reports: false,
  enquiries: true,
};

export const ALL_STAFF_PERMISSIONS: StaffPermissions = {
  members: true,
  attendance: true,
  payments: true,
  expenses: true,
  reports: true,
  enquiries: true,
};

/**
 * Checks if a profile has access to a specific permission area
 */
export function hasPermission(
  profile: Profile | null,
  staffRecord: StaffMember | null,
  permission: keyof StaffPermissions
): boolean {
  if (!profile) return false;

  // Superadmin and Gym Admin have full access within their tenant scope
  if (profile.role === 'superadmin' || profile.role === 'admin') {
    return true;
  }

  // Staff members rely on their granular permissions object
  if (profile.role === 'staff') {
    if (!staffRecord) return DEFAULT_STAFF_PERMISSIONS[permission];
    return !!staffRecord.permissions[permission];
  }

  return false;
}

/**
 * Checks if a role can perform administrative actions
 */
export function isAdminOrSuperadmin(role?: UserRole): boolean {
  return role === 'superadmin' || role === 'admin';
}

/**
 * Checks if a feature key is enabled for the current gym
 */
export function isFeatureEnabled(
  enabledFeatures: Record<FeatureKey, boolean> | undefined,
  featureKey: FeatureKey
): boolean {
  if (!enabledFeatures) return true; // Default to true if features matrix is loading
  return enabledFeatures[featureKey] !== false;
}
