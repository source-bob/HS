import jwt from 'jsonwebtoken';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const authenticateToken = (req, res, next) => {
  console.log('authenticateToken', req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('token', token);
  if (token == undefined) {
    return res.sendStatus(401);
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error('error', error);
    res.status = 403;
    next(error);
  }
};

const crypt = async (word, next) => {
  console.log('MOI2');
  try {
    console.log('MOI');
    const salt = await bcrypt.genSalt(10);
    const hashedWord = await bcrypt.hash(word, salt);
    return hashedWord;
  } catch (e) {
    next(e)
  }
};

export { authenticateToken, crypt };
