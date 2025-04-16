DROP DATABASE if EXISTS heartshield;
CREATE DATABASE heartshield;
USE heartshield;

CREATE TABLE allusers (
user_id							INT				UNIQUE PRIMARY KEY,
user_email						VARCHAR(100)	NOT NULL UNIQUE,
user_password					VARCHAR(250)	NOT NULL,
user_type						VARCHAR(3)		NOT NULL
);

CREATE TABLE doctors (
doc_id							INT				PRIMARY KEY,
doc_name						VARCHAR(50)		NOT NULL,
doc_surname						VARCHAR(50)		NOT NULL,
doc_henkilotunnus				VARCHAR(15)		NOT NULL UNIQUE,
doc_phone						VARCHAR(20)		NOT NULL UNIQUE,
doc_dateofbirth				    DATE			NOT NULL,
doc_dateofregistration		    DATETIME		DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (doc_id) REFERENCES allusers(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
admin_id						INT				PRIMARY KEY,
admin_name						VARCHAR(50)		NOT NULL,
admin_surname					VARCHAR(50)		NOT NULL,
admin_henkilotunnus			    VARCHAR(15)		NOT NULL UNIQUE,
admin_phone						VARCHAR(20)		NOT NULL UNIQUE,
admin_dateofbirth				DATE			NOT NULL,
admin_dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (admin_id) REFERENCES allusers(user_id) ON DELETE CASCADE
);

CREATE TABLE patients (
patient_id						INT				PRIMARY KEY,
patient_name					VARCHAR(50)		NOT NULL,
patient_surname				    VARCHAR(50)		NOT NULL,
patient_henkilotunnus		    VARCHAR(15)		NOT NULL UNIQUE,
patient_phone					VARCHAR(20)		NOT NULL UNIQUE,
patient_dateofbirth			    DATE			NOT NULL,
patient_dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP,
patient_doc						INT				NOT NULL,
FOREIGN KEY (patient_id) REFERENCES allusers(user_id) ON DELETE CASCADE,
FOREIGN KEY (patient_doc) REFERENCES doctors(doc_id)
);

CREATE TABLE patientrecomm (
rec_id							INT				AUTO_INCREMENT PRIMARY KEY,
rec_date						DATETIME		DEFAULT CURRENT_TIMESTAMP,
rec_patientid					INT				NOT NULL,
rec_text						VARCHAR(200)	NOT NULL,
FOREIGN KEY (rec_patientid) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE patientresult (
res_id							INT				AUTO_INCREMENT PRIMARY KEY,
res_date						DATETIME		DEFAULT CURRENT_TIMESTAMP,
res_patientid					INT				NOT NULL,
res_status						VARCHAR(15)		NOT NULL,
res_text						VARCHAR(200)	NOT NULL,
FOREIGN KEY (res_patientid) REFERENCES patients(patient_id) ON DELETE CASCADE
);

INSERT INTO allusers (user_id, user_email, user_password, user_type)
VALUES (1840, 'adalovelace@example.com', '$2b$10$MXIpfGHiq20TO2/kJxX8deV5Pr2g0WjUbVbY.Ou9U.5U/QY2RMPWu', 'adm');
INSERT INTO admins (admin_id, admin_name, admin_surname, admin_henkilotunnus, admin_phone, admin_dateofbirth)
VALUES (1840, 'Ada', 'Lovelace', '101215-L', '184 307 1852', 10/12/1815);

INSERT INTO allusers (user_id, user_email, user_password, user_type)
VALUES (1936, 'walterfreeman@example.com', '$2b$10$rON4U8GU4VC3OtAJA/byOOLvdKn0urjzjwMi3EKCVt9sEstWQTsB2', 'doc');
INSERT INTO doctors (doc_id, doc_name, doc_surname, doc_henkilotunnus, doc_phone, doc_dateofbirth)
VALUES (1936, 'Walter', 'Freeman', '141195-F', '350 010 1967', 14/11/1895);

INSERT INTO allusers (user_id, user_email, user_password, user_type)
VALUES (1959, 'johnnash@example.com', '$2b$10$TnjBMPRVFQCH3DsDXHLhieAlKouN9AH6YkYEiTw7zj2PsEPKKA0Fm', 'pot');
INSERT INTO patients (patient_id, patient_name, patient_surname, patient_henkilotunnus, patient_phone, patient_dateofbirth, patient_doc)
VALUES (1959, 'John', 'Nash', '130628-N', '195 027 2015', 13/06/1928, 1936);
