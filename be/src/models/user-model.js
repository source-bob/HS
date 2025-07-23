import promisePool from '../utils/database.js';
import 'dotenv/config';

/*const selectUserByEmailAndPassword = async (email, password) => {
  try {
    const [rows] = await promisePool.query(
      ```SELECT user_id,
      username,
      email,
      registered_at,
      user_level FROM Users
      WHERE email=? AND password=?```,
      [email, password],
    );
    console.log(rows);
    return rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};*/

/*const getUser = async (userId) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT user_id, user_type from allusers WHERE user_id = ${userId}`);
      return rows[0];
  } catch (e) {
    console.error(e);
    throw new Error('database error');
  }
};*/

const selectUserByEmail = async (email) => {
  try {
    const [rows] = await promisePool.query(
      `SELECT user_id,
      user_email,
      user_password,
      user_type
      FROM allusers WHERE user_email=?`,
      [email],
    );
    console.log(rows);
    return rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

const addUser = async (userData) => {
  const { name, surname, birthday, ht, phone, email, pass, user_type, creator_id } = userData;

  const mainResult = await loadMainData([email, pass, user_type]);

  if (mainResult.error) {
    console.error('Error inserting main user data:', mainResult.error);
    return { error: mainResult.error };
  }

  const userID = mainResult.insertId;
  console.log('Inserted user ID:', userID);

  // Сохраняем доп. данные в соответствующую таблицу
  const addDataResult = await loadAddData({
    userID,
    name,
    surname,
    birthday,
    ht,
    phone,
    user_type,
    creator_id
  });

  if (addDataResult.error) {
    return { error: addDataResult.error };
  }

  return { insertId: userID };
};


const loadMainData = async (data) => {
  const sql = `
  INSERT INTO allusers (user_email, user_password, user_type)
  VALUES (?, ?, ?)`;

  try {
    const [result] = await promisePool.query(sql, data);

    console.log('Insert result:', result);

    if (result.affectedRows === 1) {
      console.log('user now in database');
      return { insertId: result.insertId };
    } else {
      return { error: 'user was not inserted' };
    }
  } catch (e) {
    console.error('MySQL error:', e.message);
    return {error: e.message};
  }
};

const loadAddData = async ({ userID, name, surname, birthday, ht, phone, user_type, creator_id }) => {
  const tableMap = {
    pot: 'patients',
    doc: 'doctors',
    adm: 'admins'
  };

  const tableName = tableMap[user_type];

  if (!tableName) {
    return { error: 'Unknown user type' };
  }

  // Строим SQL и параметры для каждого типа
  let sql, params;

  if (user_type === 'pot') {
    sql = `
      INSERT INTO ${tableName} (id, name, surname, henkilotunnus, phone, dateofbirth, doc)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    params = [userID, name, surname, ht, phone, birthday, creator_id];
  } else {
    sql = `
      INSERT INTO ${tableName} (id, name, surname, henkilotunnus, phone, dateofbirth)
      VALUES (?, ?, ?, ?, ?, ?)`;
    params = [userID, name, surname, ht, phone, birthday];
  }

  try {
    const [result] = await promisePool.query(sql, params);

    if (result.affectedRows === 1) {
      console.log(`Additional data inserted into ${tableName}`);
      return { success: true };
    } else {
      return { error: `Failed to insert into ${tableName}` };
    }
  } catch (e) {
    console.error(`MySQL error while inserting into ${tableName}:`, e.message);
    return { error: e.message };
  }
};

const deleteUserByID = async (userID) => {
  console.log('USER MODEL:', userID);

  const sql = `DELETE FROM allusers WHERE user_id = ?`;
  const params = [userID];

  try {
    const [result] = await promisePool.query(sql, params);

    if (result.affectedRows === 1) {
      console.log('User deleted');
      return true;
    } else {
      return { error: 'Failed to delete user' };
    }
  } catch (e) {
    console.error(`MySQL error:`, e.message);
    return { error: e.message };
  }
};

const loadPatientData = async (data) => {
  console.log('PATIENT ADD DATA:', data);
  const { age, mi_date, pills, user_id } = data;

  const sql = `
  INSERT INTO pat_data (pat_id, age, mi_date, pills)
  VALUES (?, ?, ?, ?)`;
  const params = [user_id, age, mi_date, pills];

  try {
    const [result] = await promisePool.query(sql, params);

    if (result.affectedRows === 1) {
      console.log(`Additional data inserted`);
      return true;
    } else {
      return { error: `Failed to insert add data` };
    }
  } catch (e) {
    console.error(`MySQL error:`, e.message);
    return { error: e.message };
  }
};

const loadRecomDB = async (userID ,textData) => {
  const sql = `
    INSERT INTO patientrecomm (rec_patientid, rec_text)
    VALUES (?, ?)`;
  const params = [userID, textData];
  try {
    const [result] = await promisePool.query(sql, params);
    if (result.affectedRows === 1) {
      return true;
    } else {
      return { error: 'Failed to insert recomm.' };
    }
  } catch (e) {
    console.error('error:', e.message);
    return { error: e.message };
  }
};

const getUserData = async (userID) => {
  try {
    const sql = `SELECT * FROM allusers WHERE user_id = ?`;
    const params = [userID];

    const [result] = await promisePool.query(sql, params);
    const addData = await selectUserByStatusAndId(result[0].user_type, userID);

    const mainData = {
      userID: result[0].user_id,
      userEmail: result[0].user_email,
      userType: result[0].user_type
    }

    console.log(addData);

    return {mainData: mainData, addData: addData };
  } catch (e) {
    console.error('error:', e.message);
    return { error: e.message };
  }
};

const getPatientRecom = async (patID) => {
  try {
    const sql = `
    SELECT * FROM patientrecomm
    WHERE rec_patientid = ?
    ORDER BY rec_date DESC`;

    const options = [patID];

    const [result] = await promisePool.query(sql, options);

    return result;
  } catch (e) {
    console.error('error', e.message);
    return { error: e.message };
  }
};

const getPatAddInfo = async (patID) => {
  console.log(patID);
  try {
    const sql = `
    SELECT * FROM pat_data
    WHERE pat_id = ?`;

    const params = [patID];

    const [result] =  await promisePool.query(sql, params);
    return result[0];
  } catch (e) {
    console.error('error', e.message);
    return { error: e.message };
  }
};

const getAllUsers = async () => {
  try {
    const [users] = await promisePool.query(`
      SELECT
        u.user_id,
        u.user_type,
        CASE
          WHEN u.user_type = 'pot' THEN p.name
          WHEN u.user_type = 'doc' THEN d.name
          WHEN u.user_type = 'adm' THEN a.name
        END AS first_name,
        CASE
          WHEN u.user_type = 'pot' THEN p.surname
          WHEN u.user_type = 'doc' THEN d.surname
          WHEN u.user_type = 'adm' THEN a.surname
        END AS last_name
      FROM allusers u
      LEFT JOIN patients p ON u.user_id = p.id
      LEFT JOIN doctors d ON u.user_id = d.id
      LEFT JOIN admins a ON u.user_id = a.id;
      `);

    return users;
  } catch (e) {
    console.error('error', e.message);
    return { error: e.message };
  }
};

const getDocPatients = async (id) => {
  try {
    const [patients] = await promisePool.query(
      'SELECT * FROM patients WHERE doc = ?', [id]
    );
    console.log('patients', patients);
    return patients;
  } catch (e) {
    console.error('error', e.message);
    return {error: e.message};
  }
};

const selectUserByStatusAndId = async (status, id) => {
  let table;
  if (status === 'doc') table = 'doctors';
  else if (status === 'pot') table = 'patients';
  else if (status === 'adm') table = 'admins';
  else throw new Error('Invalid status');

  const [rows] = await promisePool.query(
    `SELECT * FROM ${table} WHERE id = ?`,
    [id]
  );

  return rows[0];
};

export {
  getUserData,
  loadRecomDB,
  getPatientRecom,
  getPatAddInfo,
  selectUserByEmail,
  getAllUsers,
  getDocPatients,
  selectUserByStatusAndId,
  addUser,
  loadPatientData,
  deleteUserByID
};
