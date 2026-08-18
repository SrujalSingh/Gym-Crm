// =======================================================
// NESTBEANS MULTI-TENANT GYM CRM SAAS - TYPES DEFINITIONS
// =======================================================

export type UserRole = 'superadmin' | 'admin' | 'staff';
export type GymStatus = 'active' | 'suspended';
export type MemberStatus = 'active' | 'expiring_soon' | 'expired' | 'frozen' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type EnquirySource = 'walk_in' | 'website' | 'referral' | 'social_media' | 'other';
export type EnquiryStatus = 'new' | 'contacted' | 'interested' | 'trial' | 'converted' | 'lost';
export type ExpenseCategory = 'rent' | 'equipment' | 'utilities' | 'salaries' | 'maintenance' | 'marketing' | 'other';
export type NotificationType = 'expiry_alert' | 'payment_reminder' | 'system' | 'enquiry';

export type FeatureKey = 
  | 'attendance'
  | 'payments'
  | 'memberships'
  | 'expenses'
  | 'enquiries'
  | 'staff_management'
  | 'reports'
  | 'advanced_reports'
  | 'notifications';

export interface StaffPermissions {
  members: boolean;
  attendance: boolean;
  payments: boolean;
  expenses: boolean;
  reports: boolean;
  enquiries: boolean;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: GymStatus;
  qr_code_token?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  gym_id?: string | null;
  full_name: string;
  email: string;
  password?: string;
  phone?: string | null;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  duration_months: number;
  price: number;
  description?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Member {
  id: string;
  gym_id: string;
  member_code: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  date_of_birth?: string | null;
  address?: string | null;
  joining_date: string;
  membership_plan_id?: string | null;
  membership_start?: string | null;
  membership_end?: string | null;
  status: MemberStatus;
  profile_photo?: string | null;
  emergency_contact?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  gym_id: string;
  member_id: string;
  attendance_date: string;
  check_in_time: string;
  check_out_time?: string | null;
  method: 'qr_code' | 'manual' | 'kiosk' | 'qr';
  created_at: string;
  // Joined fields for display
  member_name?: string;
  member_code?: string;
}

export interface Payment {
  id: string;
  gym_id: string;
  member_id: string;
  membership_plan_id?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  transaction_id?: string | null;
  status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  // Joined fields for display
  member_name?: string;
  member_code?: string;
  plan_name?: string;
}

export interface StaffMember {
  id: string;
  gym_id: string;
  user_id?: string | null;
  full_name: string;
  phone?: string | null;
  email: string;
  designation?: string | null;
  status: 'active' | 'inactive';
  permissions: StaffPermissions;
  created_at: string;
}

export interface Enquiry {
  id: string;
  gym_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  source: EnquirySource;
  status: EnquiryStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  assigned_staff_id?: string | null;
  created_at: string;
  updated_at: string;
  assigned_staff_name?: string;
}

export interface Expense {
  id: string;
  gym_id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description?: string | null;
  created_by?: string | null;
  created_at: string;
  created_by_name?: string;
}

export interface Notification {
  id: string;
  gym_id?: string | null;
  user_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  read_status: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  gym_id?: string | null;
  user_id?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  user_name?: string;
  gym_name?: string;
}

export interface GymFeature {
  id: string;
  gym_id: string;
  feature_key: FeatureKey;
  enabled: boolean;
  updated_at: string;
}
