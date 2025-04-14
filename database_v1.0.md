```mermaid
graph LR;
subgraph Patients
A[patient_id INT 
AUTO_INCRIMENT PK]
B[username]
D[nimi]
E[sukunimi]
F[dateofbirth]
G[henkilotunnus]
H[puhelin]
I[mail]
J[pass]
HA[dateofreg DATE]
HB[docs_id]
end

subgraph PatientRecomm
K[rec_id PK INT]
L[rec_date DATE]
M[patient_id INT FK]
O[rec_text VARCHAR150]
end

subgraph PatientResults
P[res_id PK INT]
R[res_date DATE]
S[patient_id INT]
T[status VARCHAR10]
Q[res_text VARCHAR150]
end

subgraph Doctors
U[doc_id]
V[doc_username]
W[doc_pass]
X[doc_name]
Y[doc_surname]
Z[doc_email]
ZA[doc_puhelin]
ZB[doc_date]
ZC[doc_henkilotunnus]
end

subgraph Admins
SA[id PK]
SB[username]
SC[name]
SD[surname]
SE[dateOfBirth]
SF[dateOfReg]
SG[admin_mail]
SH[admin_henkilotunnus]
end

M -->|FK| A
S -->|FK| A
HB --> U