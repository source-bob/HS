DROP DATABASE if EXISTS heartshield;
CREATE DATABASE heartshield;
USE heartshield;

CREATE TABLE patients (
patient_id						INT				AUTO_INCREMENT PRIMARY KEY,
patient_mail					VARCHAR(100)	NOT NULL UNIQUE,
patient_pass					VARCHAR(250)	NOT NULL,
patient_name					VARCHAR(50)		NOT NULL,
patient_surname				    VARCHAR(50)		NOT NULL,
patient_henkilotunnus		    VARCHAR(15)		NOT NULL UNIQUE,
patient_phone					VARCHAR(20)		NOT NULL UNIQUE,
patient_dateofbirth			    DATE			NOT NULL,
patient_dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP,
patient_doc						INT				NOT NULL,
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

CREATE TABLE doctors (
doc_id							INT				AUTO_INCREMENT PRIMARY KEY,
doc_email						VARCHAR(100)	NOT NULL UNIQUE,
doc_pass						VARCHAR(250)	NOT NULL,
doc_name						VARCHAR(50)		NOT NULL,
doc_surname						VARCHAR(50)		NOT NULL,
doc_henkilotunnus				VARCHAR(15)		NOT NULL UNIQUE,
doc_phone						VARCHAR(20)		NOT NULL UNIQUE,
doc_dateofbirth				    DATE			NOT NULL,
doc_dateofregistration		    DATETIME		DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
admin_id						INT				AUTO_INCREMENT PRIMARY KEY,
admin_email						VARCHAR(100)	NOT NULL UNIQUE,
admin_pass						VARCHAR(250)	NOT NULL,
admin_name						VARCHAR(50)		NOT NULL,
admin_surname					VARCHAR(50)		NOT NULL,
admin_henkilotunnus			    VARCHAR(15)		NOT NULL UNIQUE,
admin_phone						VARCHAR(20)		NOT NULL UNIQUE,
admin_dateofbirth				DATE			NOT NULL,
admin_dateofregistration	    DATETIME		DEFAULT CURRENT_TIMESTAMP
);
