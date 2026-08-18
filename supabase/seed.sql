-- =======================================================
-- NESTBEANS MULTI-TENANT GYM CRM SAAS - SEED DATA (INDIAN FORMAT)
-- =======================================================

-- 1. SEED GYMS
INSERT INTO public.gyms (id, name, slug, logo_url, phone, email, address, status, qr_code_token)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'BTC Gym & Fitness', 'btc-gym', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150', '+91 98765 43210', 'contact@btcgym.com', '100 Metro Plaza, Suite 4A, Mumbai, MH', 'active', 'qr-btc-gym-001'),
    ('22222222-2222-2222-2222-222222222222', 'XYZ Power Workout', 'xyz-gym', 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=150', '+91 98765 43211', 'info@xyzgym.com', '45 MG Road, Bengaluru, KA', 'active', 'qr-xyz-gym-002'),
    ('33333333-3333-3333-3333-333333333333', 'ABC Elite Club', 'abc-fitness', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=150', '+91 98765 43212', 'support@abcfitness.com', '88 Connaught Place, New Delhi, DL', 'active', 'qr-abc-gym-003')
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED MEMBERSHIP PLANS (IN RUPEES ₹)
INSERT INTO public.membership_plans (id, gym_id, name, duration_months, price, description, status) VALUES
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Monthly Standard', 1, 2499.00, 'Access to fitness floor & cardio equipment', 'active'),
    ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Quarterly Pro', 3, 6999.00, 'Full access + locker & personal trainer consult', 'active'),
    ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Annual Elite Pass', 12, 19999.00, 'Unlimited 24/7 access + group classes + steam room', 'active'),

    ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'XYZ Starter', 1, 1999.00, 'Standard gym access', 'active'),
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'XYZ Beast Mode (6 Mo)', 6, 10999.00, 'Includes crossfit & heavy weights area', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MEMBERS FOR BTC GYM
INSERT INTO public.members (id, gym_id, member_code, full_name, phone, email, gender, date_of_birth, address, joining_date, membership_plan_id, membership_start, membership_end, status, profile_photo, emergency_contact, notes) VALUES
    ('m1000001-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BTC-1001', 'Alex Johnson', '+91 98765 43230', 'alex.j@example.com', 'male', '1992-05-14', '742 Park Avenue, Mumbai', '2026-01-10', 'a3333333-3333-3333-3333-333333333333', '2026-01-10', '2027-01-10', 'active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Sarah Johnson (+91 98765 43290)', 'Prefers morning workouts'),
    ('m1000002-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BTC-1002', 'Sophia Martinez', '+91 98765 43231', 'sophia.m@example.com', 'female', '1995-11-20', '123 Marine Drive, Mumbai', '2026-06-01', 'a2222222-2222-2222-2222-222222222222', '2026-06-01', '2026-09-01', 'expiring_soon', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Carlos Martinez (+91 98765 43291)', 'Spinning enthusiast'),
    ('m1000003-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'BTC-1003', 'David Smith', '+91 98765 43232', 'david.s@example.com', 'male', '1988-03-04', '456 Bandra West, Mumbai', '2026-04-15', 'a1111111-1111-1111-1111-111111111111', '2026-04-15', '2026-05-15', 'expired', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'Emma Smith (+91 98765 43292)', 'Needs renewal reminder')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED PAYMENTS (IN RUPEES ₹)
INSERT INTO public.payments (gym_id, member_id, membership_plan_id, amount, payment_method, payment_date, transaction_id, status, notes) VALUES
    ('11111111-1111-1111-1111-111111111111', 'm1000001-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 19999.00, 'card', '2026-01-10', 'TXN-BTC-901', 'paid', 'Annual subscription full payment'),
    ('11111111-1111-1111-1111-111111111111', 'm1000002-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 6999.00, 'upi', '2026-06-01', 'TXN-BTC-902', 'paid', 'Quarterly renewal');

-- 5. SEED EXPENSES (IN RUPEES ₹)
INSERT INTO public.expenses (gym_id, title, category, amount, expense_date, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Monthly Plaza Rent', 'rent', 150000.00, '2026-08-01', 'August building lease payment'),
    ('11111111-1111-1111-1111-111111111111', 'Treadmill Maintenance', 'maintenance', 15000.00, '2026-08-05', 'Belt replacement for 3 treadmills');
