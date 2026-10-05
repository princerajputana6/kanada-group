DELETE FROM lesson_progress;
   DELETE FROM reviews;
   DELETE FROM enrollments;
   DELETE FROM lessons;
   DELETE FROM sections;
   DELETE FROM courses;
   DELETE FROM categories;
   DELETE FROM users WHERE email LIKE '%@kanadagroup.dev';

INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('b1b0a11d-2dd2-4310-b02a-832e302f98b5', 'Kanada Admin', 'admin@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'ADMIN', 'Platform administrator.', 1791222820),
    ('aca4b840-c156-4eff-bf28-434ff7bb4059', 'Demo Student', 'student@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'STUDENT', 'Learning VLSI design.', 1791222820),
    ('0bf7b8b1-62f9-49ae-b4cf-b6da8bda41a5', 'Dr. Vibhu Srivastava', 'teacher@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791222820),
    ('3abaccb7-30d9-45d3-bfed-31570bf02785', 'Dr. Anshul Verma', 'teacher2@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791222820),
    ('c2bd77fd-df2d-4f93-aa90-54a344eb50fb', 'Er. Deepak', 'teacher3@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791222820),
    ('14d8d3ca-6f07-4557-859b-94bf14b32424', 'Dr. Rahul Mishra', 'teacher4@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791222820),
    ('c2b5e7c3-326f-4b3d-a9a7-a19feba84203', 'Er. Tejal Patel', 'teacher5@kanadagroup.dev', '$2a$10$7UvdkYDQLdDutm4Kro.8H.cgrzWayJxt535hW7/Vts5wXekW.Svfm', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791222820);

INSERT INTO categories (id, name, slug) VALUES
    ('caab4809-d08e-4a51-a6bb-50689141a966', 'Foundations', 'foundations'),
    ('4b320874-f8ce-4876-b228-e7d1a976bcf8', 'Digital VLSI', 'digital-vlsi'),
    ('92629a03-b257-4013-a027-3b7792ce63ce', 'Analog VLSI', 'analog-vlsi');

INSERT INTO courses (id, title, slug, description, category, level, is_free, price, published, teacher_id, created_at) VALUES
      ('cf107b00-8701-4175-b43c-8c34944b8c7c', 'VLSI Foundations — Free 8-Week Program', 'vlsi-foundations', 'Our free, open 8-week common program. Build the semiconductor, CMOS and digital fundamentals every VLSI engineer needs — from MOS physics to Verilog & FPGA. Complete it to unlock the Digital and Analog design tracks.', 'Foundations', 'BEGINNER', 1, NULL, 1, '0bf7b8b1-62f9-49ae-b4cf-b6da8bda41a5', 1791212020);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('06e39272-ceb5-444e-adfc-59a7d2a0145e', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 1: Semiconductor Fundamentals', 0),
    ('28e7ae4d-51a1-4db9-ad21-ea9c119612af', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 2: MOS Capacitor Characteristics', 1),
    ('f8e56149-80c7-4684-b7ea-d2b2b198ce40', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 3: MOSFET Fundamentals', 2),
    ('95206551-f15f-46cb-9701-6edeb7a1c3e8', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 4: CMOS Fabrication Technology', 3),
    ('a4c10052-4c51-4443-b290-e25fda1a1e86', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 5: CMOS Inverter Fundamentals', 4),
    ('82e2a4eb-54bc-4c8c-8135-5dafe5337364', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 6: Basic Analog Circuits', 5),
    ('cd289c87-9dae-42e6-b719-1ef7f775dfef', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 7: Combinational Logic Design', 6),
    ('7f4de113-8f97-4e82-867c-cc1545d1ac36', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 'Week 8: Introduction to Verilog & FPGA', 7);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('83635e00-c820-430b-8f85-11bc91fa6942', '06e39272-ceb5-444e-adfc-59a7d2a0145e', 'Semiconductor Fundamentals — Overview', 'TEXT', 'This week covers: Review of semiconductor physics; MOS capacitor; Energy band diagrams; Charge distribution.', 0, 1),
    ('1708d62f-bdf6-4f1e-8a45-e86ef974baa7', '06e39272-ceb5-444e-adfc-59a7d2a0145e', 'Semiconductor Fundamentals — Lecture', 'VIDEO', NULL, 1, 0),
    ('669fcc0c-c979-4428-b6c0-09fbe5817896', '28e7ae4d-51a1-4db9-ad21-ea9c119612af', 'MOS Capacitor Characteristics — Overview', 'TEXT', 'This week covers: C–V characteristics; Ideal MOS capacitor model; Accumulation, depletion & inversion; Diffusion & depletion capacitance.', 0, 0),
    ('be14f9c9-ebd9-4039-b29f-50b3dd559b9d', '28e7ae4d-51a1-4db9-ad21-ea9c119612af', 'MOS Capacitor Characteristics — Lecture', 'VIDEO', NULL, 1, 0),
    ('9e2b5a29-aa77-4c3d-917c-fe21fd77216e', 'f8e56149-80c7-4684-b7ea-d2b2b198ce40', 'MOSFET Fundamentals — Overview', 'TEXT', 'This week covers: MOSFET introduction & structure; Modes of operation; Threshold voltage derivation; Body effect & process dependence.', 0, 0),
    ('51021fef-6bc7-4507-9536-b5755067fc4d', 'f8e56149-80c7-4684-b7ea-d2b2b198ce40', 'MOSFET Fundamentals — Lecture', 'VIDEO', NULL, 1, 0),
    ('f7eee85d-6f95-4a0e-9bf9-78152b07875e', '95206551-f15f-46cb-9701-6edeb7a1c3e8', 'CMOS Fabrication Technology — Overview', 'TEXT', 'This week covers: MOSFET fabrication process; Oxidation & diffusion; Ion implantation; Lithography & metallization; Process-flow overview.', 0, 0),
    ('8b4e0f4b-aa50-4a0f-acc9-ce663637cb47', '95206551-f15f-46cb-9701-6edeb7a1c3e8', 'CMOS Fabrication Technology — Lecture', 'VIDEO', NULL, 1, 0),
    ('dd826026-a3cd-4a43-9261-35045247313a', 'a4c10052-4c51-4443-b290-e25fda1a1e86', 'CMOS Inverter Fundamentals — Overview', 'TEXT', 'This week covers: CMOS inverter operation; Static DC characteristics & VTC; Switching threshold & noise margins; Beta ratio & PMOS/NMOS sizing; Design trade-offs.', 0, 0),
    ('a41461c0-4d17-4106-a5b1-9ac7b75cbbbb', 'a4c10052-4c51-4443-b290-e25fda1a1e86', 'CMOS Inverter Fundamentals — Lecture', 'VIDEO', NULL, 1, 0),
    ('cc79f624-8bcd-4168-8d4e-87989f3a0de2', '82e2a4eb-54bc-4c8c-8135-5dafe5337364', 'Basic Analog Circuits — Overview', 'TEXT', 'This week covers: PN junction; Diodes and applications.', 0, 0),
    ('e4939173-8ebf-499b-8844-f023c12e853d', '82e2a4eb-54bc-4c8c-8135-5dafe5337364', 'Basic Analog Circuits — Lecture', 'VIDEO', NULL, 1, 0),
    ('8a61a067-97a2-4d78-9113-c55918275cd6', 'cd289c87-9dae-42e6-b719-1ef7f775dfef', 'Combinational Logic Design — Overview', 'TEXT', 'This week covers: Logic gates & truth tables; Logic simplification; Adders, encoders, decoders; Multiplexers.', 0, 0),
    ('3c73ff2d-0034-44dc-9a4c-2fa201c25dcf', 'cd289c87-9dae-42e6-b719-1ef7f775dfef', 'Combinational Logic Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('d5b49fa1-2fb4-44b2-97f9-8b7f47788908', '7f4de113-8f97-4e82-867c-cc1545d1ac36', 'Introduction to Verilog & FPGA — Overview', 'TEXT', 'This week covers: Modelling styles; Verilog operators & data types; Combinational modelling in Verilog; PLA & PAL; FPGA architecture & overview.', 0, 0),
    ('392f3d6c-8e44-4468-a6ce-7b6e062db167', '7f4de113-8f97-4e82-867c-cc1545d1ac36', 'Introduction to Verilog & FPGA — Lecture', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, price, published, teacher_id, created_at) VALUES
      ('0666d57e-4961-4b4c-a55c-a30dae71209a', 'Digital VLSI Design', 'digital-vlsi-design', 'The complete digital design track (Weeks 9–20): static & alternative logic, layout, delay modelling, power, sequential design, RTL-to-GDSII physical design, signoff, DFT and a final project reviewed by an external expert.', 'Digital VLSI', 'ADVANCED', 0, 14999, 1, '3abaccb7-30d9-45d3-bfed-31570bf02785', 1791215620);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('18427d53-5386-433e-b9bc-938dab84447b', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 9: Static CMOS Logic & Alternative Logic', 0),
    ('6887b4a6-1c78-4e9c-b1d3-06b397f7325c', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 10: Digital Layout Design', 1),
    ('e7e575ea-0c6c-4d7f-bf69-1c7a127cdfc2', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 11: Delay Modelling', 2),
    ('601d3d29-ed16-4a2b-af5b-2757b50d5c3c', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 12: Elmore Delay & Logical Effort', 3),
    ('c2865345-c11b-49bc-9783-56a75ad0e7ab', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 13: CMOS Power Analysis', 4),
    ('ac414210-9ae9-457d-b8b0-cc7cebb32b9b', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 14: Sequential Circuit Design', 5),
    ('6de89553-b80f-4e59-aac0-05d47f999610', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 15: Registers, Counters & FSMs', 6),
    ('c56f6795-4e0a-48e2-b048-bce5426b4e9d', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 16: RTL Design & Logic Synthesis', 7),
    ('566fc44d-b887-476b-abdf-deb133ea559c', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 17: Physical Design', 8),
    ('72fde2a9-3791-4aef-8cc3-76b5fd087e5d', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 18: Signoffs', 9),
    ('f2ae7e23-b64b-4d1b-a83b-fd3cad89a16b', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 19: Design for Testability (DFT)', 10),
    ('0098aacf-ef55-4770-aef8-a87d903dd8b6', '0666d57e-4961-4b4c-a55c-a30dae71209a', 'Week 20: Final Digital Design Project', 11);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('072f158e-46fc-4af2-9f13-d00a17e0cb9a', '18427d53-5386-433e-b9bc-938dab84447b', 'Static CMOS Logic & Alternative Logic — Overview', 'TEXT', 'This week covers: CMOS logic gates; Pull-up & pull-down networks; Compound gates; Pass Transistor Logic (PTL); Transmission gates; Ratioed, dynamic, domino & tristate logic.', 0, 0),
    ('016e130b-31fe-4811-b751-29397876c6f2', '18427d53-5386-433e-b9bc-938dab84447b', 'Static CMOS Logic & Alternative Logic — Lecture', 'VIDEO', NULL, 1, 0),
    ('8aa56d7f-c19f-440e-bec2-faa3039805c2', '6887b4a6-1c78-4e9c-b1d3-06b397f7325c', 'Digital Layout Design — Overview', 'TEXT', 'This week covers: Stick diagrams; CMOS layout basics; Interconnects & vias; Design rules & DRC; Layout optimization.', 0, 0),
    ('7211af40-d428-4a20-88b0-878084d3acd9', '6887b4a6-1c78-4e9c-b1d3-06b397f7325c', 'Digital Layout Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('5f56d48f-1d6b-4f5b-88b1-e9565fe75046', 'e7e575ea-0c6c-4d7f-bf69-1c7a127cdfc2', 'Delay Modelling — Overview', 'TEXT', 'This week covers: RC delay models; Lumped & distributed RC models; Delay estimation; Effective resistance & capacitance.', 0, 0),
    ('53eaedcf-7184-441e-a1a2-3e7953b1ab29', 'e7e575ea-0c6c-4d7f-bf69-1c7a127cdfc2', 'Delay Modelling — Lecture', 'VIDEO', NULL, 1, 0),
    ('6b05e7b0-305b-4df8-b4ee-82baa1a322da', '601d3d29-ed16-4a2b-af5b-2757b50d5c3c', 'Elmore Delay & Logical Effort — Overview', 'TEXT', 'This week covers: Elmore delay derivation; Logical, electrical & branching effort; Path effort & delay optimization; Worked examples; Project allotted.', 0, 0),
    ('f480289e-690d-419e-8c4d-64e9f922e3f3', '601d3d29-ed16-4a2b-af5b-2757b50d5c3c', 'Elmore Delay & Logical Effort — Lecture', 'VIDEO', NULL, 1, 0),
    ('80be2358-3a01-4220-bfc8-1f40746aae30', 'c2865345-c11b-49bc-9783-56a75ad0e7ab', 'CMOS Power Analysis — Overview', 'TEXT', 'This week covers: Dynamic & static power; Internal power; Leakage mechanisms; Short-circuit power; Power-performance trade-offs.', 0, 0),
    ('5fd8b8c2-4467-4d7a-a252-9b1db8b69706', 'c2865345-c11b-49bc-9783-56a75ad0e7ab', 'CMOS Power Analysis — Lecture', 'VIDEO', NULL, 1, 0),
    ('d0ed7533-c91e-4f7c-8e13-98de5c4de23a', 'ac414210-9ae9-457d-b8b0-cc7cebb32b9b', 'Sequential Circuit Design — Overview', 'TEXT', 'This week covers: Storage elements; SR & D latches; Edge-triggered flip-flops; Master-slave structures; Static Timing Analysis (STA).', 0, 0),
    ('bc3e0f11-9592-435a-bda3-809ae369a57a', 'ac414210-9ae9-457d-b8b0-cc7cebb32b9b', 'Sequential Circuit Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('7ee1c175-f47c-4901-9d5b-79c2f300978f', '6de89553-b80f-4e59-aac0-05d47f999610', 'Registers, Counters & FSMs — Overview', 'TEXT', 'This week covers: Shift registers & phase-shifters; Ripple & synchronous counters; Frequency division; Moore & Mealy FSMs; FSM design examples.', 0, 0),
    ('0b4b498e-4f4e-4137-b221-094900c24034', '6de89553-b80f-4e59-aac0-05d47f999610', 'Registers, Counters & FSMs — Lecture', 'VIDEO', NULL, 1, 0),
    ('e1c7a10a-5661-495b-abde-02e41ef97503', 'c56f6795-4e0a-48e2-b048-bce5426b4e9d', 'RTL Design & Logic Synthesis — Overview', 'TEXT', 'This week covers: RTL coding guidelines; Synthesizable Verilog; Functional verification & testbenches; Timing constraints (SDC); Logic synthesis & technology mapping; LEC.', 0, 0),
    ('abb85616-db2e-470c-a8f8-ca37110da794', 'c56f6795-4e0a-48e2-b048-bce5426b4e9d', 'RTL Design & Logic Synthesis — Lecture', 'VIDEO', NULL, 1, 0),
    ('031ebe2c-2bdc-4c03-bb6b-bdcfe354abb5', '566fc44d-b887-476b-abdf-deb133ea559c', 'Physical Design — Overview', 'TEXT', 'This week covers: Floor planning; IO & macro placement; Power planning & placement; Clock Tree Synthesis (CTS); Routing.', 0, 0),
    ('1259f36a-fe7f-4c35-a360-9c8d9410aa70', '566fc44d-b887-476b-abdf-deb133ea559c', 'Physical Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('61d887f4-2f62-4202-84d5-12abb09b8e7d', '72fde2a9-3791-4aef-8cc3-76b5fd087e5d', 'Signoffs — Overview', 'TEXT', 'This week covers: STA & DRVs; Signal integrity; DRC & LVS; IR-drop & electromigration analysis; ECO flow; GDSII generation & tapeout.', 0, 0),
    ('61de6575-fb39-400d-9e94-9e4b616b113a', '72fde2a9-3791-4aef-8cc3-76b5fd087e5d', 'Signoffs — Lecture', 'VIDEO', NULL, 1, 0),
    ('56755ea2-d9ac-419c-90fb-f57a5844c7ff', 'f2ae7e23-b64b-4d1b-a83b-fd3cad89a16b', 'Design for Testability (DFT) — Overview', 'TEXT', 'This week covers: Manufacturing defects & yield; Fault models & stuck-at faults; Controllability & observability; Scan-chain architecture; Industrial tools: Tessent, TestMAX, Modus; Project submission.', 0, 0),
    ('122f301d-c20b-4c83-b8be-650b33b7ee18', 'f2ae7e23-b64b-4d1b-a83b-fd3cad89a16b', 'Design for Testability (DFT) — Lecture', 'VIDEO', NULL, 1, 0),
    ('522e8cd7-0783-4128-b661-e35838e0b402', '0098aacf-ef55-4770-aef8-a87d903dd8b6', 'Final Digital Design Project — Overview', 'TEXT', 'This week covers: Final project presentation & review; Review by external expert.', 0, 0),
    ('c0fb291f-2c83-461b-9e03-06e531920842', '0098aacf-ef55-4770-aef8-a87d903dd8b6', 'Final Digital Design Project — Lecture', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, price, published, teacher_id, created_at) VALUES
      ('6ee43a5e-2a80-451d-b968-d3141221df64', 'Analog VLSI Design', 'analog-vlsi-design', 'The complete analog design track (Weeks 9–20): MOS & differential amplifiers, op-amps, bandgap references, memory circuits, analog layout, noise & reliability, mixed-signal design and a final analog IC project.', 'Analog VLSI', 'ADVANCED', 0, 14999, 1, 'c2bd77fd-df2d-4f93-aa90-54a344eb50fb', 1791219220);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('6e04034d-25a6-46f1-80d3-dcf22b464fc1', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 9: MOS Amplifiers', 0),
    ('a594af40-4c99-4320-a14a-4dbb2901c369', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 10: Advanced Amplifiers', 1),
    ('96212719-9cd9-475a-8138-3a5e7651cfdd', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 11: Differential Amplifier', 2),
    ('4eaa485b-2a19-4d00-ae8b-651d263869b2', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 12: Operational Amplifier', 3),
    ('38943ce4-41cd-457d-8590-d6c62841df21', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 13: Advanced Op-Amps I', 4),
    ('850e6707-cd99-4d20-aaf9-0be780537c23', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 14: Advanced Op-Amps II', 5),
    ('1eb5d571-7e81-4c6f-a649-81d458c0de0d', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 15: Bandgap Reference', 6),
    ('674e9d23-1882-43ed-8637-c733c2c09537', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 16: Memory Circuits', 7),
    ('36859b18-db85-4b5a-963f-62fefae15076', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 17: Analog Layout', 8),
    ('ad9ad12e-d4ae-4ff8-a3e7-96b20d7570b0', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 18: Noise & Reliability', 9),
    ('62e13e61-bbc4-4a90-969d-3d508dd83462', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 19: Mixed Signal', 10),
    ('92e8d9fa-17f1-4121-aa89-35cb7a85f102', '6ee43a5e-2a80-451d-b968-d3141221df64', 'Week 20: Final Analog IC Design Project', 11);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('ab900b5a-055c-408f-bb1a-09528e9b3860', '6e04034d-25a6-46f1-80d3-dcf22b464fc1', 'MOS Amplifiers — Overview', 'TEXT', 'This week covers: Small-signal model; Common Source, Drain & Gate; Gain, Rin/Rout; Frequency response; Lab.', 0, 0),
    ('38773600-5a5a-45ed-bc70-b38878a8de75', '6e04034d-25a6-46f1-80d3-dcf22b464fc1', 'MOS Amplifiers — Lecture', 'VIDEO', NULL, 1, 0),
    ('fdbd888f-30c1-40a3-a4f1-e08e9a969650', 'a594af40-4c99-4320-a14a-4dbb2901c369', 'Advanced Amplifiers — Overview', 'TEXT', 'This week covers: Cascade & cascode; Multistage amplifiers; Current mirrors & active loads; Small-signal analysis; Lab.', 0, 0),
    ('8381eec8-01c6-4e6c-a398-443dcaeec6df', 'a594af40-4c99-4320-a14a-4dbb2901c369', 'Advanced Amplifiers — Lecture', 'VIDEO', NULL, 1, 0),
    ('2285837c-6fb3-4ce4-ad70-21624806931f', '96212719-9cd9-475a-8138-3a5e7651cfdd', 'Differential Amplifier — Overview', 'TEXT', 'This week covers: Differential pair; Active loads; CMRR & PSRR; Offset; Design & analysis; Lab.', 0, 0),
    ('3f8adf49-38ba-4f4d-baed-9066ec3f5fe5', '96212719-9cd9-475a-8138-3a5e7651cfdd', 'Differential Amplifier — Lecture', 'VIDEO', NULL, 1, 0),
    ('164595da-3d0a-4c5a-aeaa-091e4a5d12d6', '4eaa485b-2a19-4d00-ae8b-651d263869b2', 'Operational Amplifier — Overview', 'TEXT', 'This week covers: Two-stage Op-Amp; Folded cascode; Compensation & GBW; Phase margin & slew rate; Project allotted.', 0, 0),
    ('733663fa-69ac-4dfa-bf23-7fa2bb5079c1', '4eaa485b-2a19-4d00-ae8b-651d263869b2', 'Operational Amplifier — Lecture', 'VIDEO', NULL, 1, 0),
    ('a5ce27e0-9d91-48ae-aa08-7d2c51d72a0f', '38943ce4-41cd-457d-8590-d6c62841df21', 'Advanced Op-Amps I — Overview', 'TEXT', 'This week covers: Rail-to-rail design; Low power; High speed.', 0, 0),
    ('dc00bc79-5acf-4774-869e-b86aeb8a449b', '38943ce4-41cd-457d-8590-d6c62841df21', 'Advanced Op-Amps I — Lecture', 'VIDEO', NULL, 1, 0),
    ('550363fe-888b-4489-add4-006b24709aad', '850e6707-cd99-4d20-aaf9-0be780537c23', 'Advanced Op-Amps II — Overview', 'TEXT', 'This week covers: Gain boosting; Design trade-offs; Corner simulations.', 0, 0),
    ('5cfd6c30-cc8e-47ae-8a18-62ee454c5974', '850e6707-cd99-4d20-aaf9-0be780537c23', 'Advanced Op-Amps II — Lecture', 'VIDEO', NULL, 1, 0),
    ('ab979893-0422-46bb-ad94-f313de064a10', '1eb5d571-7e81-4c6f-a649-81d458c0de0d', 'Bandgap Reference — Overview', 'TEXT', 'This week covers: PTAT & CTAT; Startup circuits; Temperature compensation; Applications; Lab.', 0, 0),
    ('ee248fcb-c39c-41bb-ba80-8c51a9946a63', '1eb5d571-7e81-4c6f-a649-81d458c0de0d', 'Bandgap Reference — Lecture', 'VIDEO', NULL, 1, 0),
    ('5decd807-b0bb-44ad-8f89-a19668991c79', '674e9d23-1882-43ed-8637-c733c2c09537', 'Memory Circuits — Overview', 'TEXT', 'This week covers: SRAM / DRAM / ROM / Flash; 6T SRAM; Read/Write operation; Sense amplifier; Peripheral circuits.', 0, 0),
    ('e577c567-b00c-458e-a29e-bddfe52eaa69', '674e9d23-1882-43ed-8637-c733c2c09537', 'Memory Circuits — Lecture', 'VIDEO', NULL, 1, 0),
    ('df6f39be-9dd2-492d-8c99-6188d7bb9874', '36859b18-db85-4b5a-963f-62fefae15076', 'Analog Layout — Overview', 'TEXT', 'This week covers: Layout basics & matching; Common centroid & interdigitation; Dummy devices & guard rings; Latch-up; DRC/LVS/PEX & post-layout simulation.', 0, 0),
    ('5999710d-9a17-4ec5-a423-bdf00a80e8ba', '36859b18-db85-4b5a-963f-62fefae15076', 'Analog Layout — Lecture', 'VIDEO', NULL, 1, 0),
    ('5469c0a1-5cf6-434c-a2a5-6160f4b64aa0', 'ad9ad12e-d4ae-4ff8-a3e7-96b20d7570b0', 'Noise & Reliability — Overview', 'TEXT', 'This week covers: Thermal & flicker noise; Monte Carlo analysis; Corners; ESD & reliability; Analog design flow.', 0, 0),
    ('870937d9-e64b-45ee-a799-e241072f2d3d', 'ad9ad12e-d4ae-4ff8-a3e7-96b20d7570b0', 'Noise & Reliability — Lecture', 'VIDEO', NULL, 1, 0),
    ('df003ac3-7385-4140-b38e-5ad6158773e5', '62e13e61-bbc4-4a90-969d-3d508dd83462', 'Mixed Signal — Overview', 'TEXT', 'This week covers: ADC overview; DAC basics; PLL basics; Memory array; Mixed-signal flow; Project submission.', 0, 0),
    ('e0b5bec1-5ce8-4578-99f6-6d38d93196d8', '62e13e61-bbc4-4a90-969d-3d508dd83462', 'Mixed Signal — Lecture', 'VIDEO', NULL, 1, 0),
    ('dd4c44fd-908d-40f5-9607-063a89467456', '92e8d9fa-17f1-4121-aa89-35cb7a85f102', 'Final Analog IC Design Project — Overview', 'TEXT', 'This week covers: Project presentation & review; Review by external expert.', 0, 0),
    ('945cdf68-5e5d-4af1-938e-238bf327f613', '92e8d9fa-17f1-4121-aa89-35cb7a85f102', 'Final Analog IC Design Project — Lecture', 'VIDEO', NULL, 1, 0);

INSERT INTO enrollments (id, user_id, course_id, enrolled_at, payment_status) VALUES
    ('758196de-5baf-4723-a7d5-4c74c8c208da', 'aca4b840-c156-4eff-bf28-434ff7bb4059', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 1791222820, 'NONE');

INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at) VALUES
    ('e80590bd-7bb2-4aca-a73b-71500e1cd775', 'aca4b840-c156-4eff-bf28-434ff7bb4059', 'cf107b00-8701-4175-b43c-8c34944b8c7c', 5, 'The foundation-first approach made everything click. The free 8 weeks alone are worth it.', 1791222820);
