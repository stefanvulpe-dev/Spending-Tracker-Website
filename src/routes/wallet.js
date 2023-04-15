import express from 'express';
import {
  getWalletsData,
  postAddExpense,
  postAddWallet,
} from '../controllers/index.js';

export const walletRouter = express.Router();

walletRouter.get('/wallets', getWalletsData);
walletRouter.post('/wallets/add-wallet', postAddWallet);
walletRouter.post('/wallets/add-expense', postAddExpense);
