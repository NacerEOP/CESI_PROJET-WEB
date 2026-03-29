-- Use the database
CREATE DATABASE IF NOT EXISTS find_your_internship;
USE find_your_internship;

-- =====================================================
-- First, populate lookup tables (no dependencies)
-- =====================================================

-- Populate Countries
INSERT INTO Countries (CountryName) VALUES
('United States'),
('Canada'),
('United Kingdom'),
('Germany'),
('France'),
('Spain'),
('Australia'),
('India'),
('Singapore'),
('Netherlands'),
('Sweden'),
('Switzerland'),
('Brazil'),
('Mexico'),
('Japan');

-- Populate Skills
INSERT INTO Skills (Skill) VALUES
('Communication'),
('Teamwork'),
('Problem Solving'),
('Leadership'),
('Time Management'),
('Critical Thinking'),
('Adaptability'),
('Creativity'),
('Attention to Detail'),
('Project Management'),
('Data Analysis'),
('Public Speaking'),
('Negotiation'),
('Customer Service'),
('Technical Writing'),
('Research'),
('Presentation Skills'),
('Conflict Resolution'),
('Decision Making'),
('Networking');

-- Populate Category
INSERT INTO Category (CategoryName) VALUES
('Software Development'),
('Data Science'),
('Marketing'),
('Finance'),
('Human Resources'),
('Sales'),
('Customer Support'),
('Design'),
('Product Management'),
('Operations'),
('Business Development'),
('Research & Development'),
('Quality Assurance'),
('DevOps'),
('Cybersecurity'),
('Artificial Intelligence'),
('Cloud Computing'),
('Mobile Development'),
('Frontend Development'),
('Backend Development');

-- =====================================================
-- Populate Companies (referenced by Users? No, Users references Countries only)
-- Companies can be populated now as they only reference Countries
-- =====================================================
INSERT INTO Companies (Name, Description, Email, Phone, Id_Country) VALUES
('TechCorp Solutions', 'Leading software development company', 'contact@techcorp.com', '+1-555-1001', 1),
('DataMind Analytics', 'Data science and AI solutions', 'info@datamind.com', '+1-555-1002', 1),
('CloudNine Systems', 'Cloud infrastructure specialists', 'hello@cloudnine.com', '+1-555-1003', 2),
('InnovateTech', 'Cutting-edge technology solutions', 'contact@innovatetech.com', '+1-555-1004', 3),
('Global Finance Inc', 'Financial services and consulting', 'hr@globalfinance.com', '+1-555-1005', 4),
('Marketing Pro', 'Digital marketing agency', 'careers@marketingpro.com', '+1-555-1006', 5),
('Design Studio', 'Creative design and branding', 'jobs@designstudio.com', '+1-555-1007', 6),
('CyberShield', 'Cybersecurity experts', 'recruit@cybershield.com', '+1-555-1008', 7),
('DevOps Masters', 'Infrastructure automation', 'team@devopsmasters.com', '+1-555-1009', 8),
('AI Innovations', 'Artificial intelligence research', 'careers@aiinnovations.com', '+1-555-1010', 9),
('MobileFirst', 'Mobile app development', 'jobs@mobilefirst.com', '+1-555-1011', 10),
('FinTech Solutions', 'Financial technology', 'hr@fintechsolutions.com', '+1-555-1012', 11),
('HealthTech Corp', 'Healthcare technology', 'careers@healthtech.com', '+1-555-1013', 12),
('EcoEnergy', 'Sustainable energy solutions', 'jobs@ecoenergy.com', '+1-555-1014', 13),
('RetailTech', 'E-commerce solutions', 'hr@retailtech.com', '+1-555-1015', 14),
('GameStudios', 'Video game development', 'careers@gamestudios.com', '+1-555-1016', 15),
('SocialMedia Inc', 'Social networking platforms', 'jobs@socialmedia.com', '+1-555-1017', 1),
('Robotics Corp', 'Robotics and automation', 'hr@roboticscorp.com', '+1-555-1018', 2),
('BioTech Labs', 'Biotechnology research', 'careers@biotechlabs.com', '+1-555-1019', 3),
('SpaceTech', 'Aerospace technology', 'jobs@spacetech.com', '+1-555-1020', 4),
('Quantum Computing', 'Quantum computing research', 'hr@quantumcomp.com', '+1-555-1021', 5),
('Virtual Reality Co', 'VR/AR solutions', 'careers@vrco.com', '+1-555-1022', 6),
('Blockchain Corp', 'Blockchain technology', 'jobs@blockchaincorp.com', '+1-555-1023', 7),
('IoT Solutions', 'Internet of Things', 'hr@iotsolutions.com', '+1-555-1024', 8),
('EdTech Start', 'Educational technology', 'careers@edtechstart.com', '+1-555-1025', 9),
('GreenTech', 'Environmental technology', 'jobs@greentech.com', '+1-555-1026', 10),
('AutoDrive', 'Autonomous vehicles', 'hr@autodrive.com', '+1-555-1027', 11),
('SmartHome', 'Smart home solutions', 'careers@smarthome.com', '+1-555-1028', 12),
('WearableTech', 'Wearable devices', 'jobs@wearabletech.com', '+1-555-1029', 13),
('AgriTech', 'Agricultural technology', 'hr@agritech.com', '+1-555-1030', 14);

-- =====================================================
-- Populate Users (now Countries table exists)
-- =====================================================
INSERT INTO Users (FirstName, LastName, Email, Password, UserPhone, DoB, JoinDate, Id_Country) VALUES
('John', 'Smith', 'john.smith@email.com', 'pass123', '+1-555-0101', '2000-05-15', '2024-01-15', 1),
('Emma', 'Johnson', 'emma.johnson@email.com', 'pass123', '+1-555-0102', '2001-03-22', '2024-01-16', 1),
('Michael', 'Brown', 'michael.brown@email.com', 'pass123', '+1-555-0103', '1999-11-10', '2024-01-17', 2),
('Sophia', 'Davis', 'sophia.davis@email.com', 'pass123', '+1-555-0104', '2000-07-08', '2024-01-18', 3),
('William', 'Wilson', 'william.wilson@email.com', 'pass123', '+1-555-0105', '2001-09-12', '2024-01-19', 4),
('Olivia', 'Martinez', 'olivia.martinez@email.com', 'pass123', '+1-555-0106', '2000-12-03', '2024-01-20', 5),
('James', 'Garcia', 'james.garcia@email.com', 'pass123', '+1-555-0107', '1999-04-18', '2024-01-21', 6),
('Isabella', 'Rodriguez', 'isabella.rodriguez@email.com', 'pass123', '+1-555-0108', '2001-01-25', '2024-01-22', 7),
('Benjamin', 'Martinez', 'benjamin.martinez@email.com', 'pass123', '+1-555-0109', '2000-08-14', '2024-01-23', 8),
('Mia', 'Anderson', 'mia.anderson@email.com', 'pass123', '+1-555-0110', '2001-06-30', '2024-01-24', 9),
('Lucas', 'Taylor', 'lucas.taylor@email.com', 'pass123', '+1-555-0111', '2000-02-17', '2024-01-25', 10),
('Amelia', 'Thomas', 'amelia.thomas@email.com', 'pass123', '+1-555-0112', '1999-10-05', '2024-01-26', 11),
('Ethan', 'Hernandez', 'ethan.hernandez@email.com', 'pass123', '+1-555-0113', '2001-04-22', '2024-01-27', 12),
('Charlotte', 'Moore', 'charlotte.moore@email.com', 'pass123', '+1-555-0114', '2000-09-09', '2024-01-28', 13),
('Alexander', 'Jackson', 'alexander.jackson@email.com', 'pass123', '+1-555-0115', '2001-07-19', '2024-01-29', 14),
('Ava', 'Martin', 'ava.martin@email.com', 'pass123', '+1-555-0116', '2000-03-12', '2024-01-30', 15),
('Daniel', 'Lee', 'daniel.lee@email.com', 'pass123', '+1-555-0117', '1999-12-28', '2024-02-01', 1),
('Emily', 'White', 'emily.white@email.com', 'pass123', '+1-555-0118', '2001-08-15', '2024-02-02', 2),
('Matthew', 'Harris', 'matthew.harris@email.com', 'pass123', '+1-555-0119', '2000-05-20', '2024-02-03', 3),
('Ella', 'Clark', 'ella.clark@email.com', 'pass123', '+1-555-0120', '2001-11-03', '2024-02-04', 4),
('David', 'Lewis', 'david.lewis@email.com', 'pass123', '+1-555-0121', '2000-01-08', '2024-02-05', 5),
('Grace', 'Walker', 'grace.walker@email.com', 'pass123', '+1-555-0122', '1999-06-14', '2024-02-06', 6),
('Joseph', 'Hall', 'joseph.hall@email.com', 'pass123', '+1-555-0123', '2001-09-27', '2024-02-07', 7),
('Chloe', 'Allen', 'chloe.allen@email.com', 'pass123', '+1-555-0124', '2000-04-03', '2024-02-08', 8),
('Samuel', 'Young', 'samuel.young@email.com', 'pass123', '+1-555-0125', '2001-02-11', '2024-02-09', 9),
('Victoria', 'King', 'victoria.king@email.com', 'pass123', '+1-555-0126', '2000-10-22', '2024-02-10', 10),
('Andrew', 'Wright', 'andrew.wright@email.com', 'pass123', '+1-555-0127', '1999-08-19', '2024-02-11', 11),
('Madison', 'Lopez', 'madison.lopez@email.com', 'pass123', '+1-555-0128', '2001-12-01', '2024-02-12', 12),
('Joshua', 'Hill', 'joshua.hill@email.com', 'pass123', '+1-555-0129', '2000-07-07', '2024-02-13', 13),
('Lily', 'Scott', 'lily.scott@email.com', 'pass123', '+1-555-0130', '2001-05-18', '2024-02-14', 14),
('Christopher', 'Green', 'christopher.green@email.com', 'pass123', '+1-555-0131', '2000-03-25', '2024-02-15', 15),
('Natalie', 'Adams', 'natalie.adams@email.com', 'pass123', '+1-555-0132', '1999-11-12', '2024-02-16', 1),
('Ryan', 'Baker', 'ryan.baker@email.com', 'pass123', '+1-555-0133', '2001-04-08', '2024-02-17', 2),
('Hannah', 'Gonzalez', 'hannah.gonzalez@email.com', 'pass123', '+1-555-0134', '2000-09-30', '2024-02-18', 3),
('Nathan', 'Nelson', 'nathan.nelson@email.com', 'pass123', '+1-555-0135', '2001-01-14', '2024-02-19', 4),
('Zoe', 'Carter', 'zoe.carter@email.com', 'pass123', '+1-555-0136', '2000-06-05', '2024-02-20', 5),
('Christian', 'Mitchell', 'christian.mitchell@email.com', 'pass123', '+1-555-0137', '1999-10-28', '2024-02-21', 6),
('Avery', 'Perez', 'avery.perez@email.com', 'pass123', '+1-555-0138', '2001-07-22', '2024-02-22', 7),
('Dylan', 'Roberts', 'dylan.roberts@email.com', 'pass123', '+1-555-0139', '2000-02-14', '2024-02-23', 8),
('Sofia', 'Turner', 'sofia.turner@email.com', 'pass123', '+1-555-0140', '2001-08-09', '2024-02-24', 9),
('Gabriel', 'Phillips', 'gabriel.phillips@email.com', 'pass123', '+1-555-0141', '2000-04-17', '2024-02-25', 10),
('Aria', 'Campbell', 'aria.campbell@email.com', 'pass123', '+1-555-0142', '1999-12-05', '2024-02-26', 11),
('Caleb', 'Parker', 'caleb.parker@email.com', 'pass123', '+1-555-0143', '2001-03-29', '2024-02-27', 12),
('Evelyn', 'Evans', 'evelyn.evans@email.com', 'pass123', '+1-555-0144', '2000-11-15', '2024-02-28', 13),
('Isaac', 'Edwards', 'isaac.edwards@email.com', 'pass123', '+1-555-0145', '2001-05-02', '2024-02-29', 14),
('Lillian', 'Collins', 'lillian.collins@email.com', 'pass123', '+1-555-0146', '2000-08-21', '2024-03-01', 15),
('Jack', 'Stewart', 'jack.stewart@email.com', 'pass123', '+1-555-0147', '1999-09-09', '2024-03-02', 1),
('Eleanor', 'Sanchez', 'eleanor.sanchez@email.com', 'pass123', '+1-555-0148', '2001-06-27', '2024-03-03', 2),
('Luke', 'Morris', 'luke.morris@email.com', 'pass123', '+1-555-0149', '2000-10-12', '2024-03-04', 3),
('Penelope', 'Rogers', 'penelope.rogers@email.com', 'pass123', '+1-555-0150', '2001-01-03', '2024-03-05', 4);

-- =====================================================
-- Populate Admin (Users 1-5 are Admins)
-- =====================================================
INSERT INTO Admin (IdUser) VALUES
(1), (2), (3), (4), (5);

-- =====================================================
-- Populate Pilot (Users 6-15 are Pilots)
-- =====================================================
INSERT INTO Pilot (IdUser) VALUES
(6), (7), (8), (9), (10),
(11), (12), (13), (14), (15);

-- =====================================================
-- Populate Student (Users 16-50 are Students)
-- =====================================================
INSERT INTO Student (IdUser_1, SchoolLevel, SchoolYear, Major, IdUser) VALUES
(16, 'Bachelor', 3, 'Computer Science', 6),
(17, 'Bachelor', 4, 'Software Engineering', 7),
(18, 'Master', 1, 'Data Science', 8),
(19, 'Bachelor', 2, 'Business Administration', 9),
(20, 'Bachelor', 3, 'Marketing', 10),
(21, 'Master', 2, 'Artificial Intelligence', 6),
(22, 'Bachelor', 4, 'Information Technology', 7),
(23, 'Bachelor', 3, 'Finance', 8),
(24, 'Bachelor', 2, 'Graphic Design', 9),
(25, 'Master', 1, 'Cybersecurity', 10),
(26, 'Bachelor', 3, 'Computer Engineering', 6),
(27, 'Bachelor', 4, 'Economics', 7),
(28, 'Master', 2, 'Machine Learning', 8),
(29, 'Bachelor', 2, 'Digital Marketing', 9),
(30, 'Bachelor', 3, 'Human Resources', 10),
(31, 'Master', 1, 'Cloud Computing', 6),
(32, 'Bachelor', 4, 'Web Development', 7),
(33, 'Bachelor', 3, 'Accounting', 8),
(34, 'Bachelor', 2, 'UI/UX Design', 9),
(35, 'Master', 2, 'DevOps', 10),
(36, 'Bachelor', 3, 'Computer Science', 6),
(37, 'Bachelor', 4, 'Data Analytics', 7),
(38, 'Master', 1, 'Software Architecture', 8),
(39, 'Bachelor', 2, 'International Business', 9),
(40, 'Bachelor', 3, 'Product Management', 10),
(41, 'Master', 2, 'Blockchain', 6),
(42, 'Bachelor', 4, 'Mobile Development', 7),
(43, 'Bachelor', 3, 'Statistics', 8),
(44, 'Bachelor', 2, 'Communications', 9),
(45, 'Master', 1, 'AI Ethics', 10),
(46, 'Bachelor', 3, 'Computer Science', 6),
(47, 'Bachelor', 4, 'Information Systems', 7),
(48, 'Master', 2, 'Big Data', 8),
(49, 'Bachelor', 2, 'Project Management', 9),
(50, 'Bachelor', 3, 'Entrepreneurship', 10);

-- =====================================================
-- Populate Internships (after Companies and Category are populated)
-- =====================================================
INSERT INTO Internships (Title, Description, DateOfCreation, Budget, Time_, Id_Category, IdCompany) VALUES
('Frontend Developer Intern', 'Build responsive web applications using React', '2024-01-15', 2500.00, 12, 1, 1),
('Backend Developer Intern', 'Develop RESTful APIs with Node.js', '2024-01-16', 2800.00, 12, 2, 1),
('Data Science Intern', 'Analyze data and build ML models', '2024-01-17', 3000.00, 12, 2, 2),
('Digital Marketing Intern', 'Create and manage social media campaigns', '2024-01-18', 2200.00, 12, 3, 6),
('Financial Analyst Intern', 'Support financial planning and analysis', '2024-01-19', 2600.00, 12, 4, 5),
('HR Assistant Intern', 'Recruitment and employee engagement', '2024-01-20', 2000.00, 12, 5, 5),
('Sales Intern', 'Support sales team and client acquisition', '2024-01-21', 2100.00, 12, 6, 6),
('UX/UI Design Intern', 'Design user interfaces and experiences', '2024-01-22', 2400.00, 12, 8, 7),
('Product Management Intern', 'Assist in product development lifecycle', '2024-01-23', 2700.00, 12, 9, 3),
('DevOps Engineer Intern', 'CI/CD pipeline management', '2024-01-24', 2900.00, 12, 14, 9),
('Cybersecurity Intern', 'Security monitoring and analysis', '2024-01-25', 2850.00, 12, 15, 8),
('AI Research Intern', 'Research in machine learning algorithms', '2024-01-26', 3200.00, 12, 16, 10),
('Cloud Engineer Intern', 'AWS/Azure infrastructure management', '2024-01-27', 2950.00, 12, 17, 4),
('Mobile Developer Intern', 'iOS/Android app development', '2024-01-28', 2750.00, 12, 18, 11),
('Full Stack Intern', 'End-to-end web development', '2024-01-29', 3000.00, 12, 1, 1),
('QA Engineer Intern', 'Software testing and quality assurance', '2024-01-30', 2300.00, 12, 13, 4),
('Business Development Intern', 'Market research and partnership building', '2024-02-01', 2400.00, 12, 11, 5),
('Data Engineer Intern', 'Build and maintain data pipelines', '2024-02-02', 2850.00, 12, 2, 2),
('React Native Intern', 'Cross-platform mobile development', '2024-02-03', 2700.00, 12, 18, 11),
('Python Developer Intern', 'Backend development with Python', '2024-02-04', 2800.00, 12, 1, 1),
('Database Admin Intern', 'Database management and optimization', '2024-02-05', 2600.00, 12, 1, 3),
('Content Marketing Intern', 'Create engaging content for platforms', '2024-02-06', 2100.00, 12, 3, 6),
('Social Media Intern', 'Manage social media presence', '2024-02-07', 2000.00, 12, 3, 6),
('Graphic Design Intern', 'Create visual assets and branding', '2024-02-08', 2300.00, 12, 8, 7),
('Video Production Intern', 'Create and edit video content', '2024-02-09', 2250.00, 12, 8, 7),
('SEO Specialist Intern', 'Search engine optimization', '2024-02-10', 2150.00, 12, 3, 6),
('Data Visualization Intern', 'Create dashboards and reports', '2024-02-11', 2500.00, 12, 2, 2),
('Machine Learning Intern', 'Develop ML models and algorithms', '2024-02-12', 3100.00, 12, 16, 10),
('Blockchain Developer Intern', 'Smart contract development', '2024-02-13', 3200.00, 12, 1, 22),
('IoT Developer Intern', 'IoT device programming', '2024-02-14', 2800.00, 12, 1, 24),
('Game Developer Intern', 'Unity/Unreal game development', '2024-02-15', 2900.00, 12, 1, 16),
('AR/VR Developer Intern', 'Augmented and virtual reality', '2024-02-16', 3000.00, 12, 1, 22),
('Robotics Intern', 'Robot programming and control', '2024-02-17', 2950.00, 12, 1, 18),
('Biotech Research Intern', 'Biotechnology research assistance', '2024-02-18', 2750.00, 12, 12, 19),
('Aerospace Intern', 'Aerospace engineering projects', '2024-02-19', 3100.00, 12, 12, 20),
('Quantum Computing Intern', 'Quantum algorithms research', '2024-02-20', 3400.00, 12, 12, 21),
('Sustainability Intern', 'Environmental sustainability projects', '2024-02-21', 2400.00, 12, 10, 26),
('E-commerce Intern', 'Online retail platform management', '2024-02-22', 2500.00, 12, 11, 15),
('Supply Chain Intern', 'Logistics and supply chain optimization', '2024-02-23', 2350.00, 12, 10, 15),
('Customer Success Intern', 'Client support and relationship management', '2024-02-24', 2200.00, 12, 7, 15),
('Technical Writing Intern', 'Create technical documentation', '2024-02-25', 2300.00, 12, 1, 3),
('Product Design Intern', 'Product prototyping and design', '2024-02-26', 2600.00, 12, 8, 7),
('Business Analytics Intern', 'Data-driven business insights', '2024-02-27', 2550.00, 12, 2, 5),
('IT Support Intern', 'Technical support and troubleshooting', '2024-02-28', 2100.00, 12, 10, 4),
('Network Admin Intern', 'Network infrastructure management', '2024-03-01', 2400.00, 12, 10, 9),
('Cloud Security Intern', 'Cloud security best practices', '2024-03-02', 2900.00, 12, 15, 8),
('Ethical Hacking Intern', 'Penetration testing and security', '2024-03-03', 2950.00, 12, 15, 8),
('UI Animation Intern', 'Create engaging UI animations', '2024-03-04', 2450.00, 12, 8, 7),
('Voice UI Intern', 'Voice interface development', '2024-03-05', 2700.00, 12, 1, 10),
('Computer Vision Intern', 'Image recognition and processing', '2024-03-06', 3050.00, 12, 16, 10),
('NLP Engineer Intern', 'Natural language processing', '2024-03-07', 3150.00, 12, 16, 10),
('Recommendation Systems Intern', 'Build recommendation algorithms', '2024-03-08', 3000.00, 12, 16, 2),
('Big Data Intern', 'Hadoop/Spark data processing', '2024-03-09', 3100.00, 12, 2, 2),
('Edge Computing Intern', 'Edge device programming', '2024-03-10', 2850.00, 12, 17, 4),
('Serverless Intern', 'Serverless architecture development', '2024-03-11', 2900.00, 12, 17, 4),
('Microservices Intern', 'Microservices architecture', '2024-03-12', 2950.00, 12, 1, 1),
('API Development Intern', 'API design and development', '2024-03-13', 2800.00, 12, 1, 1),
('System Architecture Intern', 'System design and architecture', '2024-03-14', 3050.00, 12, 1, 3),
('Performance Testing Intern', 'Load and performance testing', '2024-03-15', 2500.00, 12, 13, 4),
('Automation Intern', 'Test automation development', '2024-03-16', 2600.00, 12, 13, 4);

-- =====================================================
-- Populate WishList (Student wishlists)
-- =====================================================
INSERT INTO WishList (IdInternship, IdUser) VALUES
(1, 16), (2, 16), (3, 17), (4, 17), (5, 18),
(6, 18), (7, 19), (8, 19), (9, 20), (10, 20),
(11, 21), (12, 21), (13, 22), (14, 22), (15, 23),
(16, 23), (17, 24), (18, 24), (19, 25), (20, 25),
(21, 26), (22, 26), (23, 27), (24, 27), (25, 28),
(26, 28), (27, 29), (28, 29), (29, 30), (30, 30),
(31, 31), (32, 31), (33, 32), (34, 32), (35, 33),
(36, 33), (37, 34), (38, 34), (39, 35), (40, 35),
(41, 36), (42, 36), (43, 37), (44, 37), (45, 38),
(46, 38), (47, 39), (48, 39), (49, 40), (50, 40);

-- =====================================================
-- Populate Application (Student applications)
-- =====================================================
INSERT INTO Application (IdInternship, IdUser) VALUES
(1, 16), (3, 17), (5, 18), (7, 19), (9, 20),
(11, 21), (13, 22), (15, 23), (17, 24), (19, 25),
(21, 26), (23, 27), (25, 28), (27, 29), (29, 30),
(31, 31), (33, 32), (35, 33), (37, 34), (39, 35),
(41, 36), (43, 37), (45, 38), (47, 39), (49, 40),
(2, 16), (4, 17), (6, 18), (8, 19), (10, 20),
(12, 21), (14, 22), (16, 23), (18, 24), (20, 25),
(22, 26), (24, 27), (26, 28), (28, 29), (30, 30),
(32, 31), (34, 32), (36, 33), (38, 34), (40, 35),
(42, 36), (44, 37), (46, 38), (48, 39), (50, 40);

-- =====================================================
-- Populate RatingAdmin (Admin ratings for companies)
-- =====================================================
INSERT INTO RatingAdmin (IdCompany, IdUser, Rating, RatingText) VALUES
(1, 1, 5, 'Excellent company with great culture'),
(2, 1, 4, 'Good company, innovative projects'),
(3, 2, 5, 'Top-tier company, highly recommended'),
(4, 2, 4, 'Solid company with good benefits'),
(5, 3, 3, 'Average company, room for improvement'),
(6, 3, 4, 'Good marketing agency'),
(7, 4, 5, 'Creative environment, excellent team'),
(8, 4, 5, 'Leading in cybersecurity'),
(9, 5, 4, 'Great DevOps practices'),
(10, 5, 5, 'Cutting-edge AI research'),
(11, 1, 4, 'Good mobile development opportunities'),
(12, 2, 4, 'Innovative fintech solutions'),
(13, 3, 5, 'Excellent healthcare tech'),
(14, 4, 4, 'Sustainable energy focus'),
(15, 5, 4, 'Strong e-commerce presence'),
(16, 1, 5, 'Creative game development'),
(17, 2, 4, 'Growing social media platform'),
(18, 3, 5, 'Advanced robotics work'),
(19, 4, 5, 'Cutting-edge biotech'),
(20, 5, 5, 'Space technology leader');

-- =====================================================
-- Populate RatingPilot (Pilot ratings for companies)
-- =====================================================
INSERT INTO RatingPilot (IdCompany, IdUser, Rating, RatingText) VALUES
(1, 6, 5, 'Excellent mentorship program'),
(2, 6, 4, 'Good learning opportunities'),
(3, 7, 5, 'Great company culture'),
(4, 7, 4, 'Supportive environment'),
(5, 8, 3, 'Could improve training'),
(6, 8, 4, 'Good hands-on experience'),
(7, 9, 5, 'Creative and innovative'),
(8, 9, 5, 'Excellent security training'),
(9, 10, 4, 'Good DevOps practices'),
(10, 10, 5, 'Great AI projects'),
(11, 6, 4, 'Mobile development focus'),
(12, 7, 4, 'Financial tech experience'),
(13, 8, 5, 'Healthcare innovation'),
(14, 9, 4, 'Sustainability focus'),
(15, 10, 4, 'E-commerce exposure'),
(16, 6, 5, 'Game development fun'),
(17, 7, 4, 'Social media insights'),
(18, 8, 5, 'Robotics expertise'),
(19, 9, 5, 'Biotech research'),
(20, 10, 5, 'Aerospace engineering'),
(21, 6, 5, 'Quantum computing future'),
(22, 7, 4, 'VR/AR innovation'),
(23, 8, 5, 'Blockchain expertise'),
(24, 9, 4, 'IoT solutions'),
(25, 10, 4, 'EdTech impact'),
(26, 6, 5, 'Green technology'),
(27, 7, 5, 'Autonomous vehicles'),
(28, 8, 4, 'Smart home solutions'),
(29, 9, 4, 'Wearable tech'),
(30, 10, 4, 'Agricultural innovation');

-- =====================================================
-- Populate InternshipSkillNeeds
-- =====================================================
INSERT INTO InternshipSkillNeeds (IdInternship, IdSkills) VALUES
(1, 1), (1, 2), (1, 3), (1, 9),
(2, 3), (2, 4), (2, 5), (2, 9),
(3, 3), (3, 6), (3, 11), (3, 5),
(4, 1), (4, 2), (4, 8), (4, 12),
(5, 3), (5, 4), (5, 6), (5, 11),
(6, 1), (6, 2), (6, 5), (6, 10),
(7, 1), (7, 2), (7, 13), (7, 5),
(8, 1), (8, 2), (8, 8), (8, 9),
(9, 1), (9, 2), (9, 4), (9, 10),
(10, 3), (10, 4), (10, 5), (10, 14),
(11, 3), (11, 6), (11, 15), (11, 1),
(12, 3), (12, 6), (12, 16), (12, 7),
(13, 3), (13, 4), (13, 5), (13, 17),
(14, 3), (14, 4), (14, 9), (14, 18),
(15, 1), (15, 2), (15, 3), (15, 9),
(16, 3), (16, 5), (16, 9), (16, 19),
(17, 1), (17, 2), (17, 4), (17, 13),
(18, 3), (18, 6), (18, 11), (18, 14),
(19, 3), (19, 4), (19, 9), (19, 18),
(20, 3), (20, 4), (20, 5), (20, 9);

-- (IntershipsTechs table removed, no seed data needed)

-- VERIFY: All remaining INSERT statements refer to existing tables in CreateDB.sql.