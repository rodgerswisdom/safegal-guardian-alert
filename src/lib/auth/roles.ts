import type { Database } from '@/integrations/supabase/types';

export type UserRole = Database['public']['Enums']['user_role'];

// Role definitions
export const ROLES = {
  TEACHER: 'teacher' as const,
  GUARDIAN: 'guardian' as const,
  CPO: 'cpo' as const,
  NGO: 'ngo' as const,
  ADMIN: 'admin' as const,
} as const;

// Role groups for easier permission checks
export const ROLE_GROUPS = {
  REPORTERS: [ROLES.TEACHER, ROLES.GUARDIAN] as const,
  RESPONDERS: [ROLES.CPO, ROLES.NGO] as const,
  OFFICERS: [ROLES.CPO, ROLES.NGO] as const, // Alias for responders
  ADMINISTRATORS: [ROLES.ADMIN] as const,
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.GUARDIAN]: 'Guardian',
  [ROLES.CPO]: 'Child Protection Officer',
  [ROLES.NGO]: 'NGO Officer',
  [ROLES.ADMIN]: 'Administrator',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [ROLES.TEACHER]: 'Report incidents and track case status',
  [ROLES.GUARDIAN]: 'Report incidents and track case status',
  [ROLES.CPO]: 'Respond to and manage child protection cases',
  [ROLES.NGO]: 'Respond to and manage child protection cases',
  [ROLES.ADMIN]: 'Manage system settings and user access',
};

// Default landing pages for each role after login
export const ROLE_LANDING_PAGES: Record<UserRole, string> = {
  [ROLES.TEACHER]: '/report',
  [ROLES.GUARDIAN]: '/report',
  [ROLES.CPO]: '/officer',
  [ROLES.NGO]: '/officer',
  [ROLES.ADMIN]: '/admin',
};

// Utility functions
export const isReporter = (role: UserRole): boolean => {
  return ROLE_GROUPS.REPORTERS.includes(role as any);
};

export const isResponder = (role: UserRole): boolean => {
  return ROLE_GROUPS.RESPONDERS.includes(role as any);
};

export const isOfficer = (role: UserRole): boolean => {
  return ROLE_GROUPS.OFFICERS.includes(role as any);
};

export const isAdmin = (role: UserRole): boolean => {
  return ROLE_GROUPS.ADMINISTRATORS.includes(role as any);
};

export const canReport = (role: UserRole): boolean => {
  return isReporter(role);
};

export const canRespond = (role: UserRole): boolean => {
  return isResponder(role);
};

export const canManageSystem = (role: UserRole): boolean => {
  return isAdmin(role);
};

export const getLandingPage = (role: UserRole): string => {
  return ROLE_LANDING_PAGES[role];
};

export const getDisplayName = (role: UserRole): string => {
  return ROLE_DISPLAY_NAMES[role];
};

export const getDescription = (role: UserRole): string => {
  return ROLE_DESCRIPTIONS[role];
};

// Role validation
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(ROLES).includes(role as UserRole);
};

// Get all available roles for role picker
export const getAvailableRoles = (): Array<{ value: UserRole; label: string; description: string }> => {
  return Object.values(ROLES).map(role => ({
    value: role,
    label: getDisplayName(role),
    description: getDescription(role),
  }));
};
