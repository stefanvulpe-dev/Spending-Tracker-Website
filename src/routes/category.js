import express from 'express';
import { getCategories, postAddCategory } from '../controllers/index.js';

export const categoryRouter = express.Router();

categoryRouter.get('/categories', getCategories);
categoryRouter.post('/categories/add-category', postAddCategory);
