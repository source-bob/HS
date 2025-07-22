DROP DATABASE if EXISTS heartshield;
CREATE DATABASE heartshield;
USE heartshield;

CREATE TABLE allusers (
    user_id					INT				AUTO_INCREMENT PRIMARY KEY,
    user_email				VARCHAR(100)	NOT NULL UNIQUE,
    user_password			VARCHAR(250)	NOT NULL,
    user_type				VARCHAR(3)		NOT NULL
);

CREATE TABLE doctors (
    id						INT				PRIMARY KEY,
    name					VARCHAR(50)		NOT NULL,
    surname					VARCHAR(50)		NOT NULL,
    henkilotunnus			VARCHAR(15)		NOT NULL UNIQUE,
    phone					VARCHAR(20)		NOT NULL UNIQUE,
    dateofbirth				DATE			NOT NULL,
    dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES allusers(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
    id						INT				PRIMARY KEY,
    name					VARCHAR(50)		NOT NULL,
    surname					VARCHAR(50)		NOT NULL,
    henkilotunnus			VARCHAR(15)		NOT NULL UNIQUE,
    phone					VARCHAR(20)		NOT NULL UNIQUE,
    dateofbirth				DATE			NOT NULL,
    dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES allusers(user_id) ON DELETE CASCADE
);

CREATE TABLE patients (
    id						INT				PRIMARY KEY,
    name					VARCHAR(50)		NOT NULL,
    surname					VARCHAR(50)		NOT NULL,
    henkilotunnus			VARCHAR(15)		NOT NULL UNIQUE,
    phone					VARCHAR(20)		NOT NULL UNIQUE,
    dateofbirth				DATE			NOT NULL,
    dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP,
    doc						INT				NOT NULL,
    FOREIGN KEY (id) REFERENCES allusers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (doc) REFERENCES doctors(id)
);

CREATE TABLE patientrecomm (
    rec_id					INT				AUTO_INCREMENT PRIMARY KEY,
    rec_date				DATETIME		DEFAULT CURRENT_TIMESTAMP,
    rec_patientid			INT				NOT NULL,
    rec_text				VARCHAR(200)	NOT NULL,
    FOREIGN KEY (rec_patientid) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE metrics (
    metric_id               INT             AUTO_INCREMENT PRIMARY KEY,
    pat_id                  INT             NOT NULL,
    lf_hf                   DOUBLE          NOT NULL,
    sdnn                    INT             NOT NULL,
    rmssd                   INT             NOT NULL,
    pnn50                   INT             NOT NULL,
    hr                      INT             NOT NULL,
    rr_mean                 INT             NOT NULL,
    hrv_status              VARCHAR(40)     NOT NULL,
    metric_date             DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE ai_results (
    result_id               INT             AUTO_INCREMENT PRIMARY KEY,
    pat_id                  INT             NOT NULL,
    result_status           VARCHAR(50)     NOT NULL,
    result_pat_text         VARCHAR(150)    NOT NULL,
    result_doc_text         VARCHAR(500)    NOT NULL,
    readed                  VARCHAR(10)     NOT NULL,
    result_date             DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE alarms (
    alarm_id                INT             AUTO_INCREMENT PRIMARY KEY,
    res_id                  INT             NOT NULL,
    pat_id                  INT             NOT NULL,
    doc_id                  INT             NOT NULL,
    pat_check               BOOLEAN         NOT NULL,
    doc_check               BOOLEAN         NOT NULL,
    alarm_date              DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (res_id) REFERENCES ai_results(result_id) ON DELETE CASCADE
);

CREATE TABLE pat_data (
    pat_id                  INT             PRIMARY KEY,
    age                     INT             NOT NULL,
    mi_date                 DATE            NOT NULL,
    pills                   VARCHAR(100),
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE pat_msg (
    msg_id                  INT             AUTO_INCREMENT PRIMARY KEY,
    pat_id                  INT             NOT NULL,
    symptoms                VARCHAR(70)     NOT NULL,
    pat_msg                 VARCHAR(150)    NOT NULL,
    readed                  BOOLEAN         NOT NULL,
    doc_id                  INT             NOT NULL,
    msg_date                DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES doctors(id)
);

/*all_users*/

INSERT INTO allusers (user_id, user_email, user_password, user_type) VALUES
    (1, 'adalovelace@example.com', '$2b$10$MXIpfGHiq20TO2/kJxX8deV5Pr2g0WjUbVbY.Ou9U.5U/QY2RMPWu', 'adm'),
    (2, 'franzkafka@example.com', '$2b$10$MXIpfGHiq20TO2/kJxX8deV5Pr2g0WjUbVbY.Ou9U.5U/QY2RMPWu', 'adm'),
    (3, 'walterfreeman@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc'),
    (4, 'ivanpavlov@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc'),
    (5, 'johnbaker@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc'),
    (6, 'johnnash@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot'),
    (7, 'diogenessinopelainen@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot'),
    (8, 'friedrichnietzsche@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot'),
    (9, 'claraimmerwahr@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot'),
    (10, 'philippepinel@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot'),
    (11, 'renedescartes@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');



-- Администраторы
INSERT INTO admins (id, name, surname, henkilotunnus, phone, dateofbirth) VALUES
  (1, 'Ada', 'Lovelace', '101215-L', '184 307 1852', '1815-12-10'),
  (2, 'Franz', 'Kafka', '030783-K', '+(420) 98 778 9024', '1883-07-03');

-- Врачи
INSERT INTO doctors (id, name, surname, henkilotunnus, phone, dateofbirth) VALUES
  (3, 'Walter', 'Freeman', '141195-F', '350 010 1967', '1895-11-14'),
  (4, 'Ivan', 'Pavlov', '141149-P', '027 002 1904', '1849-11-14'),
  (5, 'John', 'Romilly Baker', '010100-B', '023 005 1990', '1900-01-01');

-- Пациенты
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc) VALUES
  (6, 'John', 'Nash', '130628-N', '195 027 2015', '1928-06-13', 3),
  (7, 'Diogenes', 'Sinopelainen', '030612-S', '(+30) 00 000 0000', '1412-06-03', 3),
  (8, 'Friedrich', 'Nietzsche', '15101844-N', '(+7) 003 1900', '1844-10-15', 3),
  (9, 'Clara', 'Immerwahr', '210670-I', '(+49) 001 1915', '1870-06-21', 3),
  (10, 'Philippe', 'Pinel', '200445-P', '(+33) 004 1793', '1745-04-20', 3),
  (11, 'Rene', 'Descartes', '310396-D', '(+33) 001 0003', '1596-03-31', 3);


/*metrics*/

INSERT INTO metrics (pat_id, lf_hf, sdnn, rmssd, pnn50, hr, rr_mean, hrv_status)
VALUES
(6, 1.04, 131, 129, 43, 74, 926, 'Korkea'),
(6, 0.99, 126, 135, 40, 69, 917, 'Normaali'),

(7, 2.10, 95, 88, 30, 80, 890, 'Korkea'),
(7, 1.85, 98, 91, 32, 78, 874, 'Korkea'),

(8, 0.75, 70, 65, 25, 85, 860, 'Normaali'),
(8, 0.80, 72, 67, 27, 83, 855, 'Normaali'),

(9, 1.30, 110, 105, 38, 70, 920, 'Normaali'),
(9, 1.25, 112, 108, 36, 72, 915, 'Normaali'),

(10, 1.60, 120, 115, 40, 68, 930, 'Normaali'),
(10, 1.55, 118, 117, 42, 69, 928, 'Normaali'),

(11, 0.95, 100, 98, 35, 76, 905, 'Normaali'),
(11, 0.90, 102, 95, 34, 75, 899, 'Normaali');

/*ai_res*/
INSERT INTO ai_results (pat_id, result_status, result_pat_text, result_doc_text, readed)
VALUES
(6, 'normal', 'Continue monitoring and maintain normal activities. Contact a doctor if you experience chest pain or shortness of breath.', 'HRV parameters (SDNN, RMSSD, pNN50) are within normal ranges. Balanced LF/HF ratio suggests stable autonomic activity. No immediate signs of acute cardiac risk based on current data.', 'false'),
(6, 'normal', 'Continue monitoring. Report any chest discomfort, shortness of breath, or dizziness immediately.', 'HRV parameters (SDNN, RMSSD, pNN50, LF/HF) within normal ranges. No acute indicators observed. Consider reviewing clinical history if symptoms emerge.', 'false'),
(7, 'warning', 'Slight irregularities detected. Reduce stress and avoid stimulants. Follow up soon.', 'LF/HF ratio elevated. RMSSD and SDNN slightly reduced. May indicate stress-related imbalance.', 'false'),
(7, 'normal', 'All readings currently stable. Maintain a healthy routine.', 'HRV values within expected limits. Continue monitoring.', 'false'),
(8, 'alert', 'Please contact your doctor immediately. Symptoms may indicate elevated cardiac risk.', 'Low SDNN and RMSSD suggest possible autonomic dysregulation. History review recommended.', 'false'),
(9, 'normal', 'No immediate concerns. Keep up with medications and daily health checks.', 'Stable HRV metrics. LF/HF ratio balanced.', 'false'),
(10, 'normal', 'Heart activity looks stable. Maintain current lifestyle and meds.', 'No significant anomalies detected in HRV parameters.', 'false'),
(11, 'warning', 'Monitor your condition closely. Avoid heavy physical strain.', 'Slight reduction in RMSSD. Could indicate fatigue or early warning. Retest in 1 week.', 'false');


/*alarms*/

INSERT INTO alarms (res_id, pat_id, doc_id, pat_check, doc_check)
VALUES
(1, 6, 3, false, false),
(1, 6, 3, false, false),

(2, 7, 3, false, false),
(3, 7, 3, false, false),

(3, 8, 3, false, false),
(4, 8, 3, false, false),

(5, 9, 3, false, false),
(6, 9, 3, false, false),

(7, 10, 3, false, false),
(7, 10, 3, false, false),

(8, 11, 3, false, false),
(8, 11, 3, false, false);

/*pat_data*/

INSERT INTO pat_data (pat_id, age, mi_date, pills)
VALUES
(6, 49, '2025-06-27', 'Burana'),
(7, 65, '2025-05-01', 'Aspiriini'),
(8, 45, '2025-04-15', 'Bisoprolol'),
(9, 55, '2025-03-20', 'Metoprolol'),
(10, 68, '2025-01-10', 'Ramipril'),
(11, 72, '2025-02-25', 'Atorvastatin');

INSERT INTO patientrecomm (rec_patientid, rec_text)
VALUES
(6, 'Take a 30-minute walk outdoors every day.'),
(7, 'Avoid stress and maintain at least 7 hours of sleep.'),
(8, 'Follow a low-salt, low-fat heart-friendly diet.'),
(9, 'Monitor your blood pressure daily and keep a log.'),
(10, 'Take your prescribed medication exactly on schedule.'),
(11, 'Avoid smoking and alcohol; check cholesterol regularly.'),
(6, 'Avoid climbing stairs quickly and rest when tired.'),
(7, 'Eat small, frequent meals to reduce heart strain.'),
(8, 'Check your weight twice a week and track changes.'),
(9, 'Limit screen time and take regular breaks to relax.'),
(10, 'Stay indoors during extreme temperatures.'),
(11, 'Use reminders to ensure timely medication intake.');
