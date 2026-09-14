DELETE FROM lesson_progress;
   DELETE FROM reviews;
   DELETE FROM enrollments;
   DELETE FROM lessons;
   DELETE FROM sections;
   DELETE FROM courses;
   DELETE FROM categories;
   DELETE FROM users WHERE email LIKE '%@kanadagroup.dev';

INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('547d57ec-9937-4c10-bdac-b9c7d794f8ab', 'Kanada Admin', 'admin@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'ADMIN', 'Platform administrator.', 1787479017),
    ('f77a39cd-59d6-4908-a565-82fa09af2acb', 'Demo Student', 'student@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'STUDENT', 'Learning VLSI design.', 1787479017),
    ('3b71a952-3915-4c10-bb65-2b5857c20289', 'Dr. Vibhu Srivastava', 'teacher@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787479017),
    ('47563363-354b-4175-b12c-a1bbc748aa2f', 'Dr. Anshul Verma', 'teacher2@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787479017),
    ('d1eca4e3-9125-40fd-b23f-718a2151d671', 'Er. Deepak', 'teacher3@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787479017),
    ('68b1bbf2-84f3-4d63-9028-e0519ed9237e', 'Dr. Rahul Mishra', 'teacher4@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787479017),
    ('41391515-f297-4bfa-afa8-09624cc832ae', 'Er. Tejal Patel', 'teacher5@kanadagroup.dev', '$2a$10$ewXcfpOnZ3HprS4U/AIpxetk8QD3EFGNxULot72mRsCCfA/me3xQG', 'TEACHER', 'VLSI faculty at Kanada Group.', 1787479017);

INSERT INTO categories (id, name, slug) VALUES
    ('bf55a2f3-9d11-4ab2-8cbd-8ca0e8766600', 'Foundations', 'foundations'),
    ('ef803db9-b5c1-4587-9fff-0375085ff4bb', 'Digital VLSI', 'digital-vlsi'),
    ('6393c316-2a9b-4dac-a51e-ca3d8b11c375', 'Analog VLSI', 'analog-vlsi');

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('28654b89-4e0b-4884-941e-a60a41a094e3', 'Semiconductor Physics & Device Fundamentals', 'semiconductor-physics-device-fundamentals', 'Energy bands, charge carriers, and MOS capacitor behavior — the physics foundation every VLSI engineer needs before touching a transistor model.', 'Foundations', 'BEGINNER', 1, 1, '3b71a952-3915-4c10-bb65-2b5857c20289', 1787425017);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('6d059a8a-c462-467f-9075-8e369ec83418', '28654b89-4e0b-4884-941e-a60a41a094e3', 'Semiconductor Fundamentals', 0),
    ('9e39eef2-9005-4250-ae30-da2adc131a75', '28654b89-4e0b-4884-941e-a60a41a094e3', 'MOS Capacitor Characteristics', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('57d26f7b-fae1-48e2-a3c9-8ab4c84a7b62', '6d059a8a-c462-467f-9075-8e369ec83418', 'Introduction to Semiconductor Physics', 'TEXT', 'Welcome to the course! This lesson covers energy bands, charge carriers, and the basics of semiconductor physics.', 0, 1),
    ('3051d9e0-a5b2-46e8-a1e6-9dd85d9821aa', '6d059a8a-c462-467f-9075-8e369ec83418', 'Charge Distribution & Energy Band Diagrams', 'VIDEO', NULL, 1, 0),
    ('1deca43d-70fc-4d4b-a885-6a06245b5560', '9e39eef2-9005-4250-ae30-da2adc131a75', 'The Ideal MOS Capacitor Model', 'VIDEO', NULL, 0, 0),
    ('64b318f0-ccf0-4ce2-8cac-98d2120ce25b', '9e39eef2-9005-4250-ae30-da2adc131a75', 'Accumulation, Depletion & Inversion', 'TEXT', 'This lesson walks through the three operating regions of a MOS capacitor and how C-V characteristics reveal them.', 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('1fafdcd4-aebe-4b3e-817a-b8e675091696', 'MOSFET & CMOS Fabrication Technology', 'mosfet-cmos-fabrication-technology', 'MOSFET structure, modes of operation, threshold voltage, and the full CMOS fabrication process from oxidation to metallization.', 'Foundations', 'BEGINNER', 1, 1, '3b71a952-3915-4c10-bb65-2b5857c20289', 1787428617);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('b0320257-e340-4607-b3b8-3c10c5fdfabd', '1fafdcd4-aebe-4b3e-817a-b8e675091696', 'MOSFET Fundamentals', 0),
    ('05403b61-71eb-4cb4-b1e3-06b977e88ef8', '1fafdcd4-aebe-4b3e-817a-b8e675091696', 'CMOS Fabrication Technology', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('f4299912-f522-4670-be6f-3c83dd6cb24c', 'b0320257-e340-4607-b3b8-3c10c5fdfabd', 'MOSFET Introduction & Structure', 'VIDEO', NULL, 0, 1),
    ('808dfc41-21aa-48e1-96f2-1176d447dd8d', 'b0320257-e340-4607-b3b8-3c10c5fdfabd', 'Threshold Voltage & Body Effect', 'TEXT', 'Derives the threshold voltage equation and explains how substrate bias shifts it via the body effect.', 1, 0),
    ('877249b4-1b54-40b5-a6e0-2c2f6caf8c99', '05403b61-71eb-4cb4-b1e3-06b977e88ef8', 'Oxidation, Diffusion & Ion Implantation', 'VIDEO', NULL, 0, 0),
    ('ee625168-9be2-45bc-a37d-d02cadb9274a', '05403b61-71eb-4cb4-b1e3-06b977e88ef8', 'Lithography, Metallization & Process Flow', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('d50d0fd9-ea3a-4bb2-a465-48ee8497eb54', 'CMOS Inverter & Basic Analog Circuits', 'cmos-inverter-basic-analog-circuits', 'Static CMOS inverter DC characteristics, noise margins, sizing trade-offs, and an introduction to diodes and PN junctions.', 'Foundations', 'BEGINNER', 1, 1, '47563363-354b-4175-b12c-a1bbc748aa2f', 1787432217);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('978b3dd8-b777-42c7-b4e6-2f9ebafcc5c3', 'd50d0fd9-ea3a-4bb2-a465-48ee8497eb54', 'CMOS Inverter Fundamentals', 0),
    ('d4b18348-88fe-4380-847f-89736c06e0f4', 'd50d0fd9-ea3a-4bb2-a465-48ee8497eb54', 'Basic Analog Circuits', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('d556296b-e6db-4c3d-9b29-20c720cfd176', '978b3dd8-b777-42c7-b4e6-2f9ebafcc5c3', 'CMOS Inverter Operation', 'VIDEO', NULL, 0, 1),
    ('4af6858b-2a08-4a9d-bd88-2608d50908ab', '978b3dd8-b777-42c7-b4e6-2f9ebafcc5c3', 'Switching Threshold & Noise Margins', 'TEXT', 'This lesson explains how to derive the switching threshold voltage and noise margins for a CMOS inverter.', 1, 0),
    ('741541bf-0a5b-402c-8363-f1f9a6d5db5a', 'd4b18348-88fe-4380-847f-89736c06e0f4', 'PN Junctions & Diode Applications', 'VIDEO', NULL, 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('c609e24c-e227-4a05-8846-d3f24aecf93c', 'Combinational Logic Design with Verilog', 'combinational-logic-design-with-verilog', 'Logic gates, adders, encoders and multiplexers — then Verilog modelling styles and an FPGA architecture overview.', 'Foundations', 'BEGINNER', 1, 1, '47563363-354b-4175-b12c-a1bbc748aa2f', 1787435817);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('288064ac-372c-405b-8050-497ce27e6fc8', 'c609e24c-e227-4a05-8846-d3f24aecf93c', 'Combinational Logic Design', 0),
    ('868f14b9-624d-4bec-a47c-5518a0b038cc', 'c609e24c-e227-4a05-8846-d3f24aecf93c', 'Introduction to Verilog & FPGA', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('fb8bcf25-6727-4156-8866-f17d09de88ea', '288064ac-372c-405b-8050-497ce27e6fc8', 'Logic Gates, Truth Tables & Simplification', 'VIDEO', NULL, 0, 1),
    ('48660c98-9a51-4838-b2ae-09346e4e764b', '288064ac-372c-405b-8050-497ce27e6fc8', 'Adders, Encoders, Decoders & Multiplexers', 'VIDEO', NULL, 1, 0),
    ('2e2c78b6-27b7-446e-bee4-db153d860f95', '868f14b9-624d-4bec-a47c-5518a0b038cc', 'Verilog Modelling Styles & Operators', 'TEXT', 'Covers structural, dataflow, and behavioral modelling styles along with Verilog''s core operators and data types.', 0, 0),
    ('7fd0b19a-d5e6-4752-9122-64fd1a3b9577', '868f14b9-624d-4bec-a47c-5518a0b038cc', 'FPGA Architecture Overview', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('95c6e6e9-8090-46d3-84b2-6170e544d6e8', 'Static CMOS Logic & Alternative Logic Styles', 'static-cmos-logic-alternative-logic-styles', 'Pull-up/pull-down networks, compound gates, pass-transistor logic, transmission gates, and dynamic/domino logic trade-offs.', 'Digital VLSI', 'INTERMEDIATE', 1, 1, 'd1eca4e3-9125-40fd-b23f-718a2151d671', 1787439417);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('d814681f-6dba-4902-88c7-4494a692d559', '95c6e6e9-8090-46d3-84b2-6170e544d6e8', 'Static CMOS Logic Design', 0),
    ('e81d0325-e055-44b2-9f11-765621d318d6', '95c6e6e9-8090-46d3-84b2-6170e544d6e8', 'Alternative Logic Styles', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('3c54c91d-13ca-4c1f-8364-9b140e72fa99', 'd814681f-6dba-4902-88c7-4494a692d559', 'CMOS Logic Gates & Compound Gates', 'VIDEO', NULL, 0, 1),
    ('f369ffe5-add1-49da-ac81-96c654730e1d', 'd814681f-6dba-4902-88c7-4494a692d559', 'Pass Transistor Logic & Transmission Gates', 'VIDEO', NULL, 1, 0),
    ('75a7dc4b-58e8-4a73-851a-27c8130475b8', 'e81d0325-e055-44b2-9f11-765621d318d6', 'Dynamic, Domino & Tristate Logic', 'TEXT', 'Compares dynamic and domino logic families against static CMOS, covering their advantages and charge-sharing limitations.', 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('0edfb67d-e591-4d4f-bdf4-2eebe144df57', 'Digital Layout & Delay Modeling', 'digital-layout-delay-modeling', 'Stick diagrams, CMOS layout and design rules, then RC delay models, Elmore delay, and logical effort for delay optimization.', 'Digital VLSI', 'INTERMEDIATE', 1, 1, 'd1eca4e3-9125-40fd-b23f-718a2151d671', 1787443017);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('31cd2720-25b6-45cd-8d0b-d45160c1db3a', '0edfb67d-e591-4d4f-bdf4-2eebe144df57', 'Digital Layout Design', 0),
    ('b2435570-6baa-4684-b2fd-7eb589e9623b', '0edfb67d-e591-4d4f-bdf4-2eebe144df57', 'Delay Modelling & Logical Effort', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('5d852045-9acb-47d4-953b-e4d74dd83128', '31cd2720-25b6-45cd-8d0b-d45160c1db3a', 'Stick Diagrams & CMOS Layout Basics', 'VIDEO', NULL, 0, 1),
    ('9250d057-e8d8-48d8-9966-ab223dbc5dae', '31cd2720-25b6-45cd-8d0b-d45160c1db3a', 'Interconnects, Vias & Design Rules', 'TEXT', 'Explains DRC considerations and layout optimization techniques for dense digital layouts.', 1, 0),
    ('1cfd7d50-12ac-4687-a420-dac55dc29b31', 'b2435570-6baa-4684-b2fd-7eb589e9623b', 'RC Delay Models & Effective Resistance', 'VIDEO', NULL, 0, 0),
    ('58fef1ca-d2a8-413a-a891-5adad50ec4da', 'b2435570-6baa-4684-b2fd-7eb589e9623b', 'Elmore Delay & Logical Effort', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('5afb0ecc-aec0-49f4-b96e-412abdda9288', 'CMOS Power Analysis & Sequential Circuit Design', 'cmos-power-analysis-sequential-circuit-design', 'Dynamic, static, and leakage power estimation, followed by storage elements, flip-flops, and an intro to static timing analysis.', 'Digital VLSI', 'INTERMEDIATE', 1, 1, '68b1bbf2-84f3-4d63-9028-e0519ed9237e', 1787446617);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('70849051-07db-45c4-acce-7bef4b3cb2fa', '5afb0ecc-aec0-49f4-b96e-412abdda9288', 'CMOS Power Analysis', 0),
    ('d16b8d17-505c-4b2e-bdcb-82330022df08', '5afb0ecc-aec0-49f4-b96e-412abdda9288', 'Sequential Circuit Design', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('a2dc5b8c-76bb-434d-868a-1c2e9afc6b1d', '70849051-07db-45c4-acce-7bef4b3cb2fa', 'Dynamic, Static & Leakage Power', 'VIDEO', NULL, 0, 1),
    ('e1e17dc4-1193-4eab-91ac-74cc8f07303a', '70849051-07db-45c4-acce-7bef4b3cb2fa', 'Power-Performance Trade-offs', 'TEXT', 'Discusses how to balance power estimation results against performance targets during design.', 1, 0),
    ('6e5115b5-12cd-4fe6-b608-a63e09612214', 'd16b8d17-505c-4b2e-bdcb-82330022df08', 'SR/D Latches & Edge-Triggered Flip-Flops', 'VIDEO', NULL, 0, 0),
    ('4ec714f1-cd28-4119-801c-f9d517b21eb5', 'd16b8d17-505c-4b2e-bdcb-82330022df08', 'Introduction to Static Timing Analysis', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('503487c2-8775-42ba-8b3f-b4cb7ab3173e', 'RTL Design, Synthesis & FSMs', 'rtl-design-synthesis-fsms', 'Synthesizable Verilog and RTL coding guidelines, functional verification basics, and Moore/Mealy finite state machine design.', 'Digital VLSI', 'INTERMEDIATE', 1, 1, '68b1bbf2-84f3-4d63-9028-e0519ed9237e', 1787450217);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('5fafae49-4b51-4bff-8428-63c94231a686', '503487c2-8775-42ba-8b3f-b4cb7ab3173e', 'RTL Design & Logic Synthesis', 0),
    ('45043c21-3a78-4734-b2e1-584296d68627', '503487c2-8775-42ba-8b3f-b4cb7ab3173e', 'Registers, Counters & FSMs', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('ddb16adb-83ad-4483-864d-9acea6da683f', '5fafae49-4b51-4bff-8428-63c94231a686', 'RTL Coding Guidelines & Synthesizable Verilog', 'VIDEO', NULL, 0, 1),
    ('cadc9cbb-b436-4870-afba-f643137bbeae', '5fafae49-4b51-4bff-8428-63c94231a686', 'Logic Synthesis & Technology Mapping', 'TEXT', 'Covers the synthesis flow from elaboration through technology mapping, area/timing optimization, and netlist generation.', 1, 0),
    ('31b1a92f-520f-41e1-9ad8-30443120fb32', '45043c21-3a78-4734-b2e1-584296d68627', 'Shift Registers, Counters & Frequency Division', 'VIDEO', NULL, 0, 0),
    ('1e1a3f76-a312-4e80-94dd-4062235c3c02', '45043c21-3a78-4734-b2e1-584296d68627', 'Moore & Mealy FSM Design Examples', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('c41fa0a8-6ec2-4f55-9989-9f7deec995d3', 'Physical Design & Signoff', 'physical-design-signoff', 'Floorplanning, placement, clock tree synthesis, and routing — then the signoff checks that get a design ready for tapeout.', 'Digital VLSI', 'ADVANCED', 1, 1, '41391515-f297-4bfa-afa8-09624cc832ae', 1787453817);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('24420fa2-febd-453d-b199-9a11f55c2001', 'c41fa0a8-6ec2-4f55-9989-9f7deec995d3', 'Physical Design', 0),
    ('4bfeacd0-139a-4555-a19e-37d88172c82a', 'c41fa0a8-6ec2-4f55-9989-9f7deec995d3', 'Signoffs', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('21a31fd5-fa8a-4676-9a30-a6b35625699f', '24420fa2-febd-453d-b199-9a11f55c2001', 'Floorplanning, Placement & Power Planning', 'VIDEO', NULL, 0, 1),
    ('506d7444-ddac-4ef1-810c-8191b8992d51', '24420fa2-febd-453d-b199-9a11f55c2001', 'Clock Tree Synthesis & Routing', 'VIDEO', NULL, 1, 0),
    ('845a177d-3e0d-47b1-bfa1-09a222596ed3', '4bfeacd0-139a-4555-a19e-37d88172c82a', 'STA, DRC/LVS & Signal Integrity', 'TEXT', 'Walks through the signoff checklist: static timing analysis, DRC/LVS, antenna and density checks, and IR-drop analysis.', 0, 0),
    ('9e3e445e-906f-4773-9397-cade568df8e6', '4bfeacd0-139a-4555-a19e-37d88172c82a', 'ECO Flow & Final Signoff Checklist', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('de429557-47c5-4d14-a446-e71872b6db2f', 'DFT & Final Digital Design Project', 'dft-final-digital-design-project', 'Scan chains, ATPG, and industrial DFT tools, capped off with a complete digital design project reviewed by an external expert.', 'Digital VLSI', 'ADVANCED', 1, 1, '41391515-f297-4bfa-afa8-09624cc832ae', 1787457417);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('f10e899f-f42d-492e-b16d-bfff4b3a8fbf', 'de429557-47c5-4d14-a446-e71872b6db2f', 'Design for Testability (DFT)', 0),
    ('a4235bcf-5bf6-4dbf-b483-1f7c1aa56433', 'de429557-47c5-4d14-a446-e71872b6db2f', 'Final Digital Design Project', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('4488534a-6457-4bd9-83dc-f7ac0fcd9098', 'f10e899f-f42d-492e-b16d-bfff4b3a8fbf', 'Scan-Chain Architecture & Scan Flip-Flops', 'VIDEO', NULL, 0, 1),
    ('20372d46-58de-40af-828c-e63f0413cff2', 'f10e899f-f42d-492e-b16d-bfff4b3a8fbf', 'ATPG & Testing Fundamentals', 'TEXT', 'Introduces automatic test pattern generation and the difference between defects, faults, errors, and failures.', 1, 0),
    ('73d31a2d-3fea-4b3f-95f5-22c5b428c01f', 'a4235bcf-5bf6-4dbf-b483-1f7c1aa56433', 'Project Presentation & External Review', 'VIDEO', NULL, 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('a44c78ee-8fc1-42de-9bd7-13a7d922067b', 'MOS & Differential Amplifiers', 'mos-differential-amplifiers', 'Common source/drain/gate small-signal analysis, cascode and multistage amplifiers, and differential pair design with CMRR/PSRR.', 'Analog VLSI', 'INTERMEDIATE', 1, 1, '3b71a952-3915-4c10-bb65-2b5857c20289', 1787461017);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('2a1cdcd7-9ab6-4255-9a8a-caac08684235', 'a44c78ee-8fc1-42de-9bd7-13a7d922067b', 'MOS Amplifiers', 0),
    ('6a64dc9c-6938-42c2-86c3-c1a139780b3e', 'a44c78ee-8fc1-42de-9bd7-13a7d922067b', 'Differential Amplifier', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('d42740da-6d24-4018-b4ac-6be27b3b9c46', '2a1cdcd7-9ab6-4255-9a8a-caac08684235', 'Common Source, Drain & Gate Small-Signal Models', 'VIDEO', NULL, 0, 1),
    ('ef1958e6-95d6-4efd-821b-8e101e9ed4ce', '2a1cdcd7-9ab6-4255-9a8a-caac08684235', 'Cascode & Multistage Amplifiers', 'VIDEO', NULL, 1, 0),
    ('daec1f0e-1941-4597-a854-4d2581172950', '6a64dc9c-6938-42c2-86c3-c1a139780b3e', 'Differential Pair, CMRR & PSRR', 'TEXT', 'Covers active-load differential pairs, common-mode and power-supply rejection, and offset analysis.', 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('4d7ee43a-9d46-44cb-95f9-83c9ad80bc81', 'Operational Amplifier Design', 'operational-amplifier-design', 'Two-stage and folded-cascode op-amps, compensation techniques, gain boosting, and rail-to-rail/low-power design trade-offs.', 'Analog VLSI', 'ADVANCED', 1, 1, '47563363-354b-4175-b12c-a1bbc748aa2f', 1787464617);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('d33a2034-69ff-4713-b362-71495bf3042f', '4d7ee43a-9d46-44cb-95f9-83c9ad80bc81', 'Operational Amplifier', 0),
    ('93ee7024-8606-418f-8156-6b17f5eace63', '4d7ee43a-9d46-44cb-95f9-83c9ad80bc81', 'Advanced Op-Amps', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('c32fbc7b-4f39-4cc0-87ce-12de40867399', 'd33a2034-69ff-4713-b362-71495bf3042f', 'Two-Stage Op-Amp & Folded Cascode', 'VIDEO', NULL, 0, 1),
    ('e2d40ce7-3089-4a0f-8276-dbcf342dad27', 'd33a2034-69ff-4713-b362-71495bf3042f', 'Compensation, GBW, Phase Margin & Slew Rate', 'VIDEO', NULL, 1, 0),
    ('26fdc480-87d7-414a-9aef-63d3885777d0', '93ee7024-8606-418f-8156-6b17f5eace63', 'Rail-to-Rail, Low-Power & Gain Boosting', 'TEXT', 'Discusses design trade-offs for rail-to-rail input/output stages, low-power biasing, and gain-boosting techniques.', 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('dea30cfb-87d6-4aea-b311-db34b975916c', 'Bandgap References & Memory Circuits', 'bandgap-references-memory-circuits', 'PTAT/CTAT-based bandgap reference design and temperature compensation, then 6T SRAM cells and sense amplifier design.', 'Analog VLSI', 'ADVANCED', 1, 1, 'd1eca4e3-9125-40fd-b23f-718a2151d671', 1787468217);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('e5e7f2d6-c481-41ff-bd38-c1b85d408ff4', 'dea30cfb-87d6-4aea-b311-db34b975916c', 'Bandgap Reference', 0),
    ('3c3259ca-6540-4285-9dbd-81d19782a795', 'dea30cfb-87d6-4aea-b311-db34b975916c', 'Memory Circuits', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('18776f3e-c393-40de-956e-94396ee8ce83', 'e5e7f2d6-c481-41ff-bd38-c1b85d408ff4', 'PTAT, CTAT & Startup Circuits', 'VIDEO', NULL, 0, 1),
    ('c303cdb6-3497-4b54-a712-f36f1014e7d2', 'e5e7f2d6-c481-41ff-bd38-c1b85d408ff4', 'Temperature Compensation Techniques', 'TEXT', 'Explains how PTAT and CTAT currents combine to produce a temperature-independent bandgap voltage reference.', 1, 0),
    ('a7fe5f3b-9c0b-47df-9388-369a74f81126', '3c3259ca-6540-4285-9dbd-81d19782a795', '6T SRAM, Sense Amplifiers & Peripheral Circuits', 'VIDEO', NULL, 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('564c4797-197d-419f-8b07-41dbecc43d54', 'Analog Layout & Mixed Signal Design', 'analog-layout-mixed-signal-design', 'Matching, common-centroid layout, and guard rings for analog blocks, plus an ADC/DAC and PLL overview for mixed-signal systems.', 'Analog VLSI', 'ADVANCED', 1, 1, '68b1bbf2-84f3-4d63-9028-e0519ed9237e', 1787471817);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('548abd46-ce23-4bf8-99cd-6a8ae0bc6e65', '564c4797-197d-419f-8b07-41dbecc43d54', 'Analog Layout', 0),
    ('44ae7048-6de6-481c-af64-6534408549d4', '564c4797-197d-419f-8b07-41dbecc43d54', 'Mixed Signal', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('de3ddabc-d659-4711-a07e-b19144d069c8', '548abd46-ce23-4bf8-99cd-6a8ae0bc6e65', 'Matching, Common Centroid & Interdigitation', 'VIDEO', NULL, 0, 1),
    ('9ba6f9c6-f88b-4a09-8bea-a2f0b50c9b0f', '548abd46-ce23-4bf8-99cd-6a8ae0bc6e65', 'Guard Rings, Latch-up & Post-Layout Simulation', 'TEXT', 'Covers DRC/LVS/PEX for analog layouts and how guard rings mitigate latch-up risk.', 1, 0),
    ('f0c02743-5893-4fc4-91b1-93f7cdcc1ba1', '44ae7048-6de6-481c-af64-6534408549d4', 'ADC, DAC & PLL Basics', 'VIDEO', NULL, 0, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, published, teacher_id, created_at) VALUES
      ('3de283a3-2de3-4bb2-abfc-6a2a251fb313', 'Noise, Reliability & Final Analog IC Project', 'noise-reliability-final-analog-ic-project', 'Thermal and flicker noise, Monte Carlo and corner analysis, ESD/reliability considerations, and a complete analog IC design project.', 'Analog VLSI', 'ADVANCED', 1, 1, '41391515-f297-4bfa-afa8-09624cc832ae', 1787475417);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('eabd8e58-e449-4276-b9e6-f391003167ed', '3de283a3-2de3-4bb2-abfc-6a2a251fb313', 'Noise & Reliability', 0),
    ('1e4b164d-543a-4a76-87b2-2a52490e424e', '3de283a3-2de3-4bb2-abfc-6a2a251fb313', 'Final Analog IC Design Project', 1);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('47661bdc-4d57-496d-8717-00cf29037052', 'eabd8e58-e449-4276-b9e6-f391003167ed', 'Thermal & Flicker Noise', 'VIDEO', NULL, 0, 1),
    ('28caeed7-fd8f-4c33-8254-6fc35f71f14a', 'eabd8e58-e449-4276-b9e6-f391003167ed', 'Monte Carlo Analysis, Corners & ESD', 'TEXT', 'Introduces statistical and corner-based verification techniques along with ESD protection considerations.', 1, 0),
    ('41595ad5-53c1-4390-8f77-b79faadd78d8', '1e4b164d-543a-4a76-87b2-2a52490e424e', 'Project Presentation & External Review', 'VIDEO', NULL, 0, 0);

INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
    ('ed4381cb-4204-40d0-8d65-d2361f8df378', 'f77a39cd-59d6-4908-a565-82fa09af2acb', '28654b89-4e0b-4884-941e-a60a41a094e3', 1787479017),
    ('6a98e63c-286b-4141-a8c0-e6e7414faf88', 'f77a39cd-59d6-4908-a565-82fa09af2acb', '1fafdcd4-aebe-4b3e-817a-b8e675091696', 1787479017),
    ('c800bf09-a5bb-4c0a-9378-1e65b9171879', 'f77a39cd-59d6-4908-a565-82fa09af2acb', '95c6e6e9-8090-46d3-84b2-6170e544d6e8', 1787479017),
    ('fe190f23-5493-49be-8756-0ee83612f9f7', 'f77a39cd-59d6-4908-a565-82fa09af2acb', 'a44c78ee-8fc1-42de-9bd7-13a7d922067b', 1787479017);

INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at) VALUES
    ('38913c5e-03bb-409f-905f-7367a7d40990', 'f77a39cd-59d6-4908-a565-82fa09af2acb', '28654b89-4e0b-4884-941e-a60a41a094e3', 4, 'The foundation-first approach made everything downstream actually make sense instead of being memorized steps.', 1787479017),
    ('e9c75722-362a-4de5-8efa-81836ff6b143', 'f77a39cd-59d6-4908-a565-82fa09af2acb', 'd50d0fd9-ea3a-4bb2-a465-48ee8497eb54', 5, 'Clear explanations and the lab exercises tied directly back to the theory — exactly what I needed.', 1787479017),
    ('e794668d-0ba5-45ad-9a6c-b62358c4be73', 'f77a39cd-59d6-4908-a565-82fa09af2acb', '0edfb67d-e591-4d4f-bdf4-2eebe144df57', 4, 'Instructor was responsive and the pacing was just right for someone coming from a non-VLSI background.', 1787479017),
    ('453fc49f-b244-4119-958a-25a9c777984f', 'f77a39cd-59d6-4908-a565-82fa09af2acb', 'a44c78ee-8fc1-42de-9bd7-13a7d922067b', 5, 'Loved how each concept built on the last. Would recommend to anyone starting out in chip design.', 1787479017),
    ('2ee09bdd-9583-4803-aae7-faaba1646580', 'f77a39cd-59d6-4908-a565-82fa09af2acb', 'dea30cfb-87d6-4aea-b311-db34b975916c', 4, 'Dense but well-structured — worth watching each lecture twice.', 1787479017);
