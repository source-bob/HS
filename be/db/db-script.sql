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
    res_id                  INT             PRIMARY KEY,
    pat_id                  INT             NOT NULL,
    doc_id                  INT             NOT NULL,
    pat_check               BOOLEAN         NOT NULL,
    doc_check               BOOLEAN         NOT NULL,
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doc_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE pat_data (
    pat_id                  INT             PRIMARY KEY,
    age                     INT             NOT NULL,
    mi_date                 DATE            NOT NULL,
    pills                   VARCHAR(100),
    FOREIGN KEY (pat_id) REFERENCES patients(id) ON DELETE CASCADE
);



/*admins*/
INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('adalovelace@example.com', '$2b$10$MXIpfGHiq20TO2/kJxX8deV5Pr2g0WjUbVbY.Ou9U.5U/QY2RMPWu', 'adm');
INSERT INTO admins (id, name, surname, henkilotunnus, phone, dateofbirth)
VALUES (1, 'Ada', 'Lovelace', '101215-L', '184 307 1852', '1815-12-10');

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('franzkafka@example.com', '$2b$10$MXIpfGHiq20TO2/kJxX8deV5Pr2g0WjUbVbY.Ou9U.5U/QY2RMPWu', 'adm');
INSERT INTO admins (id, name, surname, henkilotunnus, phone, dateofbirth)
VALUES (2, 'Franz', 'Kafka', '030783-K', '+(420) 98 778 9024', '1883-07-03');

/*docs*/
INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('walterfreeman@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc');
INSERT INTO doctors (id, name, surname, henkilotunnus, phone, dateofbirth)
VALUES (3, 'Walter', 'Freeman', '141195-F', '350 010 1967', '1895-11-14');

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('ivanpavlov@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc');
INSERT INTO doctors (id, name, surname, henkilotunnus, phone, dateofbirth)
VALUES (4, 'Ivan', 'Pavlov', '141149-P', '027 002 1904', '1849-11-14');

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('johnbaker@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc');
INSERT INTO doctors (id, name, surname, henkilotunnus, phone, dateofbirth)
VALUES (5, 'John', 'Romilly Baker', '010100-B', '023 005 1990', '1900-01-01');

/*patients*/

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('johnnash@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
VALUES (6, 'John', 'Nash', '130628-N', '195 027 2015', '1928-06-13', 3);

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('diogenessinopelainen@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
VALUES (7, 'Diogenes', 'Sinopelainen', '030612-S', '(+30) 00 000 0000', '1412-06-03', 3);

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('friedrichnietzsche@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
VALUES (8, 'Friedrich', 'Nietzsche', '15101844-N', '(+7) 003 1900', '1844-10-15', 3);

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('claraimmerwahr@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
VALUES (9, 'Clara', 'Immerwahr', '210670-I', '(+49) 001 1915', '1870-06-21', 3);

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('philippepinel@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
VALUES (10, 'Philippe', 'Pinel', '200445-P', '(+33) 004 1793', '1745-04-20', 3);

INSERT INTO allusers (user_email, user_password, user_type)
VALUES ('renedescartes@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
VALUES (11, 'Rene', 'Descartes', '310396-D', '(+33) 001 0003', '1596-03-31', 3);

/*metrics*/

INSERT INTO metrics (pat_id, lf_hf, sdnn, rmssd, pnn50, hr, rr_mean)
VALUES (6, 1.04, 131, 129, 43, 74, 926);
INSERT INTO metrics (pat_id, lf_hf, sdnn, rmssd, pnn50, hr, rr_mean)
VALUES (6, 0.99, 126, 135, 40, 69, 917);

/*alarms*/

INSERT INTO alarms (res_id, pat_id, doc_id, pat_check, doc_check)
VALUES (1, 6, 3, false, false);

INSERT INTO alarms (res_id, pat_id, doc_id, pat_check, doc_check)
VALUES (2, 6, 3, false, false);

/*ai_res*/
INSERT INTO ai_results (pat_id, result_status, result_pat_text, result_doc_text, readed)
VALUES (6, 'normal', 'Continue monitoring and maintain normal activities. Contact a doctor if you experience chest pain or shortness of breath.', 'HRV parameters (SDNN, RMSSD, pNN50) are within normal ranges. Balanced LF/HF ratio suggests stable autonomic activity. No immediate signs of acute cardiac risk based on current data.', 'false')

INSERT INTO ai_results (pat_id, result_status, result_pat_text, result_doc_text, readed)
VALUES (6, 'normal', 'Continue monitoring. Report any chest discomfort, shortness of breath, or dizziness immediately.', 'HRV parameters (SDNN, RMSSD, pNN50, LF/HF) within normal ranges. No acute indicators observed. Consider reviewing clinical history if symptoms emerge.', 'false')

