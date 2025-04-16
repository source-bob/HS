import jwt from 'jsonwebtoken';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { selectUserByEmail } from '../models/user-model.js';

// user authentication (login)
const login = async (req, res) => {

    const {user_email, user_password} = req.body;

    if (!user_email) {
      return res.status(401).json({message: 'Email missing.'});
    }
    const user = await selectUserByEmail(user_email);
    // jos käyttäjä löytyi tietokannasta verrataan kirjautumiseen syötettyä sanaa tietokannan
    // salasanatiivisteeseen
    if (user) {
      const match = await bcrypt.compare(user_password, user.user_password);
      if (match) {
        delete user.user_password;
        const token = jwt.sign(user, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return res.json({message: 'login ok', user, token});
      }
    }
    res.status(401).json({message: 'Bad username/password.'});
};

const getMe = async (req, res) => {
  console.log('getMe', req.user);
  if (req.user) {
    delete req.user.password;
    res.json({message: 'token ok', user: req.user});
  } else {
    res.sendStatus(401);
  }
};

export { login, getMe };
