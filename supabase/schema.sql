-- =======================================================
-- NESTBEANS MULTI-TENANT GYM CRM SAAS - SCHEMA & RLS
-- =======================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. GYMS TABLE
CREATE TABLE IF NOT EXISTS public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    qr_code_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROFILES TABLE (Tied to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'staff')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MEMBERSHIP PLANS TABLE
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_months INT NOT NULL DEFAULT 1,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    member_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    address TEXT,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    membership_start DATE,
    membership_end DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired', 'frozen', 'cancelled')),
    profile_photo TEXT,
    emergency_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_gym_member_code UNIQUE (gym_id, member_code)
);

-- 5. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    check_out_time TIMESTAMPTZ,
    method TEXT NOT NULL DEFAULT 'qr_code' CHECK (method IN ('qr_code', 'manual', 'kiosk')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    membership_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. STAFF TABLE
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    designation TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    permissions JSONB NOT NULL DEFAULT '{"members": true, "attendance": true, "payments": false, "expenses": false, "reports": false, "enquiries": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. ENQUIRIES TABLE (Leads)
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT NOT NULL DEFAULT 'walk_in' CHECK (source IN ('walk_in', 'website', 'referral', 'social_media', 'other')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'trial', 'converted', 'lost')),
    follow_up_date DATE,
    notes TEXT,
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('rent', 'equipment', 'utilities', 'salaries', 'maintenance', 'marketing', 'other')),
    amount NUMERIC(10, 2) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('expiry_alert', 'payment_reminder', 'system', 'enquiry')),
    read_status BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. GYM FEATURES TABLE (Feature Flags)
CREATE TABLE IF NOT EXISTS public.gym_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_gym_feature UNIQUE (gym_id, feature_key)
);

-- INDEXES FOR MULTI-TENANT QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gym ON public.profiles(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_gym ON public.members(gym_id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_gym ON public.membership_plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym_date ON public.attendance(gym_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_payments_gym_date ON public.payments(gym_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_staff_gym ON public.staff(gym_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_gym ON public.enquiries(gym_id);
CREATE INDEX IF NOT EXISTS idx_expenses_gym_date ON public.expenses(gym_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_notifications_gym_user ON public.notifications(gym_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_gym ON public.audit_logs(gym_id);

-- =======================================================
-- HELPER FUNCTIONS FOR SECURITY & TENANT ISOLATION
-- =======================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_gym_id()
RETURNS UUID AS $$
    SELECT gym_id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_user_id = auth.uid() AND role = 'superadmin' AND status = 'active'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin full access to gyms" ON public.gyms
    FOR ALL USING (public.is_superadmin());

CREATE POLICY "Gym members read own gym metadata" ON public.gyms
    FOR SELECT USING (id = public.get_auth_user_gym_id());

CREATE POLICY "Superadmin full access to profiles" ON public.profiles
    FOR ALL USING (public.is_superadmin());

CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users read profiles in same gym" ON public.profiles
    FOR SELECT USING (gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Admins manage profiles in same gym" ON public.profiles
    FOR ALL USING (
        gym_id = public.get_auth_user_gym_id() AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Tenant RLS for membership_plans" ON public.membership_plans
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for members" ON public.members
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for attendance" ON public.attendance
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for payments" ON public.payments
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for staff" ON public.staff
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for enquiries" ON public.enquiries
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for expenses" ON public.expenses
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for notifications" ON public.notifications
    FOR ALL USING (
        public.is_superadmin() OR 
        (gym_id = public.get_auth_user_gym_id() AND (user_id IS NULL OR user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())))
    );

CREATE POLICY "Tenant RLS for audit_logs" ON public.audit_logs
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());

CREATE POLICY "Tenant RLS for gym_features" ON public.gym_features
    FOR ALL USING (public.is_superadmin() OR gym_id = public.get_auth_user_gym_id());
