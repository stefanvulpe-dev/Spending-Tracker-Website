import express from 'express';
import { postAddCategory } from '../controllers/index.js';

export const categoryRouter = express.Router();

categoryRouter.post('/categories/add-category', postAddCategory);
