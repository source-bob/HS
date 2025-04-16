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

export { selectUserByEmail };
