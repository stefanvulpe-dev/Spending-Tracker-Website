import express from 'express';
import {
  getLogin,
  postLogin,
  getSignUp,
  postSignUp,
  getLogOut,
} from '../controllers/index.js';

export const authRouter = express.Router();

authRouter.get('/signup', getSignUp);
authRouter.post('/signup', postSignUp);
authRouter.get('/login', getLogin);
authRouter.post('/login', postLogin);
authRouter.get('/logout', getLogOut);
