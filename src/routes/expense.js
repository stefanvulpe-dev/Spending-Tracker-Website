import express from 'express';
import {
  postAddExpense,
  putEditExpense,
  deleteExpense,
  getExpense,
} from '../controllers/index.js';

export const expenseRouter = express.Router();

expenseRouter.get('/expenses', getExpense);
expenseRouter.post('/expenses/add-expense', postAddExpense);
expenseRouter.put('/expenses/edit-expense', putEditExpense);
expenseRouter.delete('/expenses/delete-expense', deleteExpense);
