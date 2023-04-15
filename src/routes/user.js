import express from 'express';
import { getUserDetails } from '../controllers/index.js';

export const userRouter = express.Router();

userRouter.get('/users', getUserDetails);
