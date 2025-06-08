import { getAllUsers, getDocPatients, selectUserByStatusAndId } from '../models/user-model.js';

const getUsers = async (req, res) => {
  const users = await getAllUsers();

  if(!users.error) {
    res.json(users);
  } else {
    res.status(500);
    res.json(users);
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



export { getUsers, getPatients, getUserByStatusAndId };
