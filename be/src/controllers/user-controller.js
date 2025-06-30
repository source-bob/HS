import {
  getAllUsers,
  getDocPatients,
  selectUserByStatusAndId,
  addUser,
  loadPatientData,
  deleteUserByID
} from '../models/user-model.js';
import bcrypt from 'bcryptjs';

const getUsers = async (req, res) => {
  const users = await getAllUsers();

  if(!users.error) {
    res.json(users);
  } else {
    res.status(500);
    res.json(users);
  }
};

const patientData = async (req, res, next) => {
  const userData = req.body;
  userData.user_id = req.params.id;
  console.log(userData);
  console.log(req.params.id);

  try {
    const result = await loadPatientData(userData);

    if (!result || result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json({ message: 'Add data added', userId: result.insertId });
  } catch (e) {
    next(e);
  }
};

const newUser = async (req, res, next) => {
  console.log(req.body);
  const { name, surname, birthday, ht, phone, email, pass, user_type, creator_id } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    const newUser = {
      name,
      surname,
      birthday,
      ht,
      phone,
      email,
      pass: hashedPassword,
      user_type,
      creator_id
    };

    console.log('New user:', newUser);

    const result = await addUser(newUser);

    if (!result || result.error) {
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json({ message: 'User added', userId: result.insertId });
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  console.log('delete');

  try {
    const deletedUser = await deleteUserByID(req.params.id);

    if (!deletedUser || deletedUser.error) {
      return res.status(500).json({ error: deletedUser.error });
    }

    res.status(201).json({ message: 'User deleted' });
  } catch (e) {
    next(e);
  }
};

const getPatients = async (req, res, next) => {

  try {
    const patients = await getDocPatients(req.params.id);
    if (patients) {
      res.json(patients);
    } else {
      res.status(404).json({message: 'no patients'});
    }
  } catch (e) {
    next(e);
  }
};

const getUserByStatusAndId = async (req, res) => {
  const { status, id } = req.params;

  if (!status || !id) {
    return res.status(400).json({ error: 'Missing status or id' });
  }

  try {
    const user = await selectUserByStatusAndId(status, id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};



export { getUsers, getPatients, getUserByStatusAndId, newUser, patientData, deleteUser };
