DELETE FROM lesson_progress;
   DELETE FROM reviews;
   DELETE FROM enrollments;
   DELETE FROM lessons;
   DELETE FROM sections;
   DELETE FROM courses;
   DELETE FROM categories;
   DELETE FROM users WHERE email LIKE '%@kanadagroup.dev';

INSERT INTO users (id, name, email, password_hash, role, bio, created_at) VALUES
    ('61f3a016-4bf7-4d0c-b1a1-db10b7d6fa82', 'Kanada Admin', 'admin@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'ADMIN', 'Platform administrator.', 1791226838),
    ('757f3f8f-aaf9-4856-9a3f-6b52498661f9', 'Demo Student', 'student@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'STUDENT', 'Learning VLSI design.', 1791226838),
    ('321ef702-812a-49fa-b988-adc2aced0e0e', 'Shulekha Dwivedi', 'teacher@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791226838),
    ('d44789de-71c9-4445-b09b-98d0756f0c61', 'Er. Deepak Mishra', 'teacher2@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791226838),
    ('33784211-ce9a-410c-8222-c18a6002a735', 'Er. Deepak', 'teacher3@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791226838),
    ('3e8e7c74-4fe2-4366-8a8b-b6a2e2477b05', 'Dr. Rahul Mishra', 'teacher4@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791226838),
    ('473244ca-4027-468a-ba95-df6bc4c07251', 'Er. Tejal Patel', 'teacher5@kanadagroup.dev', '$2a$10$pWPguAwCvUrw09/uOwsdKex1amsobX/jGJ3iQWlZeCnhiiAbiuflu', 'TEACHER', 'VLSI faculty at Kanada Group.', 1791226838);

INSERT INTO categories (id, name, slug) VALUES
    ('0f5c4119-98a7-4292-8203-ecde3817d37d', 'Foundations', 'foundations'),
    ('91f2fb2b-5ec0-4e2c-be00-093dd4aa9cee', 'Digital VLSI', 'digital-vlsi'),
    ('89c34ada-1489-4547-946c-30d31c51c32b', 'Analog VLSI', 'analog-vlsi');

INSERT INTO courses (id, title, slug, description, category, level, is_free, price, original_price, published, teacher_id, created_at) VALUES
      ('648e1d75-a62f-4849-b134-30d365f817cf', 'VLSI Foundations — Free 8-Week Program', 'vlsi-foundations', 'Our free, open 8-week common program. Build the semiconductor, CMOS and digital fundamentals every VLSI engineer needs — from MOS physics to Verilog & FPGA. Complete it to unlock the Digital and Analog design tracks.', 'Foundations', 'BEGINNER', 1, NULL, NULL, 1, '321ef702-812a-49fa-b988-adc2aced0e0e', 1791216038);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('6042c597-17c4-43bc-88eb-74e84fe06b88', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 1: Semiconductor Fundamentals', 0),
    ('37ec0b0e-9fd8-4a60-a95d-f21abaeb3223', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 2: MOS Capacitor Characteristics', 1),
    ('f1051daf-9559-4208-a78b-cb9102e30cdd', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 3: MOSFET Fundamentals', 2),
    ('2d95b3d4-e179-4c1b-ba2f-0a1354039b8c', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 4: CMOS Fabrication Technology', 3),
    ('ff472df5-7b24-47ff-b4d1-8904c358c503', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 5: CMOS Inverter Fundamentals', 4),
    ('f81a8918-fb71-480c-9ab3-1d3996b60bd2', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 6: Basic Analog Circuits', 5),
    ('e650a53b-774c-4275-984c-fe6cdab51e27', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 7: Combinational Logic Design', 6),
    ('52e133b0-48b6-46cd-9d05-83d576b9a297', '648e1d75-a62f-4849-b134-30d365f817cf', 'Week 8: Introduction to Verilog & FPGA', 7);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('9e251ca0-4d75-4b6b-9334-11954f15f2aa', '6042c597-17c4-43bc-88eb-74e84fe06b88', 'Semiconductor Fundamentals — Overview', 'TEXT', 'This week covers: Review of semiconductor physics; MOS capacitor; Energy band diagrams; Charge distribution.', 0, 1),
    ('1700df34-1442-4c37-bf33-d0415ee670de', '6042c597-17c4-43bc-88eb-74e84fe06b88', 'Semiconductor Fundamentals — Lecture', 'VIDEO', NULL, 1, 0),
    ('2ec65caf-6869-45ca-86e1-42ee4299346e', '37ec0b0e-9fd8-4a60-a95d-f21abaeb3223', 'MOS Capacitor Characteristics — Overview', 'TEXT', 'This week covers: C–V characteristics; Ideal MOS capacitor model; Accumulation, depletion & inversion; Diffusion & depletion capacitance.', 0, 0),
    ('a50d1d20-58d0-45ae-a882-a4c64bd052f8', '37ec0b0e-9fd8-4a60-a95d-f21abaeb3223', 'MOS Capacitor Characteristics — Lecture', 'VIDEO', NULL, 1, 0),
    ('ede58a2a-b3ed-4e94-add1-f356af79bfc3', 'f1051daf-9559-4208-a78b-cb9102e30cdd', 'MOSFET Fundamentals — Overview', 'TEXT', 'This week covers: MOSFET introduction & structure; Modes of operation; Threshold voltage derivation; Body effect & process dependence.', 0, 0),
    ('7dd6ab59-6434-4171-b70e-bf13f6cb502c', 'f1051daf-9559-4208-a78b-cb9102e30cdd', 'MOSFET Fundamentals — Lecture', 'VIDEO', NULL, 1, 0),
    ('8cfef2c2-9dfb-48c5-be8e-970ce6f8fc8a', '2d95b3d4-e179-4c1b-ba2f-0a1354039b8c', 'CMOS Fabrication Technology — Overview', 'TEXT', 'This week covers: MOSFET fabrication process; Oxidation & diffusion; Ion implantation; Lithography & metallization; Process-flow overview.', 0, 0),
    ('de288b06-a254-4f05-8458-d44e3f556df7', '2d95b3d4-e179-4c1b-ba2f-0a1354039b8c', 'CMOS Fabrication Technology — Lecture', 'VIDEO', NULL, 1, 0),
    ('c40d485c-1ee3-438a-adb5-26526c35b60d', 'ff472df5-7b24-47ff-b4d1-8904c358c503', 'CMOS Inverter Fundamentals — Overview', 'TEXT', 'This week covers: SOC Operation; Static DC characteristics & VTC; Switching threshold & noise margins; Beta ratio & PMOS/NMOS sizing; Design trade-offs.', 0, 0),
    ('b4bebcd6-c4e6-40ea-b148-edced7afb5f6', 'ff472df5-7b24-47ff-b4d1-8904c358c503', 'CMOS Inverter Fundamentals — Lecture', 'VIDEO', NULL, 1, 0),
    ('95e7ef43-d2b6-4306-8bdc-c38472458899', 'f81a8918-fb71-480c-9ab3-1d3996b60bd2', 'Basic Analog Circuits — Overview', 'TEXT', 'This week covers: PN junction; Diodes and applications.', 0, 0),
    ('a613a80a-587f-4a94-8d5a-05ab92173927', 'f81a8918-fb71-480c-9ab3-1d3996b60bd2', 'Basic Analog Circuits — Lecture', 'VIDEO', NULL, 1, 0),
    ('74692ec9-1e71-4e75-aee3-e31e553e99d8', 'e650a53b-774c-4275-984c-fe6cdab51e27', 'Combinational Logic Design — Overview', 'TEXT', 'This week covers: Logic gates & truth tables; Logic simplification; Adders, encoders, decoders; Multiplexers.', 0, 0),
    ('21f955ba-77b7-41fa-9242-397dcf80a6ee', 'e650a53b-774c-4275-984c-fe6cdab51e27', 'Combinational Logic Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('483de785-82e1-4fbb-ab6e-755dfe39be19', '52e133b0-48b6-46cd-9d05-83d576b9a297', 'Introduction to Verilog & FPGA — Overview', 'TEXT', 'This week covers: Modelling styles; Verilog operators & data types; Combinational modelling in Verilog; PLA & PAL; FPGA architecture & overview.', 0, 0),
    ('f4461a46-f33c-445f-8e33-c24df462f4e0', '52e133b0-48b6-46cd-9d05-83d576b9a297', 'Introduction to Verilog & FPGA — Lecture', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, price, original_price, published, teacher_id, created_at) VALUES
      ('268b9499-7cba-4152-9318-47073cceccb2', 'Digital VLSI Design', 'digital-vlsi-design', 'The complete digital design track (Weeks 9–20): static & alternative logic, layout, delay modelling, power, sequential design, RTL-to-GDSII physical design, signoff, DFT and a final project reviewed by an external expert.', 'Digital VLSI', 'ADVANCED', 0, 4999, 9999, 1, 'd44789de-71c9-4445-b09b-98d0756f0c61', 1791219638);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('a0986a96-de5c-4330-8114-ca537cfa591f', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 9: Static CMOS Logic & Alternative Logic', 0),
    ('2a1861c1-2ab4-4f48-8a54-f5f672657440', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 10: Digital Layout Design', 1),
    ('7b011623-9647-48ef-8633-363e7726710e', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 11: Delay Modelling', 2),
    ('0860d884-aa5f-4452-950f-f0d0c69350e3', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 12: Elmore Delay & Logical Effort', 3),
    ('93465fa9-e8c4-4967-b991-bd71712c665e', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 13: CMOS Power Analysis', 4),
    ('9a91a39b-6452-44f1-afd4-93e23236e497', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 14: Sequential Circuit Design', 5),
    ('198256de-c443-4da8-93f9-700d4a44e178', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 15: Registers, Counters & FSMs', 6),
    ('3795d11d-93a2-4f55-a084-ed6dd264b737', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 16: RTL Design & Logic Synthesis', 7),
    ('29e46ede-5955-4f10-9392-548a8fe03ec7', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 17: Physical Design', 8),
    ('96ee54df-1309-4f1b-b72a-2ad36554eee9', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 18: Signoffs', 9),
    ('f9bb9812-aa82-47fd-a72a-19c3c5d36ef8', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 19: Design for Testability (DFT)', 10),
    ('8183c662-ea7f-44d2-99d8-bd19f6925d10', '268b9499-7cba-4152-9318-47073cceccb2', 'Week 20: Final Digital Design Project', 11);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('166edc9b-e818-4e2b-ba8c-2535bc231105', 'a0986a96-de5c-4330-8114-ca537cfa591f', 'Static CMOS Logic & Alternative Logic — Overview', 'TEXT', 'This week covers: CMOS logic gates; Pull-up & pull-down networks; Compound gates; Pass Transistor Logic (PTL); Transmission gates; Ratioed, dynamic, domino & tristate logic.', 0, 0),
    ('4258fecd-e9a5-45e9-b2a9-38800b36ad6d', 'a0986a96-de5c-4330-8114-ca537cfa591f', 'Static CMOS Logic & Alternative Logic — Lecture', 'VIDEO', NULL, 1, 0),
    ('b276161a-7c61-441b-b52d-a402bc8dd78e', '2a1861c1-2ab4-4f48-8a54-f5f672657440', 'Digital Layout Design — Overview', 'TEXT', 'This week covers: Stick diagrams; CMOS layout basics; Interconnects & vias; Design rules & DRC; Layout optimization.', 0, 0),
    ('50ad10d1-9c30-4605-9756-7d42585ab06d', '2a1861c1-2ab4-4f48-8a54-f5f672657440', 'Digital Layout Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('1fb50e2a-fa69-4cfd-b5c6-a986bffe2ee5', '7b011623-9647-48ef-8633-363e7726710e', 'Delay Modelling — Overview', 'TEXT', 'This week covers: RC delay models; Lumped & distributed RC models; Delay estimation; Effective resistance & capacitance.', 0, 0),
    ('02700b18-e135-47e9-9d18-76fc05050d0c', '7b011623-9647-48ef-8633-363e7726710e', 'Delay Modelling — Lecture', 'VIDEO', NULL, 1, 0),
    ('08b1126a-aeab-40d9-a397-0b390ca45c75', '0860d884-aa5f-4452-950f-f0d0c69350e3', 'Elmore Delay & Logical Effort — Overview', 'TEXT', 'This week covers: Elmore delay derivation; Logical, electrical & branching effort; Path effort & delay optimization; Worked examples; Project allotted.', 0, 0),
    ('a366dd1b-b605-4f99-83bf-889e5b599941', '0860d884-aa5f-4452-950f-f0d0c69350e3', 'Elmore Delay & Logical Effort — Lecture', 'VIDEO', NULL, 1, 0),
    ('45911581-a92b-49ef-940c-fd82d500acfd', '93465fa9-e8c4-4967-b991-bd71712c665e', 'CMOS Power Analysis — Overview', 'TEXT', 'This week covers: Dynamic & static power; Internal power; Leakage mechanisms; Short-circuit power; Power-performance trade-offs.', 0, 0),
    ('bf26f749-e4a0-4e42-816c-6ef80c438cb2', '93465fa9-e8c4-4967-b991-bd71712c665e', 'CMOS Power Analysis — Lecture', 'VIDEO', NULL, 1, 0),
    ('cc22b197-6b41-4bea-b7d1-89b644404a5f', '9a91a39b-6452-44f1-afd4-93e23236e497', 'Sequential Circuit Design — Overview', 'TEXT', 'This week covers: Storage elements; SR & D latches; Edge-triggered flip-flops; Master-slave structures; Static Timing Analysis (STA).', 0, 0),
    ('3c2b7d8f-6217-4200-8d4c-37c57905f0df', '9a91a39b-6452-44f1-afd4-93e23236e497', 'Sequential Circuit Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('8197bdda-a21f-4ad0-8547-c17e6b4dc0b7', '198256de-c443-4da8-93f9-700d4a44e178', 'Registers, Counters & FSMs — Overview', 'TEXT', 'This week covers: Shift registers & phase-shifters; Ripple & synchronous counters; Frequency division; Moore & Mealy FSMs; FSM design examples.', 0, 0),
    ('f3abeb43-83ba-4a1f-902d-ad80bc72c172', '198256de-c443-4da8-93f9-700d4a44e178', 'Registers, Counters & FSMs — Lecture', 'VIDEO', NULL, 1, 0),
    ('9793a1b7-bcb3-4bfe-950c-83ca6c27f847', '3795d11d-93a2-4f55-a084-ed6dd264b737', 'RTL Design & Logic Synthesis — Overview', 'TEXT', 'This week covers: RTL coding guidelines; Synthesizable Verilog; Functional verification & testbenches; Timing constraints (SDC); Logic synthesis & technology mapping; LEC.', 0, 0),
    ('d242b5c0-832d-49a5-958a-9df3b633d192', '3795d11d-93a2-4f55-a084-ed6dd264b737', 'RTL Design & Logic Synthesis — Lecture', 'VIDEO', NULL, 1, 0),
    ('cf1656cb-4121-4294-9aa4-db876a55dc73', '29e46ede-5955-4f10-9392-548a8fe03ec7', 'Physical Design — Overview', 'TEXT', 'This week covers: Floor planning; IO & macro placement; Power planning & placement; Clock Tree Synthesis (CTS); Routing.', 0, 0),
    ('5b567110-9cf7-4fc4-85e4-d0f59f3877ed', '29e46ede-5955-4f10-9392-548a8fe03ec7', 'Physical Design — Lecture', 'VIDEO', NULL, 1, 0),
    ('02a9d639-3091-4e11-9465-1c64074d74a4', '96ee54df-1309-4f1b-b72a-2ad36554eee9', 'Signoffs — Overview', 'TEXT', 'This week covers: STA & DRVs; Signal integrity; DRC & LVS; IR-drop & electromigration analysis; ECO flow; GDSII generation & tapeout.', 0, 0),
    ('4d97b7a5-0caa-4434-95f5-2914890a3d8d', '96ee54df-1309-4f1b-b72a-2ad36554eee9', 'Signoffs — Lecture', 'VIDEO', NULL, 1, 0),
    ('3283edc2-b36c-4400-b9df-9bac67dafc23', 'f9bb9812-aa82-47fd-a72a-19c3c5d36ef8', 'Design for Testability (DFT) — Overview', 'TEXT', 'This week covers: Manufacturing defects & yield; Fault models & stuck-at faults; Controllability & observability; Scan-chain architecture; Industrial tools: Tessent, TestMAX, Modus; Project submission.', 0, 0),
    ('da1b36eb-2083-4185-bc12-d640a0370a37', 'f9bb9812-aa82-47fd-a72a-19c3c5d36ef8', 'Design for Testability (DFT) — Lecture', 'VIDEO', NULL, 1, 0),
    ('7d0b8fcf-6d6e-49f9-aa9e-a9fc6b994bc4', '8183c662-ea7f-44d2-99d8-bd19f6925d10', 'Final Digital Design Project — Overview', 'TEXT', 'This week covers: Final project presentation & review; Review by external expert.', 0, 0),
    ('abf816e9-c81e-4010-9227-4c6553da57ad', '8183c662-ea7f-44d2-99d8-bd19f6925d10', 'Final Digital Design Project — Lecture', 'VIDEO', NULL, 1, 0);

INSERT INTO courses (id, title, slug, description, category, level, is_free, price, original_price, published, teacher_id, created_at) VALUES
      ('9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Analog VLSI Design', 'analog-vlsi-design', 'The complete analog design track (Weeks 9–20): MOS & differential amplifiers, op-amps, bandgap references, memory circuits, analog layout, noise & reliability, mixed-signal design and a final analog IC project.', 'Analog VLSI', 'ADVANCED', 0, 4999, 9999, 1, '33784211-ce9a-410c-8222-c18a6002a735', 1791223238);

INSERT INTO sections (id, course_id, title, "order") VALUES
    ('3f7af438-fc52-4c8a-9dc6-ff13b275a6e1', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 9: MOS Amplifiers', 0),
    ('c20a1691-ccdc-40f2-92b7-ca5ce008da2b', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 10: Advanced Amplifiers', 1),
    ('3ad6f64f-d01b-494d-b95e-6dc307174eb5', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 11: Differential Amplifier', 2),
    ('be7006d4-fcd0-4f27-ade3-c2b8ee005a41', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 12: Operational Amplifier', 3),
    ('2ee03a75-4fe6-4fa5-978c-1019f2efd24b', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 13: Advanced Op-Amps I', 4),
    ('702d9289-d548-4073-847e-a1448cba0ab0', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 14: Advanced Op-Amps II', 5),
    ('ac38bafa-ebfb-4a91-a66b-f6cdd3cdf03d', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 15: Bandgap Reference', 6),
    ('35e9b648-0615-482c-9714-3b7dcacaa669', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 16: Memory Circuits', 7),
    ('860f46b0-e8d9-4234-914f-bda37147c6ea', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 17: Analog Layout', 8),
    ('6c849fd3-e050-4b27-b3c7-278754331e17', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 18: Noise & Reliability', 9),
    ('14321ea9-9aae-4201-8f51-80b64ff1abde', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 19: Mixed Signal', 10),
    ('b99ecca3-e759-43c1-8c76-c03613dcd9c2', '9fea856f-8dbc-4473-9364-e9941b64dbd9', 'Week 20: Final Analog IC Design Project', 11);

INSERT INTO lessons (id, section_id, title, type, content, "order", is_preview) VALUES
    ('9925a7e1-5898-4ad6-866f-ba600ab43bf8', '3f7af438-fc52-4c8a-9dc6-ff13b275a6e1', 'MOS Amplifiers — Overview', 'TEXT', 'This week covers: Small-signal model; Common Source, Drain & Gate; Gain, Rin/Rout; Frequency response; Lab.', 0, 0),
    ('fc8abbf3-b4ac-40fe-9bdb-9534ddc82063', '3f7af438-fc52-4c8a-9dc6-ff13b275a6e1', 'MOS Amplifiers — Lecture', 'VIDEO', NULL, 1, 0),
    ('7a3d9123-568d-4feb-acd2-58de5894037c', 'c20a1691-ccdc-40f2-92b7-ca5ce008da2b', 'Advanced Amplifiers — Overview', 'TEXT', 'This week covers: Cascade & cascode; Multistage amplifiers; Current mirrors & active loads; Small-signal analysis; Lab.', 0, 0),
    ('36d0dcf9-ae05-43bc-8bfc-a4a8c75e3c59', 'c20a1691-ccdc-40f2-92b7-ca5ce008da2b', 'Advanced Amplifiers — Lecture', 'VIDEO', NULL, 1, 0),
    ('a8acb768-c2a5-4487-8a21-cf26ebc5d38d', '3ad6f64f-d01b-494d-b95e-6dc307174eb5', 'Differential Amplifier — Overview', 'TEXT', 'This week covers: Differential pair; Active loads; CMRR & PSRR; Offset; Design & analysis; Lab.', 0, 0),
    ('165eb93f-da27-4458-9b8b-c96fab9c76f8', '3ad6f64f-d01b-494d-b95e-6dc307174eb5', 'Differential Amplifier — Lecture', 'VIDEO', NULL, 1, 0),
    ('60aa518c-b525-4865-9515-efa0681bf3a2', 'be7006d4-fcd0-4f27-ade3-c2b8ee005a41', 'Operational Amplifier — Overview', 'TEXT', 'This week covers: Two-stage Op-Amp; Folded cascode; Compensation & GBW; Phase margin & slew rate; Project allotted.', 0, 0),
    ('b671c217-5f7a-4a10-ace1-064db570f9e4', 'be7006d4-fcd0-4f27-ade3-c2b8ee005a41', 'Operational Amplifier — Lecture', 'VIDEO', NULL, 1, 0),
    ('f70eded1-da02-4c92-9ecc-5a46d22fa079', '2ee03a75-4fe6-4fa5-978c-1019f2efd24b', 'Advanced Op-Amps I — Overview', 'TEXT', 'This week covers: Rail-to-rail design; Low power; High speed.', 0, 0),
    ('e27d5200-b459-414a-b57d-cb30f62a3079', '2ee03a75-4fe6-4fa5-978c-1019f2efd24b', 'Advanced Op-Amps I — Lecture', 'VIDEO', NULL, 1, 0),
    ('a4b59c69-e77b-4e24-89d7-1fd4d6956ddc', '702d9289-d548-4073-847e-a1448cba0ab0', 'Advanced Op-Amps II — Overview', 'TEXT', 'This week covers: Gain boosting; Design trade-offs; Corner simulations.', 0, 0),
    ('7e930238-8433-481a-9ce9-931033494584', '702d9289-d548-4073-847e-a1448cba0ab0', 'Advanced Op-Amps II — Lecture', 'VIDEO', NULL, 1, 0),
    ('8c5ce999-e553-4fb2-b6b2-efde2ee9df4c', 'ac38bafa-ebfb-4a91-a66b-f6cdd3cdf03d', 'Bandgap Reference — Overview', 'TEXT', 'This week covers: PTAT & CTAT; Startup circuits; Temperature compensation; Applications; Lab.', 0, 0),
    ('0a0bdb72-64fc-409e-9b09-7e79ec967b5e', 'ac38bafa-ebfb-4a91-a66b-f6cdd3cdf03d', 'Bandgap Reference — Lecture', 'VIDEO', NULL, 1, 0),
    ('cba8fc42-30e6-4a79-8f1b-05cf34174fbd', '35e9b648-0615-482c-9714-3b7dcacaa669', 'Memory Circuits — Overview', 'TEXT', 'This week covers: SRAM / DRAM / ROM / Flash; 6T SRAM; Read/Write operation; Sense amplifier; Peripheral circuits.', 0, 0),
    ('6fefe3a3-1f96-4f52-b1d3-de047aecf246', '35e9b648-0615-482c-9714-3b7dcacaa669', 'Memory Circuits — Lecture', 'VIDEO', NULL, 1, 0),
    ('eba5d57f-689d-4bee-b320-719add13c2f8', '860f46b0-e8d9-4234-914f-bda37147c6ea', 'Analog Layout — Overview', 'TEXT', 'This week covers: Layout basics & matching; Common centroid & interdigitation; Dummy devices & guard rings; Latch-up; DRC/LVS/PEX & post-layout simulation.', 0, 0),
    ('fbea8530-25c3-46f4-b0a2-31ef5dac2a93', '860f46b0-e8d9-4234-914f-bda37147c6ea', 'Analog Layout — Lecture', 'VIDEO', NULL, 1, 0),
    ('9d1bf58d-97e4-461d-97a8-e87286fecbfc', '6c849fd3-e050-4b27-b3c7-278754331e17', 'Noise & Reliability — Overview', 'TEXT', 'This week covers: Thermal & flicker noise; Monte Carlo analysis; Corners; ESD & reliability; Analog design flow.', 0, 0),
    ('4e566385-e144-4986-8777-6c09fe15dac0', '6c849fd3-e050-4b27-b3c7-278754331e17', 'Noise & Reliability — Lecture', 'VIDEO', NULL, 1, 0),
    ('02df4864-3673-4507-9107-e373256e5f19', '14321ea9-9aae-4201-8f51-80b64ff1abde', 'Mixed Signal — Overview', 'TEXT', 'This week covers: ADC overview; DAC basics; PLL basics; Memory array; Mixed-signal flow; Project submission.', 0, 0),
    ('8fb87a16-5649-48bd-a0ce-02a021add68d', '14321ea9-9aae-4201-8f51-80b64ff1abde', 'Mixed Signal — Lecture', 'VIDEO', NULL, 1, 0),
    ('7d4ba359-3392-4ec4-83ad-fe98ac247e79', 'b99ecca3-e759-43c1-8c76-c03613dcd9c2', 'Final Analog IC Design Project — Overview', 'TEXT', 'This week covers: Project presentation & review; Review by external expert.', 0, 0),
    ('9a30e553-30d1-47f6-9132-8b23823a0930', 'b99ecca3-e759-43c1-8c76-c03613dcd9c2', 'Final Analog IC Design Project — Lecture', 'VIDEO', NULL, 1, 0);

INSERT INTO enrollments (id, user_id, course_id, enrolled_at, payment_status) VALUES
    ('5e9d3703-6444-4971-ae78-eac05098fa7e', '757f3f8f-aaf9-4856-9a3f-6b52498661f9', '648e1d75-a62f-4849-b134-30d365f817cf', 1791226838, 'NONE');

INSERT INTO reviews (id, user_id, course_id, rating, comment, created_at) VALUES
    ('0bc3a693-3469-44c1-b51b-9e647393d2fd', '757f3f8f-aaf9-4856-9a3f-6b52498661f9', '648e1d75-a62f-4849-b134-30d365f817cf', 5, 'The foundation-first approach made everything click. The free 8 weeks alone are worth it.', 1791226838);
