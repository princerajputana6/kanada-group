INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('35d20f1d-eb85-48c2-88d1-41f1989cc59f', 'Kanada Admin', 'admin@kanadagroup.dev', '$2a$10$vVEn/R5iWBDEb7lK99ZIKOnrtHLCFdG3k7vWMij84SWn/rkNw2JYy', 'ADMIN', 'Platform administrator.', 1787425977),
    ('ab223a74-2b0d-428e-9104-1cd15e343fbe', 'Dr. Vibhu Srivastava', 'teacher@kanadagroup.dev', '$2a$10$vVEn/R5iWBDEb7lK99ZIKOnrtHLCFdG3k7vWMij84SWn/rkNw2JYy', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787425977),
    ('24ad06d5-a50f-494e-8e93-8401ab68afb0', 'Demo Student', 'student@kanadagroup.dev', '$2a$10$vVEn/R5iWBDEb7lK99ZIKOnrtHLCFdG3k7vWMij84SWn/rkNw2JYy', 'STUDENT', 'Learning VLSI design.', 1787425977);

INSERT INTO categories (id, name, slug) VALUES
    ('bb47553d-5343-4079-86e5-3719608a9123', 'VLSI Design', 'vlsi-design');

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
    ('ed1a6d12-8100-4b7a-9b1f-730a184b8a11', 'Digital VLSI Design Fundamentals', 'digital-vlsi-design-fundamentals', 'A foundation course covering semiconductor physics, CMOS technology, and digital logic design — the first weeks of Kanada Group''s VLSI training program.', 'VLSI Design', 'BEGINNER', 1, 1, 'ab223a74-2b0d-428e-9104-1cd15e343fbe', 1787425977);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('387132a8-efb3-4188-b958-9d4b8cd73cc8', 'ed1a6d12-8100-4b7a-9b1f-730a184b8a11', 'Semiconductor Fundamentals', 0),
    ('c0c8a176-3dac-4ecf-a1c1-8d5deefb7521', 'ed1a6d12-8100-4b7a-9b1f-730a184b8a11', 'CMOS Inverter Fundamentals', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('928a7603-0a71-4b8b-a394-daf7ba649f20', '387132a8-efb3-4188-b958-9d4b8cd73cc8', 'Introduction to Semiconductor Physics', 'TEXT', 'Welcome to the course! This lesson covers energy bands, charge carriers, and the basics of semiconductor physics.', 0, 1),
    ('53e61525-6efe-40dd-abca-f6c7d71410b3', '387132a8-efb3-4188-b958-9d4b8cd73cc8', 'MOS Capacitor Characteristics', 'VIDEO', NULL, 1, 0),
    ('be2c4165-50d4-4f5d-93a1-2ec68f4028f5', 'c0c8a176-3dac-4ecf-a1c1-8d5deefb7521', 'CMOS Inverter Operation', 'VIDEO', NULL, 0, 0),
    ('f63d2200-c32e-4ec0-bb9f-c69311809e83', 'c0c8a176-3dac-4ecf-a1c1-8d5deefb7521', 'Switching Threshold & Noise Margins', 'TEXT', 'This lesson explains how to derive the switching threshold voltage and noise margins for a CMOS inverter.', 1, 0);

INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
    ('a9373597-8e01-4008-b515-bf53dfbe4c09', '24ad06d5-a50f-494e-8e93-8401ab68afb0', 'ed1a6d12-8100-4b7a-9b1f-730a184b8a11', 1787425977);
