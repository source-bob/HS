import promisePool from '../utils/database.js';

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

export { selectUserByEmail, getAllUsers, getDocPatients, selectUserByStatusAndId };
