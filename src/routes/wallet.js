import express from 'express';
import {
  getWalletData,
  postAddExpense,
  postAddWallet,
  putEditExpense,
} from '../controllers/index.js';

export const walletRouter = express.Router();

walletRouter.get('/wallets', getWalletData);
walletRouter.post('/wallets/add-wallet', postAddWallet);
walletRouter.post('/wallets/add-expense', postAddExpense);
walletRouter.put('/wallets/edit-expense', putEditExpense);
