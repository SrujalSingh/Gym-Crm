'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Member, MembershipPlan, Attendance, Payment, StaffMember, 
  Enquiry, Expense, Notification, AuditLog, GymFeature, Gym 
} from '../types';
import { 
  INITIAL_MEMBERS, INITIAL_PLANS, INITIAL_ATTENDANCE, 
  INITIAL_PAYMENTS, INITIAL_STAFF, INITIAL_ENQUIRIES, 
  INITIAL_EXPENSES, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS, 
  INITIAL_FEATURES, INITIAL_GYMS 
} from '../mock-data';
import { useAuth } from './AuthContext';

interface TenantContextType {
  // Scoped Data
  members: Member[];
  plans: MembershipPlan[];
  attendance: Attendance[];
  payments: Payment[];
  staff: StaffMember[];
  enquiries: Enquiry[];
  expenses: Expense[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  features: GymFeature[];
  gyms: Gym[];

  // Mutations (Auto-scoped to effectiveGymId)
  addMember: (memberData: Omit<Member, 'id' | 'gym_id' | 'created_at' | 'updated_at'>) => Member;
  updateMember: (id: string, memberData: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  addPlan: (planData: Omit<MembershipPlan, 'id' | 'gym_id' | 'created_at'>) => MembershipPlan;
  updatePlan: (id: string, planData: Partial<MembershipPlan>) => void;

  recordAttendance: (memberId: string, method?: string, targetGymId?: string) => { success: boolean; message: string; record?: Attendance };
  
  recordPayment: (paymentData: Omit<Payment, 'id' | 'gym_id' | 'created_at'>) => Payment;

  addStaff: (staffData: Omit<StaffMember, 'id' | 'gym_id' | 'created_at'>) => StaffMember;
  updateStaffPermissions: (staffId: string, permissions: StaffMember['permissions']) => void;

  addEnquiry: (enquiryData: Omit<Enquiry, 'id' | 'gym_id' | 'created_at' | 'updated_at'>) => Enquiry;
  updateEnquiryStatus: (id: string, status: Enquiry['status']) => void;
  convertEnquiryToMember: (enquiryId: string, planId: string) => Member | null;

  addExpense: (expenseData: Omit<Expense, 'id' | 'gym_id' | 'created_at'>) => Expense;

  toggleGymFeature: (gymId: string, featureKey: string, enabled: boolean) => void;

  addGym: (gymData: Omit<Gym, 'id' | 'created_at' | 'updated_at'>) => Gym;
  updateGymStatus: (gymId: string, status: 'active' | 'suspended') => void;
  deleteGym: (gymId: string) => void;

  markNotificationRead: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { profile, effectiveGymId, impersonatedGym, addDynamicGym } = useAuth();

  const [gymsList, setGymsList] = useState<Gym[]>(INITIAL_GYMS);
  const [membersList, setMembersList] = useState<Member[]>(INITIAL_MEMBERS);
  const [plansList, setPlansList] = useState<MembershipPlan[]>(INITIAL_PLANS);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>(INITIAL_ATTENDANCE);
  const [paymentsList, setPaymentsList] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [enquiriesList, setEnquiriesList] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [expensesList, setExpensesList] = useState<Expense[]>(INITIAL_EXPENSES);
  const [notificationsList, setNotificationsList] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [featuresList, setFeaturesList] = useState<GymFeature[]>(INITIAL_FEATURES);

  // Read saved data collections from localStorage on client mount
  useEffect(() => {
    try {
      const savedGyms = localStorage.getItem('nestbeans_gyms');
      if (savedGyms) setGymsList(JSON.parse(savedGyms));

      const savedMembers = localStorage.getItem('nestbeans_members');
      if (savedMembers) setMembersList(JSON.parse(savedMembers));

      const savedPlans = localStorage.getItem('nestbeans_plans');
      if (savedPlans) setPlansList(JSON.parse(savedPlans));

      const savedAttendance = localStorage.getItem('nestbeans_attendance');
      if (savedAttendance) setAttendanceList(JSON.parse(savedAttendance));

      const savedPayments = localStorage.getItem('nestbeans_payments');
      if (savedPayments) setPaymentsList(JSON.parse(savedPayments));

      const savedStaff = localStorage.getItem('nestbeans_staff');
      if (savedStaff) setStaffList(JSON.parse(savedStaff));

      const savedEnquiries = localStorage.getItem('nestbeans_enquiries');
      if (savedEnquiries) setEnquiriesList(JSON.parse(savedEnquiries));

      const savedExpenses = localStorage.getItem('nestbeans_expenses');
      if (savedExpenses) setExpensesList(JSON.parse(savedExpenses));

      const savedAudit = localStorage.getItem('nestbeans_audit');
      if (savedAudit) setAuditLogsList(JSON.parse(savedAudit));
    } catch (e) {
      console.error('Error reading localStorage persistence:', e);
    }
  }, []);

  // Synchronize state to localStorage whenever collections change
  useEffect(() => { try { localStorage.setItem('nestbeans_gyms', JSON.stringify(gymsList)); } catch {} }, [gymsList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_members', JSON.stringify(membersList)); } catch {} }, [membersList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_plans', JSON.stringify(plansList)); } catch {} }, [plansList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_attendance', JSON.stringify(attendanceList)); } catch {} }, [attendanceList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_payments', JSON.stringify(paymentsList)); } catch {} }, [paymentsList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_staff', JSON.stringify(staffList)); } catch {} }, [staffList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_enquiries', JSON.stringify(enquiriesList)); } catch {} }, [enquiriesList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_expenses', JSON.stringify(expensesList)); } catch {} }, [expensesList]);
  useEffect(() => { try { localStorage.setItem('nestbeans_audit', JSON.stringify(auditLogsList)); } catch {} }, [auditLogsList]);

  // Active gym scope for logged in admin/staff or superadmin impersonation
  const activeGymId = profile?.role === 'superadmin' && impersonatedGym 
    ? impersonatedGym.id 
    : profile?.gym_id || effectiveGymId;

  // Cross-gym tenant filtering (Unless Superadmin on platform dashboard, tenant view is filtered strictly by activeGymId)
  const isSuperadminPlatformMode = profile?.role === 'superadmin' && !impersonatedGym;

  const scopedMembers = isSuperadminPlatformMode ? membersList : membersList.filter((m) => m.gym_id === activeGymId);
  const scopedPlans = isSuperadminPlatformMode ? plansList : plansList.filter((p) => p.gym_id === activeGymId);
  const scopedAttendance = isSuperadminPlatformMode ? attendanceList : attendanceList.filter((a) => a.gym_id === activeGymId);
  const scopedPayments = isSuperadminPlatformMode ? paymentsList : paymentsList.filter((p) => p.gym_id === activeGymId);
  const scopedStaff = isSuperadminPlatformMode ? staffList : staffList.filter((s) => s.gym_id === activeGymId);
  const scopedEnquiries = isSuperadminPlatformMode ? enquiriesList : enquiriesList.filter((e) => e.gym_id === activeGymId);
  const scopedExpenses = isSuperadminPlatformMode ? expensesList : expensesList.filter((e) => e.gym_id === activeGymId);
  const scopedNotifications = isSuperadminPlatformMode ? notificationsList : notificationsList.filter((n) => n.gym_id === activeGymId || !n.gym_id);
  const scopedAuditLogs = isSuperadminPlatformMode ? auditLogsList : auditLogsList.filter((a) => a.gym_id === activeGymId);
  const scopedFeatures = isSuperadminPlatformMode ? featuresList : featuresList.filter((f) => f.gym_id === activeGymId);

  // --- MUTATIONS ---

  const addMember: TenantContextType['addMember'] = (data) => {
    const targetGymId = (data as any).gym_id || activeGymId || gymsList[0]?.id;
    if (!targetGymId) throw new Error('No active gym found to add member');
    
    // Auto-generate code if needed
    const count = membersList.filter((m) => m.gym_id === targetGymId).length + 1;
    const gymCodePrefix = gymsList.find((g) => g.id === targetGymId)?.slug.toUpperCase().slice(0, 3) || 'GYM';
    const memberCode = data.member_code || `${gymCodePrefix}-${1000 + count}`;

    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gym_id: targetGymId, // ENFORCE TENANT ISOLATION
      member_code: memberCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMembersList((prev) => [newMember, ...prev]);

    // Log action
    logAuditAction('MEMBER_ADDED', 'member', newMember.id, { name: newMember.full_name, code: newMember.member_code });

    return newMember;
  };

  const updateMember: TenantContextType['updateMember'] = (id, data) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === id && (m.gym_id === effectiveGymId || profile?.role === 'superadmin') ? { ...m, ...data, updated_at: new Date().toISOString() } : m))
    );
    logAuditAction('MEMBER_UPDATED', 'member', id, data);
  };

  const deleteMember: TenantContextType['deleteMember'] = (id) => {
    setMembersList((prev) => prev.filter((m) => !(m.id === id && (m.gym_id === effectiveGymId || profile?.role === 'superadmin'))));
    logAuditAction('MEMBER_DELETED', 'member', id, {});
  };

  const addPlan: TenantContextType['addPlan'] = (data) => {
    const activeGymId = (data as any).gym_id || effectiveGymId || gymsList[0]?.id;
    if (!activeGymId) throw new Error('No active gym found');
    const newPlan: MembershipPlan = {
      ...data,
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gym_id: activeGymId,
      created_at: new Date().toISOString(),
    };
    setPlansList((prev) => [newPlan, ...prev]);
    logAuditAction('PLAN_CREATED', 'membership_plan', newPlan.id, { name: newPlan.name, price: newPlan.price });
    return newPlan;
  };

  const updatePlan: TenantContextType['updatePlan'] = (id, data) => {
    setPlansList((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const recordAttendance: TenantContextType['recordAttendance'] = (memberId, method = 'qr_code', targetGymId?: string) => {
    const gymIdToUse = targetGymId || effectiveGymId || gymsList[0]?.id;
    if (!gymIdToUse) return { success: false, message: 'No gym active' };

    // Verify member belongs to current gym
    const member = membersList.find(
      (m) => (m.id === memberId || m.member_code.toLowerCase() === memberId.toLowerCase() || (m.phone && m.phone.replace(/\s+/g, '') === memberId.replace(/\s+/g, ''))) && m.gym_id === gymIdToUse
    );

    if (!member) {
      return { success: false, message: 'Member not found or does not belong to this gym' };
    }

    if (member.gym_id !== gymIdToUse && profile?.role !== 'superadmin') {
      // SECURITY REJECTION: Cross-gym check-in forbidden!
      return { success: false, message: 'Access Denied: Member does not belong to this gym!' };
    }

    // Duplicate check-in throttling (check within last 15 minutes)
    const today = new Date().toISOString().split('T')[0];
    const recentCheckIn = attendanceList.find(
      (a) => a.member_id === member.id && a.attendance_date === today && (Date.now() - new Date(a.check_in_time).getTime()) < 15 * 60 * 1000
    );

    if (recentCheckIn) {
      return { 
        success: false, 
        message: `Attendance already marked.`,
        record: recentCheckIn
      };
    }

    const newRec: Attendance = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gym_id: gymIdToUse, // ENFORCE TENANT ISOLATION
      member_id: member.id,
      attendance_date: today,
      check_in_time: new Date().toISOString(),
      method: (method as 'qr_code' | 'manual' | 'kiosk' | 'qr') || 'qr_code',
      created_at: new Date().toISOString(),
      member_name: member.full_name,
      member_code: member.member_code,
    };

    setAttendanceList((prev) => [newRec, ...prev]);
    logAuditAction('ATTENDANCE_RECORDED', 'attendance', newRec.id, { member_name: member.full_name, method });

    return { success: true, message: `Check-in successful for ${member.full_name} (${member.member_code})`, record: newRec };
  };

  const recordPayment: TenantContextType['recordPayment'] = (data) => {
    const activeGymId = (data as any).gym_id || effectiveGymId || gymsList[0]?.id;
    if (!activeGymId) throw new Error('No active gym found');
    const member = membersList.find((m) => m.id === data.member_id);
    const plan = plansList.find((p) => p.id === data.membership_plan_id);

    const newPayment: Payment = {
      ...data,
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gym_id: activeGymId, // ENFORCE TENANT ISOLATION
      created_at: new Date().toISOString(),
      member_name: member?.full_name,
      member_code: member?.member_code,
      plan_name: plan?.name,
    };

    setPaymentsList((prev) => [newPayment, ...prev]);

    // Automatically update member membership end date if plan selected
    if (member && plan) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.duration_months);

      updateMember(member.id, {
        membership_plan_id: plan.id,
        membership_start: startDate.toISOString().split('T')[0],
        membership_end: endDate.toISOString().split('T')[0],
        status: 'active',
      });
    }

    logAuditAction('PAYMENT_RECORDED', 'payment', newPayment.id, { amount: newPayment.amount, member_code: member?.member_code });

    return newPayment;
  };

  const addStaff: TenantContextType['addStaff'] = (data) => {
    const activeGymId = (data as any).gym_id || effectiveGymId || gymsList[0]?.id;
    if (!activeGymId) throw new Error('No active gym found');
    const newStaff: StaffMember = {
      ...data,
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gym_id: activeGymId,
      created_at: new Date().toISOString(),
    };
    setStaffList((prev) => [newStaff, ...prev]);
    logAuditAction('STAFF_ADDED', 'staff', newStaff.id, { name: newStaff.full_name, email: newStaff.email });
    return newStaff;
  };

  const updateStaffPermissions: TenantContextType['updateStaffPermissions'] = (staffId, permissions) => {
    setStaffList((prev) => prev.map((s) => (s.id === staffId ? { ...s, permissions } : s)));
    logAuditAction('STAFF_PERMISSIONS_UPDATED', 'staff', staffId, { permissions });
  };

  const addEnquiry: TenantContextType['addEnquiry'] = (data) => {
    const activeGymId = (data as any).gym_id || effectiveGymId || gymsList[0]?.id;
    if (!activeGymId) throw new Error('No active gym found');
    const assignedStaff = staffList.find((s) => s.id === data.assigned_staff_id);
    const newEnquiry: Enquiry = {
      ...data,
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      gym_id: activeGymId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_staff_name: assignedStaff?.full_name,
    };
    setEnquiriesList((prev) => [newEnquiry, ...prev]);
    logAuditAction('ENQUIRY_ADDED', 'enquiry', newEnquiry.id, { name: newEnquiry.name, status: newEnquiry.status });
    return newEnquiry;
  };

  const updateEnquiryStatus: TenantContextType['updateEnquiryStatus'] = (id, status) => {
    setEnquiriesList((prev) => prev.map((e) => (e.id === id ? { ...e, status, updated_at: new Date().toISOString() } : e)));
    logAuditAction('ENQUIRY_STATUS_CHANGED', 'enquiry', id, { status });
  };

  const convertEnquiryToMember: TenantContextType['convertEnquiryToMember'] = (enquiryId, planId) => {
    const enquiry = enquiriesList.find((e) => e.id === enquiryId);
    const activeGymId = enquiry?.gym_id || effectiveGymId || gymsList[0]?.id;
    if (!enquiry || !activeGymId) return null;

    const plan = plansList.find((p) => p.id === planId);
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (plan) endDate.setMonth(endDate.getMonth() + plan.duration_months);

    // Create member from enquiry
    const newMember = addMember({
      member_code: '',
      full_name: enquiry.name,
      phone: enquiry.phone,
      email: enquiry.email,
      gender: 'other',
      joining_date: startDate.toISOString().split('T')[0],
      membership_plan_id: planId,
      membership_start: startDate.toISOString().split('T')[0],
      membership_end: endDate.toISOString().split('T')[0],
      status: 'active',
      notes: `Converted from lead. ${enquiry.notes || ''}`,
    });

    // Update enquiry status
    updateEnquiryStatus(enquiryId, 'converted');

    // Create initial payment
    if (plan) {
      recordPayment({
        member_id: newMember.id,
        membership_plan_id: plan.id,
        amount: plan.price,
        payment_method: 'cash',
        payment_date: startDate.toISOString().split('T')[0],
        status: 'paid',
        notes: 'Initial membership payment upon lead conversion',
      });
    }

    return newMember;
  };

  const addExpense: TenantContextType['addExpense'] = (data) => {
    const activeGymId = (data as any).gym_id || effectiveGymId || gymsList[0]?.id;
    if (!activeGymId) throw new Error('No active gym found');
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      gym_id: activeGymId,
      created_at: new Date().toISOString(),
      created_by_name: profile?.full_name,
    };
    setExpensesList((prev) => [newExpense, ...prev]);
    logAuditAction('EXPENSE_RECORDED', 'expense', newExpense.id, { title: newExpense.title, amount: newExpense.amount });
    return newExpense;
  };

  const toggleGymFeature: TenantContextType['toggleGymFeature'] = (gymId, featureKey, enabled) => {
    setFeaturesList((prev) => {
      const existing = prev.find((f) => f.gym_id === gymId && f.feature_key === featureKey);
      if (existing) {
        return prev.map((f) => (f.id === existing.id ? { ...f, enabled, updated_at: new Date().toISOString() } : f));
      }
      return [
        ...prev,
        {
          id: `feat-${Date.now()}`,
          gym_id: gymId,
          feature_key: featureKey as any,
          enabled,
          updated_at: new Date().toISOString(),
        },
      ];
    });
    logAuditAction('FEATURE_FLAG_TOGGLED', 'gym_feature', gymId, { featureKey, enabled });
  };

  const addGym: TenantContextType['addGym'] = (data) => {
    if (profile?.role !== 'superadmin') throw new Error('Unauthorized');
    const newGym: Gym = {
      ...data,
      id: `gym-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setGymsList((prev) => [...prev, newGym]);
    addDynamicGym(newGym);

    // Enable default features for new gym
    const defaultKeys: GymFeature['feature_key'][] = [
      'attendance', 'payments', 'memberships', 'expenses', 'enquiries', 'staff_management', 'reports', 'advanced_reports', 'notifications'
    ];
    const newFeats: GymFeature[] = defaultKeys.map((key) => ({
      id: `f-${newGym.id}-${key}`,
      gym_id: newGym.id,
      feature_key: key,
      enabled: true,
      updated_at: new Date().toISOString(),
    }));
    setFeaturesList((prev) => [...prev, ...newFeats]);

    logAuditAction('GYM_CREATED', 'gym', newGym.id, { name: newGym.name, slug: newGym.slug });
    return newGym;
  };

  const updateGymStatus: TenantContextType['updateGymStatus'] = (gymId, status) => {
    if (profile?.role !== 'superadmin') throw new Error('Unauthorized');
    setGymsList((prev) => prev.map((g) => (g.id === gymId ? { ...g, status, updated_at: new Date().toISOString() } : g)));
    logAuditAction('GYM_STATUS_CHANGED', 'gym', gymId, { status });
  };

  const deleteGym: TenantContextType['deleteGym'] = (gymId) => {
    if (profile?.role !== 'superadmin') throw new Error('Unauthorized');
    const targetGym = gymsList.find((g) => g.id === gymId);
    setGymsList((prev) => prev.filter((g) => g.id !== gymId));
    setMembersList((prev) => prev.filter((m) => m.gym_id !== gymId));
    setPlansList((prev) => prev.filter((p) => p.gym_id !== gymId));
    setPaymentsList((prev) => prev.filter((p) => p.gym_id !== gymId));
    setStaffList((prev) => prev.filter((s) => s.gym_id !== gymId));
    setEnquiriesList((prev) => prev.filter((e) => e.gym_id !== gymId));
    setExpensesList((prev) => prev.filter((e) => e.gym_id !== gymId));
    logAuditAction('GYM_DELETED', 'gym', gymId, { name: targetGym?.name || 'Gym Tenant' });
  };

  const markNotificationRead = (id: string) => {
    setNotificationsList((prev) => prev.map((n) => (n.id === id ? { ...n, read_status: true } : n)));
  };

  const logAuditAction = (action: string, entity: string, entity_id: string, metadata: Record<string, any>) => {
    const currentGymName = gymsList.find((g) => g.id === effectiveGymId)?.name || 'Platform';
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      gym_id: effectiveGymId,
      user_id: profile?.id,
      action,
      entity,
      entity_id,
      metadata,
      created_at: new Date().toISOString(),
      user_name: profile?.full_name || 'System',
      gym_name: currentGymName,
    };
    setAuditLogsList((prev) => [newLog, ...prev]);
  };

  return (
    <TenantContext.Provider
      value={{
        members: scopedMembers,
        plans: scopedPlans,
        attendance: scopedAttendance,
        payments: scopedPayments,
        staff: scopedStaff,
        enquiries: scopedEnquiries,
        expenses: scopedExpenses,
        notifications: scopedNotifications,
        auditLogs: scopedAuditLogs,
        features: scopedFeatures,
        gyms: gymsList,

        addMember,
        updateMember,
        deleteMember,
        addPlan,
        updatePlan,
        recordAttendance,
        recordPayment,
        addStaff,
        updateStaffPermissions,
        addEnquiry,
        updateEnquiryStatus,
        convertEnquiryToMember,
        addExpense,
        toggleGymFeature,
        addGym,
        updateGymStatus,
        deleteGym,
        markNotificationRead,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
