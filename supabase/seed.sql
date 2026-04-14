-- Seed data for local development
-- Inserts 15 sample students across all departments and year groups

-- Step 1: Insert into auth.users (required by FK constraint)
INSERT INTO auth.users (id, email, aud, role, email_confirmed_at, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'aisha.mohammed@uog.edu.gy',   'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'ravi.persaud@uog.edu.gy',     'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'kezia.james@uog.edu.gy',      'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'omar.ali@uog.edu.gy',         'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'priya.singh@uog.edu.gy',      'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000006', 'marcus.ford@uog.edu.gy',      'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000007', 'latoya.chase@uog.edu.gy',     'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000008', 'dev.ramkhelawan@uog.edu.gy',  'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000009', 'tiana.burnett@uog.edu.gy',    'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000010', 'andre.lucas@uog.edu.gy',      'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000011', 'nadia.outar@uog.edu.gy',      'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000012', 'jason.charles@uog.edu.gy',    'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000013', 'simone.king@uog.edu.gy',      'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000014', 'kiran.toolsie@uog.edu.gy',    'authenticated', 'authenticated', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000015', 'yolanda.henry@uog.edu.gy',    'authenticated', 'authenticated', now(), now(), now())
ON CONFLICT (id) DO NOTHING;


-- Step 2: Insert into public.users
INSERT INTO public.users (id, email, student_id, display_name, department, enrolment_year, overall_gpa, email_verified)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'aisha.mohammed@uog.edu.gy',  '2025100001', 'Aisha Mohammed',    'Computer Science',           2025, 3.92, true),
  ('00000000-0000-0000-0000-000000000002', 'ravi.persaud@uog.edu.gy',    '2025100002', 'Ravi Persaud',      'Engineering',                2025, 3.78, true),
  ('00000000-0000-0000-0000-000000000003', 'kezia.james@uog.edu.gy',     '2024100003', 'Kezia James',       'Medical Sciences',           2024, 3.85, true),
  ('00000000-0000-0000-0000-000000000004', 'omar.ali@uog.edu.gy',        '2024100004', 'Omar Ali',          'Business & Entrepreneurship',2024, 3.41, true),
  ('00000000-0000-0000-0000-000000000005', 'priya.singh@uog.edu.gy',     '2024100005', 'Priya Singh',       'Natural Sciences',           2024, 3.67, true),
  ('00000000-0000-0000-0000-000000000006', 'marcus.ford@uog.edu.gy',     '2023100006', 'Marcus Ford',       'Information Systems',        2023, 3.55, true),
  ('00000000-0000-0000-0000-000000000007', 'latoya.chase@uog.edu.gy',    '2023100007', 'Latoya Chase',      'Social Sciences',            2023, 3.20, true),
  ('00000000-0000-0000-0000-000000000008', 'dev.ramkhelawan@uog.edu.gy', '2023100008', 'Dev Ramkhelawan',   'Computer Science',           2023, 3.88, true),
  ('00000000-0000-0000-0000-000000000009', 'tiana.burnett@uog.edu.gy',   '2022100009', 'Tiana Burnett',     'Education & Humanities',     2022, 3.30, true),
  ('00000000-0000-0000-0000-000000000010', 'andre.lucas@uog.edu.gy',     '2022100010', 'Andre Lucas',       'Engineering',                2022, 3.72, true),
  ('00000000-0000-0000-0000-000000000011', 'nadia.outar@uog.edu.gy',     '2022100011', 'Nadia Outar',       'Agriculture & Forestry',     2022, 3.48, true),
  ('00000000-0000-0000-0000-000000000012', 'jason.charles@uog.edu.gy',   '2025100012', 'Jason Charles',     'Behavioural Sciences',       2025, 3.10, true),
  ('00000000-0000-0000-0000-000000000013', 'simone.king@uog.edu.gy',     '2023100013', 'Simone King',       'Environmental Studies',      2023, 3.60, true),
  ('00000000-0000-0000-0000-000000000014', 'kiran.toolsie@uog.edu.gy',   '2024100014', 'Kiran Toolsie',     'Natural Sciences',           2024, 3.95, true),
  ('00000000-0000-0000-0000-000000000015', 'yolanda.henry@uog.edu.gy',   '2022100015', 'Yolanda Henry',     'Medical Sciences',           2022, 3.76, true)
ON CONFLICT (id) DO NOTHING;


-- Step 3: Insert per-year GPA entries
INSERT INTO public.gpa_per_year (user_id, academic_year, gpa)
VALUES
  -- Aisha Mohammed (Year 1, CS)
  ('00000000-0000-0000-0000-000000000001', '2025/2026', 3.92),

  -- Ravi Persaud (Year 1, Engineering)
  ('00000000-0000-0000-0000-000000000002', '2025/2026', 3.78),

  -- Kezia James (Year 2, Medical Sciences)
  ('00000000-0000-0000-0000-000000000003', '2025/2026', 3.85),
  ('00000000-0000-0000-0000-000000000003', '2024/2025', 3.80),

  -- Omar Ali (Year 2, Business)
  ('00000000-0000-0000-0000-000000000004', '2025/2026', 3.41),
  ('00000000-0000-0000-0000-000000000004', '2024/2025', 3.35),

  -- Priya Singh (Year 2, Natural Sciences)
  ('00000000-0000-0000-0000-000000000005', '2025/2026', 3.67),
  ('00000000-0000-0000-0000-000000000005', '2024/2025', 3.60),

  -- Marcus Ford (Year 3, Information Systems)
  ('00000000-0000-0000-0000-000000000006', '2025/2026', 3.55),
  ('00000000-0000-0000-0000-000000000006', '2024/2025', 3.50),
  ('00000000-0000-0000-0000-000000000006', '2023/2024', 3.48),

  -- Latoya Chase (Year 3, Social Sciences)
  ('00000000-0000-0000-0000-000000000007', '2025/2026', 3.20),
  ('00000000-0000-0000-0000-000000000007', '2024/2025', 3.10),
  ('00000000-0000-0000-0000-000000000007', '2023/2024', 3.05),

  -- Dev Ramkhelawan (Year 3, CS)
  ('00000000-0000-0000-0000-000000000008', '2025/2026', 3.88),
  ('00000000-0000-0000-0000-000000000008', '2024/2025', 3.90),
  ('00000000-0000-0000-0000-000000000008', '2023/2024', 3.85),

  -- Tiana Burnett (Year 4, Education & Humanities)
  ('00000000-0000-0000-0000-000000000009', '2025/2026', 3.30),
  ('00000000-0000-0000-0000-000000000009', '2024/2025', 3.25),
  ('00000000-0000-0000-0000-000000000009', '2023/2024', 3.20),
  ('00000000-0000-0000-0000-000000000009', '2022/2023', 3.15),

  -- Andre Lucas (Year 4, Engineering)
  ('00000000-0000-0000-0000-000000000010', '2025/2026', 3.72),
  ('00000000-0000-0000-0000-000000000010', '2024/2025', 3.68),
  ('00000000-0000-0000-0000-000000000010', '2023/2024', 3.75),
  ('00000000-0000-0000-0000-000000000010', '2022/2023', 3.70),

  -- Nadia Outar (Year 4, Agriculture & Forestry)
  ('00000000-0000-0000-0000-000000000011', '2025/2026', 3.48),
  ('00000000-0000-0000-0000-000000000011', '2024/2025', 3.45),
  ('00000000-0000-0000-0000-000000000011', '2023/2024', 3.50),
  ('00000000-0000-0000-0000-000000000011', '2022/2023', 3.40),

  -- Jason Charles (Year 1, Behavioural Sciences)
  ('00000000-0000-0000-0000-000000000012', '2025/2026', 3.10),

  -- Simone King (Year 3, Environmental Studies)
  ('00000000-0000-0000-0000-000000000013', '2025/2026', 3.60),
  ('00000000-0000-0000-0000-000000000013', '2024/2025', 3.55),
  ('00000000-0000-0000-0000-000000000013', '2023/2024', 3.58),

  -- Kiran Toolsie (Year 2, Natural Sciences)
  ('00000000-0000-0000-0000-000000000014', '2025/2026', 3.95),
  ('00000000-0000-0000-0000-000000000014', '2024/2025', 3.90),

  -- Yolanda Henry (Year 4, Medical Sciences)
  ('00000000-0000-0000-0000-000000000015', '2025/2026', 3.76),
  ('00000000-0000-0000-0000-000000000015', '2024/2025', 3.80),
  ('00000000-0000-0000-0000-000000000015', '2023/2024', 3.72),
  ('00000000-0000-0000-0000-000000000015', '2022/2023', 3.65)
ON CONFLICT (user_id, academic_year) DO NOTHING;
