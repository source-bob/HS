import express from 'express';
import { body, param } from 'express-validator';
import { validationErrorHandler } from '../middlewares/error-handler.js';

import {
  getUsers,
  getPatients,
  getUserByStatusAndId,
  newUser,
  patientData,
  deleteUser,
  getPatientInfo,
  getPatRecomm,
  savePatRecomm,
  getUserInfo
} from '../controllers/user-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';

const userRouter = express.Router();

userRouter.route('/')
  .get(authenticateToken, getUsers)
  .post(
    authenticateToken,
    body('name').trim().isLength({min: 2, max: 25}).isAlpha().withMessage('Name must contain only letters'),
    body('surname').trim().isLength({min: 2, max: 25}).isAlpha().withMessage('Surname must contain only letters'),
    body('email').trim().isEmail().withMessage('Invalid email'),
    body('ht').trim().isLength({min: 10, max: 10}).isAlphanumeric().withMessage('HT must be 11 digits XXXXXX-XXXX'),
    body('phone').trim().isLength({min: 10, max: 13}).isNumeric().withMessage('Phone must be numeric 0116331166 OR +358116331166'),
    body('pass').trim().isLength({min: 6}).isAlphanumeric().withMessage('Password must be alphanumeric'),
    body('user_type').trim().isLength({min: 3}).isAlpha().withMessage('User type must be doc/pot/adm'),
    body('birthday').trim().isLength({min: 10}).withMessage('Wrong date value.'),
    validationErrorHandler,
    newUser
  );

userRouter.route('/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('User ID must be an integer'),
    validationErrorHandler,
    getPatients
  )
  .post(
    authenticateToken,
    body('age').trim().isLength({min: 1, max: 3}).isNumeric().withMessage('age value 1-999'),
    body('mi_date').trim().isLength({min: 10}).withMessage('Wrong date value.'),
    body('pills').trim().isLength({min: 2, max: 100}).isAlphanumeric().withMessage('Wrong lääke value'),
    validationErrorHandler,
    patientData
  )
  .delete(
    authenticateToken,
    param('id').isInt().withMessage('User ID must be an integer'),
    validationErrorHandler,
    deleteUser
  );

userRouter.route('/admin/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('User ID must be an integer'),
    validationErrorHandler,
    getUserInfo
  );

userRouter.route('/info/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('User ID must be an integer'),
    validationErrorHandler,
    getPatientInfo
  );

userRouter.route('/recom/:id')
  .get(
    authenticateToken,
    param('id').isInt().withMessage('User ID must be an integer'),
    validationErrorHandler,
    getPatRecomm
  )
  .post(
    authenticateToken,
    param('id').isInt().withMessage('User ID must be an integer'),
    body('textData').trim().isLength({min: 3, max: 150}).withMessage('Recommendation text must be 3-150 characters'),
    validationErrorHandler,
    savePatRecomm
  );

userRouter.route('/:status/:id')
  .get(
    authenticateToken,
    param('status').isIn(['doc', 'pot', 'adm']).withMessage('Status must be one of: doc, pot, adm'),
    param('id').isInt().withMessage('User ID must be an integer'),
    getUserByStatusAndId
  );

export default userRouter;
