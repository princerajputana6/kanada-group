INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('1e06d364-5cca-4025-9787-480fc8d88acc', 'Kanada Admin', 'admin@kanadagroup.dev', '$2a$10$hHo/CMC84dtBAFTAvOGtkuzfVOd1ioG.yE9sJIYLngWyuf3Fx9ll6', 'ADMIN', 'Platform administrator.', 1787430118),
    ('6bc0cb28-f358-45a5-b2b1-c741f585df08', 'Dr. Vibhu Srivastava', 'teacher@kanadagroup.dev', '$2a$10$hHo/CMC84dtBAFTAvOGtkuzfVOd1ioG.yE9sJIYLngWyuf3Fx9ll6', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787430118),
    ('43cf5cb1-9458-4a1b-a37f-fca3500dc258', 'Demo Student', 'student@kanadagroup.dev', '$2a$10$hHo/CMC84dtBAFTAvOGtkuzfVOd1ioG.yE9sJIYLngWyuf3Fx9ll6', 'STUDENT', 'Learning VLSI design.', 1787430118);

INSERT INTO categories (id, name, slug) VALUES
    ('8570085d-7e68-4f2c-b07e-04eebd24751d', 'VLSI Design', 'vlsi-design');

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
    ('91e4e11e-61b0-4e90-800a-380301dab11d', 'Digital VLSI Design Fundamentals', 'digital-vlsi-design-fundamentals', 'A foundation course covering semiconductor physics, CMOS technology, and digital logic design — the first weeks of Kanada Group''s VLSI training program.', 'VLSI Design', 'BEGINNER', 1, 1, '6bc0cb28-f358-45a5-b2b1-c741f585df08', 1787430118);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('1c777659-23dd-42df-89b8-a5292917542b', '91e4e11e-61b0-4e90-800a-380301dab11d', 'Semiconductor Fundamentals', 0),
    ('8e57b253-2613-443a-b375-fd0c7a28b3f7', '91e4e11e-61b0-4e90-800a-380301dab11d', 'CMOS Inverter Fundamentals', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('89eca4e5-2b1b-437e-afe9-f6703aac63c5', '1c777659-23dd-42df-89b8-a5292917542b', 'Introduction to Semiconductor Physics', 'TEXT', 'Welcome to the course! This lesson covers energy bands, charge carriers, and the basics of semiconductor physics.', 0, 1),
    ('86e20da1-f43d-42ee-b8d9-f5df99bbe468', '1c777659-23dd-42df-89b8-a5292917542b', 'MOS Capacitor Characteristics', 'VIDEO', NULL, 1, 0),
    ('668121fb-658c-4bd8-b9d3-896e7eec6d41', '8e57b253-2613-443a-b375-fd0c7a28b3f7', 'CMOS Inverter Operation', 'VIDEO', NULL, 0, 0),
    ('072729a4-e6e6-42f3-b213-d68acf648874', '8e57b253-2613-443a-b375-fd0c7a28b3f7', 'Switching Threshold & Noise Margins', 'TEXT', 'This lesson explains how to derive the switching threshold voltage and noise margins for a CMOS inverter.', 1, 0);

INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
    ('c402a06e-d718-4006-8f53-98dea7255320', '43cf5cb1-9458-4a1b-a37f-fca3500dc258', '91e4e11e-61b0-4e90-800a-380301dab11d', 1787430118);
